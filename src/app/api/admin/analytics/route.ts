import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getVisits, getAnalyticsStats } from "@/lib/analytics"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "30")
    const limit = parseInt(searchParams.get("limit") || "100")

    const [visits, stats] = await Promise.all([
      getVisits(limit),
      getAnalyticsStats(days),
    ])

    return NextResponse.json({
      visits,
      stats,
    })
  } catch (error) {
    console.error("Error obteniendo analytics:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
