import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getPortfolioData } from "@/lib/portfolio-server"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const portfolioData = await getPortfolioData()
    return NextResponse.json({
      success: true,
      data: portfolioData,
    })
  } catch (error) {
    console.error("Error obteniendo datos del portfolio:", error)
    return NextResponse.json(
      { error: "Error al obtener datos del portfolio" },
      { status: 500 }
    )
  }
}
