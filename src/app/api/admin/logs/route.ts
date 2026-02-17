import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getActivityLogs } from "@/lib/logs"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100")

    const logs = await getActivityLogs(limit)

    return NextResponse.json({ data: logs })
  } catch (error) {
    console.error("Error obteniendo logs:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
