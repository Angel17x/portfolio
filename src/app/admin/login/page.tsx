"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getIdToken } from "@/lib/auth"
import { LoginForm } from "@/components/admin/LoginForm"

export default function AdminLoginPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

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
              // Usar window.location para asegurar que se recargue completamente
              window.location.href = "/admin/dashboard"
              return
            }
          }
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error)
      } finally {
        setChecking(false)
      }
    }

    checkAuth()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  )
}
