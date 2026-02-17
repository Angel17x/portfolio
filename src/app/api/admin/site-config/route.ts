import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"
import { SiteConfigSchema } from "@/lib/validations/site-config-schemas"
import { logCRUDAction } from "@/lib/log-helper"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin no está configurado" }, { status: 500 })
    }

    const doc = await db.collection("siteConfig").doc("main").get()

    if (!doc.exists) {
      // Retornar valores por defecto
      return NextResponse.json({
        data: {
          title: "Angel Lugo | Desarrollador Full Stack",
          description:
            "Portafolio de Angel Lugo - Desarrollador Full Stack especializado en JavaScript, React, Node.js, Angular, Flutter y microservicios",
          faviconUrl: "",
          cvUrl: "",
        },
      })
    }

    return NextResponse.json({ data: doc.data() })
  } catch (error) {
    console.error("Error obteniendo configuración del sitio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const validatedData = SiteConfigSchema.parse(body)

    await db.collection("siteConfig").doc("main").set(validatedData)

    // Registrar acción
    await logCRUDAction(request, "update", "siteConfig", "main", validatedData)

    return NextResponse.json({ success: true, data: validatedData })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error }, { status: 400 })
    }
    console.error("Error actualizando configuración del sitio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
