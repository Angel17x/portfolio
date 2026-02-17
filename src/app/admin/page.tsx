"use client"

import { useEffect } from "react"
import { getCurrentUser, getIdToken } from "@/lib/auth"

export default function AdminPage() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          // Verificar que el token sea válido
          const token = await getIdToken()
          if (token) {
            const response = await fetch("/api/admin/auth/session", {
              headers: { Authorization: `Bearer ${token}` },
            })
            if (response.ok) {
              window.location.href = "/admin/dashboard"
              return
            }
          }
        }
        // Si no está autenticado o el token no es válido, ir al login
        window.location.href = "/admin/login"
      } catch (error) {
        console.error("Error verificando autenticación:", error)
        window.location.href = "/admin/login"
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirigiendo...</p>
    </div>
  )
}
