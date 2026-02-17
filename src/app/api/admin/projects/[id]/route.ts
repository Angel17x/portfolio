import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"
import { ProjectSchema } from "@/lib/validations/portfolio-schemas"
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
    const doc = await db.collection("projects").doc(id).get()

    if (!doc.exists) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ data: { id: doc.id, ...doc.data() } })
  } catch (error) {
    console.error("Error obteniendo project:", error)
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
    const validatedData = ProjectSchema.parse(body)

    await db.collection("projects").doc(id).set(validatedData)

    // Registrar acción
    await logCRUDAction(request, "update", "projects", id, validatedData)

    return NextResponse.json({ success: true, data: validatedData })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error }, { status: 400 })
    }
    console.error("Error actualizando project:", error)
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
    await db.collection("projects").doc(id).delete()

    // Registrar acción
    await logCRUDAction(request, "delete", "projects", id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando project:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
