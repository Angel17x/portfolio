import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        uid: user.uid,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Error verificando sesión:", error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
