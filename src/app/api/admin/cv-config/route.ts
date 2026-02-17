import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"
import { CVConfigSchema } from "@/lib/validations/cv-config-schemas"

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

    const doc = await db.collection("cvConfig").doc("main").get()

    if (!doc.exists) {
      // Retornar configuración por defecto
      const defaultConfig = CVConfigSchema.parse({})
      return NextResponse.json({ data: defaultConfig })
    }

    const data = doc.data()
    const validated = CVConfigSchema.parse(data)
    return NextResponse.json({ data: validated })
  } catch (error) {
    console.error("Error obteniendo configuración de CV:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener configuración" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase no configurado" }, { status: 500 })
    }

    const body = await request.json()
    const validated = CVConfigSchema.parse(body)

    await db.collection("cvConfig").doc("main").set(validated, { merge: true })

    return NextResponse.json({ success: true, data: validated })
  } catch (error) {
    console.error("Error guardando configuración de CV:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al guardar configuración" },
      { status: 500 }
    )
  }
}
