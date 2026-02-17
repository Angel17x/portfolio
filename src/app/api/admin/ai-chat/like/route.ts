import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Contenido requerido" }, { status: 400 })
    }

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 })
    }

    const snippet = content.length > 2000 ? content.slice(0, 2000) + "…" : content

    await db.collection("aiChatLikes").add({
      userId: user.uid,
      contentSnippet: snippet,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error guardando like:", error)
    return NextResponse.json(
      { error: "Error al guardar preferencia" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ success: true, data: [] })
    }

    const snapshot = await db
      .collection("aiChatLikes")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get()

    const likes = snapshot.docs.map((doc) => ({
      id: doc.id,
      contentSnippet: doc.data().contentSnippet,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? doc.data().createdAt,
    }))

    return NextResponse.json({ success: true, data: likes })
  } catch (error) {
    console.error("Error obteniendo likes:", error)
    return NextResponse.json({ success: true, data: [] })
  }
}
