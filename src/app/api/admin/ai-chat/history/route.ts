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
      return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 })
    }

    // Obtener historial de conversaciones del usuario (últimos 100 mensajes)
    const historyRef = db.collection("aiChatHistory")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(100) // Últimos 100 mensajes para tener suficiente historial

    const snapshot = await historyRef.get()
    const conversations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({
      success: true,
      data: conversations,
    })
  } catch (error: any) {
    // Si el error es por índice faltante, devolver array vacío (sin log para no saturar consola)
    if (error?.code === 9 || error?.message?.includes("index")) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }
    
    console.error("Error obteniendo historial:", error)
    return NextResponse.json(
      { error: "Error al obtener historial" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("id")

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 })
    }

    if (conversationId) {
      // Eliminar todos los mensajes de una conversación específica
      const historyRef = db.collection("aiChatHistory")
        .where("userId", "==", user.uid)
        .where("conversationId", "==", conversationId)

      const snapshot = await historyRef.get()
      
      if (snapshot.empty) {
        return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 })
      }

      // Eliminar todos los mensajes de la conversación
      const batch = db.batch()
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()
    } else {
      // Eliminar todo el historial del usuario
      const historyRef = db.collection("aiChatHistory")
        .where("userId", "==", user.uid)

      const snapshot = await historyRef.get()
      const batch = db.batch()
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando historial:", error)
    return NextResponse.json(
      { error: "Error al eliminar historial" },
      { status: 500 }
    )
  }
}
