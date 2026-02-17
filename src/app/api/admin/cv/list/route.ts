import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase no configurado" }, { status: 500 })
    }

    const snapshot = await db
      .collection("generatedCVs")
      .orderBy("generatedAt", "desc")
      .get()

    const cvs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      generatedAt: doc.data().generatedAt?.toDate?.()?.toISOString() || doc.data().generatedAt,
    }))

    return NextResponse.json({ data: cvs })
  } catch (error) {
    console.error("Error obteniendo CVs:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener CVs" },
      { status: 500 }
    )
  }
}
