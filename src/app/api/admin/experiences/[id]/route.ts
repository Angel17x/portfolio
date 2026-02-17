import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"
import { ExperienceSchema } from "@/lib/validations/portfolio-schemas"
import { logCRUDAction } from "@/lib/log-helper"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin no está configurado" }, { status: 500 })
    }

    const { id } = await params
    const doc = await db.collection("experiences").doc(id).get()

    if (!doc.exists) {
      return NextResponse.json({ error: "Experiencia no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ data: { id: doc.id, ...doc.data() } })
  } catch (error) {
    console.error("Error obteniendo experience:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin no está configurado" }, { status: 500 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = ExperienceSchema.parse(body)

    await db.collection("experiences").doc(id).set(validatedData)

    // Registrar acción
    await logCRUDAction(request, "update", "experiences", id, validatedData)

    return NextResponse.json({ success: true, data: validatedData })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error }, { status: 400 })
    }
    console.error("Error actualizando experience:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin no está configurado" }, { status: 500 })
    }

    const { id } = await params
    await db.collection("experiences").doc(id).delete()

    // Registrar acción
    await logCRUDAction(request, "delete", "experiences", id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando experience:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
