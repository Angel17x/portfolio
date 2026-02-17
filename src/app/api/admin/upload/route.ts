import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminStorage } from "@/lib/firebase-admin"
import { checkRateLimit, isValidFileType, isValidFileSize } from "@/lib/security-helpers"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Rate limiting por usuario
    if (!checkRateLimit(user.uid, 10, 60000)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes de subida. Por favor espera un momento." },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = formData.get("folder") as string | null || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    // Validar nombre de archivo
    if (!file.name || file.name.length > 255) {
      return NextResponse.json({ error: "Nombre de archivo inválido" }, { status: 400 })
    }

    // Validar tipo de archivo según la carpeta
    if (folder === "cv") {
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Solo se permiten archivos PDF para CV" }, { status: 400 })
      }
      if (!isValidFileType(file.name, ["pdf"])) {
        return NextResponse.json({ error: "Extensión de archivo no permitida para CV" }, { status: 400 })
      }
    }
    
    if (folder === "favicon") {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Solo se permiten archivos de imagen para favicon" }, { status: 400 })
      }
      if (!isValidFileType(file.name, ["png", "jpg", "jpeg", "ico", "svg", "webp"])) {
        return NextResponse.json({ error: "Extensión de archivo no permitida para favicon" }, { status: 400 })
      }
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (!isValidFileSize(file.size, maxSize)) {
      return NextResponse.json({ error: "El archivo es demasiado grande (máximo 10MB)" }, { status: 400 })
    }

    const storage = getAdminStorage()
    if (!storage) {
      return NextResponse.json({ error: "Firebase Storage no está configurado" }, { status: 500 })
    }

    // Obtener el nombre del bucket desde las variables de entorno
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    if (!bucketName) {
      return NextResponse.json({ error: "Storage bucket no está configurado" }, { status: 500 })
    }

    const bucket = storage.bucket(bucketName)
    
    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileName = `${folder}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    
    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir archivo a Firebase Storage
    const fileRef = bucket.file(fileName)
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    })

    // Hacer el archivo público (opcional, puedes cambiarlo según tus necesidades)
    await fileRef.makePublic()

    // Obtener URL pública - usar proxy del dominio propio en producción
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    request.headers.get("origin") ||
                    `https://${request.headers.get("host") || "localhost:3000"}`
    
    // Si estamos en producción (no localhost), usar el proxy del dominio propio
    // Si no, usar la URL directa de Google Storage
    const isProduction = !baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1")
    const publicUrl = isProduction
      ? `${baseUrl}/api/files/${fileName}`
      : `https://storage.googleapis.com/${bucket.name}/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      // También retornar la URL directa por si la necesitas
      directUrl: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
    })
  } catch (error) {
    console.error("Error subiendo archivo:", error)
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("fileName")

    if (!fileName) {
      return NextResponse.json({ error: "Nombre de archivo requerido" }, { status: 400 })
    }

    const storage = getAdminStorage()
    if (!storage) {
      return NextResponse.json({ error: "Firebase Storage no está configurado" }, { status: 500 })
    }

    // Obtener el nombre del bucket desde las variables de entorno
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    if (!bucketName) {
      return NextResponse.json({ error: "Storage bucket no está configurado" }, { status: 500 })
    }

    const bucket = storage.bucket(bucketName)
    const fileRef = bucket.file(fileName)
    
    // Verificar si el archivo existe
    const [exists] = await fileRef.exists()
    if (!exists) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    await fileRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando archivo:", error)
    return NextResponse.json({ error: "Error al eliminar el archivo" }, { status: 500 })
  }
}
