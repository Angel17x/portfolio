import { NextRequest, NextResponse } from "next/server"
import { getAdminStorage } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const storage = getAdminStorage()
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

    if (!storage || !bucketName) {
      return NextResponse.json({ error: "Storage no configurado" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("file")

    if (!fileName) {
      return NextResponse.json({ error: "Nombre de archivo requerido" }, { status: 400 })
    }

    const bucket = storage.bucket(bucketName)
    const fileRef = bucket.file(fileName)

    const [exists] = await fileRef.exists()
    if (!exists) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    const [fileBuffer] = await fileRef.download()

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName.split("/").pop()}"`,
      },
    })
  } catch (error) {
    console.error("Error descargando CV:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al descargar CV" },
      { status: 500 }
    )
  }
}
