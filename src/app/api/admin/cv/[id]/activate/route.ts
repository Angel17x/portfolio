import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"
import { logCRUDAction } from "@/lib/log-helper"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "ID de CV requerido" }, { status: 400 })
    }
    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 })
    }

    // Desactivar todos los CVs primero
    const allCVs = await db.collection("generatedCVs").get()
    const batch = db.batch()
    allCVs.docs.forEach((doc) => {
      batch.update(doc.ref, { isActive: false })
    })
    await batch.commit()

    // Activar el CV seleccionado
    const cvRef = db.collection("generatedCVs").doc(id)
    const cvDoc = await cvRef.get()

    if (!cvDoc.exists) {
      return NextResponse.json({ error: "CV no encontrado" }, { status: 404 })
    }

    await cvRef.update({
      isActive: true,
      activatedAt: new Date(),
    })

    // Log de la acción
    try {
      await logCRUDAction(request, "update", "generatedCVs", id, {
        action: "activate",
        fileName: cvDoc.data()?.fileName,
      })
    } catch (logError) {
      console.error("Error registrando acción:", logError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error activando CV:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al activar CV" },
      { status: 500 }
    )
  }
}
