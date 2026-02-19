import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger todas las rutas /api/admin/* excepto las de autenticación
  if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/auth/")) {
    // La autenticación se maneja en cada endpoint individualmente
    // Este middleware solo registra intentos de acceso
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Log de intento de acceso no autorizado (en producción, usar un servicio de logging)
      const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
      console.warn(`Intento de acceso no autorizado a ${pathname} desde ${ip}`)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/admin/:path*",
  ],
}
