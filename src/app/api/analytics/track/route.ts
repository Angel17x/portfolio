import { NextRequest, NextResponse } from "next/server"
import { logVisit } from "@/lib/analytics"
import { VisitSchema } from "@/lib/validations/analytics-schemas"

// Detectar dispositivo desde user agent
function detectDevice(userAgent: string): string {
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return "tablet"
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return "mobile"
  }
  return "desktop"
}

// Detectar navegador desde user agent
function detectBrowser(userAgent: string): string {
  if (userAgent.includes("Chrome")) return "Chrome"
  if (userAgent.includes("Firefox")) return "Firefox"
  if (userAgent.includes("Safari")) return "Safari"
  if (userAgent.includes("Edge")) return "Edge"
  if (userAgent.includes("Opera")) return "Opera"
  return "Unknown"
}

// Detectar OS desde user agent
function detectOS(userAgent: string): string {
  if (userAgent.includes("Windows")) return "Windows"
  if (userAgent.includes("Mac")) return "macOS"
  if (userAgent.includes("Linux")) return "Linux"
  if (userAgent.includes("Android")) return "Android"
  if (userAgent.includes("iOS")) return "iOS"
  return "Unknown"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userAgent = request.headers.get("user-agent") || ""
    const referrer = request.headers.get("referer") || ""
    
    // Obtener IP del cliente
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"

    // Generar session ID único (basado en IP + User Agent + timestamp del día)
    const today = new Date().toISOString().split("T")[0]
    const sessionId = `${ip}-${userAgent.slice(0, 50)}-${today}`

    const visitData = {
      timestamp: Date.now(),
      path: body.path || "/",
      section: body.section || undefined,
      userAgent,
      referrer: referrer || undefined,
      ip,
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
      os: detectOS(userAgent),
      sessionId,
      // País y ciudad se pueden obtener con un servicio externo si es necesario
      // Por ahora los dejamos undefined
    }

    const validatedVisit = VisitSchema.parse(visitData)
    await logVisit(validatedVisit)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking visita:", error)
    return NextResponse.json({ error: "Error al registrar visita" }, { status: 500 })
  }
}
