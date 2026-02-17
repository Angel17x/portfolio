import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { logActivity } from "@/lib/logs"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    
    // Registrar logout si hay usuario autenticado
    if (user) {
      await logActivity({
        userId: user.uid,
        userEmail: user.email || "unknown",
        action: "logout",
        collection: "auth",
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en logout:", error)
    return NextResponse.json({ success: true }) // Siempre retornar éxito para no bloquear el logout
  }
}
