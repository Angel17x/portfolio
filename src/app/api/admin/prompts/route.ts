import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"
import { PromptConfigSchema } from "@/lib/validations/prompt-schemas"
import { z } from "zod"

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

    const doc = await db.collection("promptConfig").doc("main").get()
    
    if (doc.exists) {
      return NextResponse.json({ success: true, data: doc.data() })
    }

    // Retornar valores por defecto si no existe configuración
    const defaultConfig = PromptConfigSchema.parse({})
    return NextResponse.json({ success: true, data: defaultConfig })
  } catch (error) {
    console.error("Error obteniendo configuración de prompts:", error)
    return NextResponse.json(
      { error: "Error al obtener configuración" },
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

    const body = await request.json()
    const validatedData = PromptConfigSchema.parse(body)

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Base de datos no disponible" }, { status: 500 })
    }

    await db.collection("promptConfig").doc("main").set({
      ...validatedData,
      updatedAt: new Date(),
      updatedBy: user.uid,
    })

    return NextResponse.json({ success: true, data: validatedData })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error guardando configuración de prompts:", error)
    return NextResponse.json(
      { error: "Error al guardar configuración" },
      { status: 500 }
    )
  }
}
