import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"
import { ThemeColorsSchema } from "@/lib/validations/theme-schemas"
import { logCRUDAction } from "@/lib/log-helper"

export async function GET() {
  try {
    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin no está configurado" }, { status: 500 })
    }

    const doc = await db.collection("theme").doc("colors").get()

    if (!doc.exists) {
      // Retornar valores por defecto si no existe configuración
      return NextResponse.json({
        data: {
          light: {
            background: "oklch(0.98 0.02 160)",
            foreground: "oklch(0.22 0.04 250)",
            card: "oklch(1 0.01 160)",
            cardForeground: "oklch(0.22 0.04 250)",
            popover: "oklch(1 0.01 160)",
            popoverForeground: "oklch(0.22 0.04 250)",
            primary: "oklch(0.52 0.15 165)",
            primaryForeground: "oklch(0.98 0.02 160)",
            secondary: "oklch(0.94 0.03 160)",
            secondaryForeground: "oklch(0.25 0.05 165)",
            muted: "oklch(0.94 0.02 160)",
            mutedForeground: "oklch(0.45 0.04 165)",
            accent: "oklch(0.88 0.06 165)",
            accentForeground: "oklch(0.25 0.08 165)",
            destructive: "oklch(0.577 0.245 27.325)",
            border: "oklch(0.88 0.03 160)",
            input: "oklch(0.88 0.03 160)",
            ring: "oklch(0.52 0.15 165)",
            sidebar: "oklch(0.97 0.015 160)",
            sidebarForeground: "oklch(0.22 0.04 250)",
            sidebarPrimary: "oklch(0.52 0.15 165)",
            sidebarPrimaryForeground: "oklch(0.98 0.02 160)",
            sidebarAccent: "oklch(0.94 0.03 160)",
            sidebarAccentForeground: "oklch(0.25 0.05 165)",
            sidebarBorder: "oklch(0.88 0.03 160)",
            sidebarRing: "oklch(0.52 0.15 165)",
          },
          dark: {
            background: "oklch(0.25 0.03 250)",
            foreground: "oklch(0.95 0.02 160)",
            card: "oklch(0.3 0.035 250)",
            cardForeground: "oklch(0.95 0.02 160)",
            popover: "oklch(0.3 0.035 250)",
            popoverForeground: "oklch(0.95 0.02 160)",
            primary: "oklch(0.65 0.17 165)",
            primaryForeground: "oklch(0.98 0.02 160)",
            secondary: "oklch(0.35 0.04 250)",
            secondaryForeground: "oklch(0.95 0.02 160)",
            muted: "oklch(0.35 0.03 250)",
            mutedForeground: "oklch(0.7 0.04 165)",
            accent: "oklch(0.4 0.06 165)",
            accentForeground: "oklch(0.95 0.02 160)",
            destructive: "oklch(0.704 0.191 22.216)",
            border: "oklch(0.45 0.04 250)",
            input: "oklch(0.4 0.04 250)",
            ring: "oklch(0.65 0.17 165)",
            sidebar: "oklch(0.28 0.03 250)",
            sidebarForeground: "oklch(0.95 0.02 160)",
            sidebarPrimary: "oklch(0.65 0.17 165)",
            sidebarPrimaryForeground: "oklch(0.98 0.02 160)",
            sidebarAccent: "oklch(0.38 0.05 250)",
            sidebarAccentForeground: "oklch(0.95 0.02 160)",
            sidebarBorder: "oklch(0.45 0.04 250)",
            sidebarRing: "oklch(0.65 0.17 165)",
          },
        },
      })
    }

    return NextResponse.json({ data: doc.data() })
  } catch (error) {
    console.error("Error obteniendo tema:", error)
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
    const validatedData = ThemeColorsSchema.parse(body)

    await db.collection("theme").doc("colors").set(validatedData)

    // Registrar acción
    await logCRUDAction(request, "update", "theme", "colors", validatedData)

    return NextResponse.json({ success: true, data: validatedData })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos", details: error }, { status: 400 })
    }
    console.error("Error actualizando tema:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
