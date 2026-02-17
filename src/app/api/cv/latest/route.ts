import { NextRequest, NextResponse } from "next/server"
import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase no configurado" }, { status: 500 })
    }

    // Priorizar CV marcado como isActive (visible en la web)
    const activeSnapshot = await db
      .collection("generatedCVs")
      .where("isActive", "==", true)
      .orderBy("generatedAt", "desc")
      .limit(1)
      .get()

    if (!activeSnapshot.empty) {
      const cvData = activeSnapshot.docs[0].data()
      return NextResponse.json({
        url: cvData.url,
        fileName: cvData.fileName,
        generatedAt: cvData.generatedAt?.toDate?.()?.toISOString() || cvData.generatedAt,
      })
    }

    // Si no hay CV activo, buscar el marcado como isLatest
    const latestSnapshot = await db
      .collection("generatedCVs")
      .where("isLatest", "==", true)
      .limit(1)
      .get()

    if (!latestSnapshot.empty) {
      const cvData = latestSnapshot.docs[0].data()
      return NextResponse.json({
        url: cvData.url,
        fileName: cvData.fileName,
        generatedAt: cvData.generatedAt?.toDate?.()?.toISOString() || cvData.generatedAt,
      })
    }

    // Si no hay CV latest, obtener el más reciente
    const recentSnapshot = await db
      .collection("generatedCVs")
      .orderBy("generatedAt", "desc")
      .limit(1)
      .get()

    if (recentSnapshot.empty) {
      return NextResponse.json({ error: "No hay CV disponible" }, { status: 404 })
    }

    const cvData = recentSnapshot.docs[0].data()
    return NextResponse.json({
      url: cvData.url,
      fileName: cvData.fileName,
      generatedAt: cvData.generatedAt?.toDate?.()?.toISOString() || cvData.generatedAt,
    })
  } catch (error) {
    console.error("Error obteniendo último CV:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener CV" },
      { status: 500 }
    )
  }
}
