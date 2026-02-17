import { NextRequest, NextResponse } from "next/server"
import { getAdminStorage } from "@/lib/firebase-admin"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const filePath = path.join("/")

    if (!filePath) {
      return NextResponse.json({ error: "Ruta de archivo requerida" }, { status: 400 })
    }

    const storage = getAdminStorage()
    if (!storage) {
      return NextResponse.json({ error: "Firebase Storage no está configurado" }, { status: 500 })
    }

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    if (!bucketName) {
      return NextResponse.json({ error: "Storage bucket no está configurado" }, { status: 500 })
    }

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(filePath)

    // Verificar si el archivo existe
    const [exists] = await file.exists()
    if (!exists) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    // Obtener los metadatos del archivo
    const [metadata] = await file.getMetadata()

    // Descargar el archivo
    const [buffer] = await file.download()

    // Retornar el archivo con los headers correctos
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${metadata.name?.split("/").pop() || "file"}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error obteniendo archivo:", error)
    return NextResponse.json({ error: "Error al obtener el archivo" }, { status: 500 })
  }
}
