import { NextRequest, NextResponse } from "next/server"
import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase no configurado" }, { status: 500 })
    }

    // Priorizar CV marcado como isActive (visible en la web)
    let activeSnapshot
    try {
      activeSnapshot = await db
        .collection("generatedCVs")
        .where("isActive", "==", true)
        .orderBy("generatedAt", "desc")
        .limit(1)
        .get()
    } catch (indexError: any) {
      // Si falta el índice, intentar sin orderBy
      if (indexError?.code === 9 || indexError?.message?.includes("index")) {
        activeSnapshot = await db
          .collection("generatedCVs")
          .where("isActive", "==", true)
          .limit(1)
          .get()
      } else {
        throw indexError
      }
    }

    if (!activeSnapshot.empty) {
      const cvData = activeSnapshot.docs[0].data()
      return NextResponse.json({
        url: cvData.url,
        fileName: cvData.fileName,
        generatedAt: cvData.generatedAt?.toDate?.()?.toISOString() || cvData.generatedAt,
      })
    }

    // Si no hay CV activo, buscar el marcado como isLatest
    let latestSnapshot
    try {
      latestSnapshot = await db
        .collection("generatedCVs")
        .where("isLatest", "==", true)
        .orderBy("generatedAt", "desc")
        .limit(1)
        .get()
    } catch (indexError: any) {
      // Si falta el índice, intentar sin orderBy
      if (indexError?.code === 9 || indexError?.message?.includes("index")) {
        latestSnapshot = await db
          .collection("generatedCVs")
          .where("isLatest", "==", true)
          .limit(1)
          .get()
      } else {
        throw indexError
      }
    }

    if (!latestSnapshot.empty) {
      const cvData = latestSnapshot.docs[0].data()
      return NextResponse.json({
        url: cvData.url,
        fileName: cvData.fileName,
        generatedAt: cvData.generatedAt?.toDate?.()?.toISOString() || cvData.generatedAt,
      })
    }

    // Si no hay CV latest, obtener el más reciente
    let recentSnapshot
    try {
      recentSnapshot = await db
        .collection("generatedCVs")
        .orderBy("generatedAt", "desc")
        .limit(1)
        .get()
    } catch (indexError: any) {
      // Si falta el índice, obtener todos y ordenar en memoria
      if (indexError?.code === 9 || indexError?.message?.includes("index")) {
        const allCVs = await db.collection("generatedCVs").get()
        if (allCVs.empty) {
          return NextResponse.json({ error: "No hay CV disponible" }, { status: 404 })
        }
        // Ordenar por generatedAt en memoria
        const sortedCVs = allCVs.docs.sort((a, b) => {
          const dateA = a.data().generatedAt?.toDate?.() || new Date(0)
          const dateB = b.data().generatedAt?.toDate?.() || new Date(0)
          return dateB.getTime() - dateA.getTime()
        })
        const cvData = sortedCVs[0].data()
        return NextResponse.json({
          url: cvData.url,
          fileName: cvData.fileName,
          generatedAt: cvData.generatedAt?.toDate?.()?.toISOString() || cvData.generatedAt,
        })
      } else {
        throw indexError
      }
    }

    if (recentSnapshot.empty) {
      return NextResponse.json({ error: "No hay CV disponible" }, { status: 404 })
    }

    const cvData = recentSnapshot.docs[0].data()
    return NextResponse.json({
      url: cvData.url,
      fileName: cvData.fileName,
      generatedAt: cvData.generatedAt?.toDate?.()?.toISOString() || cvData.generatedAt,
    })
  } catch (error: any) {
    // Si el error es por índice faltante, devolver 404 en lugar de 500
    if (error?.code === 9 || error?.message?.includes("index")) {
      console.warn("Índice de Firestore faltante para generatedCVs. Ejecuta: npm run firestore:indexes")
      return NextResponse.json({ error: "No hay CV disponible" }, { status: 404 })
    }
    console.error("Error obteniendo último CV:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener CV" },
      { status: 500 }
    )
  }
}
