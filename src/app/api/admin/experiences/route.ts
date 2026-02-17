import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"
import { ExperienceSchema } from "@/lib/validations/portfolio-schemas"
import { logCRUDAction } from "@/lib/log-helper"

export async function GET() {
  try {
    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin no está configurado" }, { status: 500 })
    }

    const snapshot = await db.collection("experiences").orderBy("order").get()
    const experiences = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ data: experiences })
  } catch (error) {
    console.error("Error obteniendo experiences:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin no está configurado" }, { status: 500 })
    }

    const body = await request.json()
    const validatedData = ExperienceSchema.parse(body)

    // Obtener el máximo order actual
    const snapshot = await db.collection("experiences").orderBy("order", "desc").limit(1).get()
    const maxOrder = snapshot.empty ? -1 : snapshot.docs[0].data().order || -1

    const dataWithOrder = {
      ...validatedData,
      order: body.order !== undefined ? body.order : maxOrder + 1,
    }

    const docRef = await db.collection("experiences").add(dataWithOrder)

    // Registrar acción
    await logCRUDAction(request, "create", "experiences", docRef.id, dataWithOrder)

    return NextResponse.json({ success: true, id: docRef.id, data: dataWithOrder })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error }, { status: 400 })
    }
    console.error("Error creando experience:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
