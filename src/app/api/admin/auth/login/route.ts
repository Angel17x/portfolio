import { NextRequest, NextResponse } from "next/server"
import { verifyIdToken } from "@/lib/auth-server"
import { logActivity } from "@/lib/logs"

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 })
    }

    try {
      const decodedToken = await verifyIdToken(idToken)

      // Registrar login
      await logActivity({
        userId: decodedToken.uid,
        userEmail: decodedToken.email || "unknown",
        action: "login",
        collection: "auth",
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      })

      return NextResponse.json({ 
        success: true, 
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
        }
      })
    } catch (error: any) {
      console.error("Error verificando token en login:", error)
      const errorMessage = error?.message || "Token inválido o no autorizado"
      return NextResponse.json({ error: errorMessage }, { status: 401 })
    }
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
