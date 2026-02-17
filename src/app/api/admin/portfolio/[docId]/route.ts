import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"
import { HeroSchema, AboutSchema, ContactSchema } from "@/lib/validations/portfolio-schemas"
import { logCRUDAction } from "@/lib/log-helper"

const schemas = {
  hero: HeroSchema,
  about: AboutSchema,
  contact: ContactSchema,
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
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

    const { docId } = await params
    const doc = await db.collection("portfolio").doc(docId).get()

    if (!doc.exists) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ data: doc.data() })
  } catch (error) {
    console.error("Error obteniendo documento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
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

    const { docId } = await params
    const body = await request.json()

    // Validar según el tipo de documento
    const schema = schemas[docId as keyof typeof schemas]
    if (!schema) {
      return NextResponse.json({ error: "Tipo de documento inválido" }, { status: 400 })
    }

    const validatedData = schema.parse(body)

    await db.collection("portfolio").doc(docId).set(validatedData)

    // Registrar acción
    await logCRUDAction(request, "update", "portfolio", docId, validatedData)

    return NextResponse.json({ success: true, data: validatedData })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error }, { status: 400 })
    }
    console.error("Error actualizando documento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
