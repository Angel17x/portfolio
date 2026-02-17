import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin"
import { logCRUDAction } from "@/lib/log-helper"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { id } = await params
    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase no configurado" }, { status: 500 })
    }

    // Obtener el documento del CV
    const cvDoc = await db.collection("generatedCVs").doc(id).get()
    if (!cvDoc.exists) {
      return NextResponse.json({ error: "CV no encontrado" }, { status: 404 })
    }

    const cvData = cvDoc.data()
    const fileName = cvData?.fileName

    // Eliminar de Storage si existe
    if (fileName) {
      try {
        const storage = getAdminStorage()
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        if (storage && bucketName) {
          const bucket = storage.bucket(bucketName)
          const fileRef = bucket.file(fileName)
          const [exists] = await fileRef.exists()
          if (exists) {
            await fileRef.delete()
          }
        }
      } catch (storageError) {
        console.error("Error eliminando archivo de Storage:", storageError)
        // Continuar aunque falle, al menos eliminar de Firestore
      }
    }

    // Si era el último CV activo, marcar otro como latest y activo
    // Usamos solo orderBy para no requerir índice compuesto; filtramos en memoria
    if (cvData?.isLatest || cvData?.isActive) {
      const allCVs = await db
        .collection("generatedCVs")
        .orderBy("generatedAt", "desc")
        .limit(20)
        .get()

      const otherDoc = allCVs.docs.find((d) => d.id !== id)
      if (otherDoc) {
        await otherDoc.ref.update({ isLatest: true, isActive: true })
      }
    }

    // Eliminar de Firestore
    await db.collection("generatedCVs").doc(id).delete()

    // Log de la acción
    await logCRUDAction(
      request,
      "delete",
      "generatedCVs",
      id,
      { template: cvData?.template }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando CV:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al eliminar CV" },
      { status: 500 }
    )
  }
}
