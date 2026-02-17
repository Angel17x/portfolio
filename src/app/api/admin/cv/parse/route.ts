import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminStorage, getAdminDb } from "@/lib/firebase-admin"
import pdf from "pdf-parse"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { cvUrl } = body

    if (!cvUrl || typeof cvUrl !== "string") {
      return NextResponse.json({ error: "URL del CV requerida" }, { status: 400 })
    }

    const storage = getAdminStorage()
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

    if (!storage || !bucketName) {
      return NextResponse.json({ error: "Storage no configurado" }, { status: 500 })
    }

    // Extraer el nombre del archivo de la URL
    // Formato esperado: https://storage.googleapis.com/... o gs://... o solo el path
    let fileName = cvUrl
    
    // Si es una URL completa de Firebase Storage
    if (cvUrl.includes("storage.googleapis.com")) {
      // Extraer el path del archivo de la URL completa
      const urlParts = cvUrl.split("/")
      const bucketIndex = urlParts.findIndex((part) => part.includes(bucketName))
      if (bucketIndex !== -1) {
        fileName = urlParts.slice(bucketIndex + 1).join("/")
      }
    } 
    // Si es una URL de la API proxy (formato: /api/files/cv/filename.pdf)
    else if (cvUrl.includes("/api/files/")) {
      fileName = cvUrl.replace("/api/files/", "")
    }
    // Si es una URL gs://
    else if (cvUrl.startsWith("gs://")) {
      fileName = cvUrl.replace(`gs://${bucketName}/`, "")
    } 
    // Si empieza con /, removerlo
    else if (cvUrl.startsWith("/")) {
      fileName = cvUrl.substring(1)
    }

    // Si el archivo está en la carpeta cv/, asegurarse de incluirla
    if (!fileName.startsWith("cv/") && !fileName.includes("/")) {
      fileName = `cv/${fileName}`
    }
    
    // Limpiar parámetros de query si existen
    if (fileName.includes("?")) {
      fileName = fileName.split("?")[0]
    }

    const bucket = storage.bucket(bucketName)
    const fileRef = bucket.file(fileName)

    const [exists] = await fileRef.exists()
    if (!exists) {
      return NextResponse.json(
        { error: `CV no encontrado en Storage: ${fileName}` },
        { status: 404 }
      )
    }

    // Descargar el PDF
    const [fileBuffer] = await fileRef.download()

    // Parsear el PDF
    const pdfData = await pdf(fileBuffer)
    const extractedText = pdfData.text

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "No se pudo extraer texto del PDF. Asegúrate de que el CV sea un PDF con texto (no solo imágenes)." },
        { status: 400 }
      )
    }

    // Guardar el texto extraído en Firestore para referencia futura
    const db = getAdminDb()
    if (db) {
      await db.collection("cvParsed").doc("latest").set({
        cvUrl,
        fileName,
        extractedText,
        parsedAt: new Date(),
        pageCount: pdfData.numpages,
        metadata: pdfData.info || {},
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        text: extractedText,
        pageCount: pdfData.numpages,
        metadata: pdfData.info || {},
      },
    })
  } catch (error) {
    console.error("Error parseando CV:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al parsear el CV. Asegúrate de que sea un PDF válido con texto.",
      },
      { status: 500 }
    )
  }
}
