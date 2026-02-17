"use client"

import { useEffect, useState } from "react"
import { getCurrentUser, getIdToken } from "@/lib/auth"
import { Dashboard } from "@/components/admin/Dashboard"
import { FloatingAIChatButton } from "@/components/admin/FloatingAIChatButton"

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          window.location.href = "/admin/login"
          return
        }

        // Verificar token con el servidor
        const token = await getIdToken()
        if (!token) {
          window.location.href = "/admin/login"
          return
        }

        const response = await fetch("/api/admin/auth/session", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          window.location.href = "/admin/login"
          return
        }

        setAuthorized(true)
      } catch (error) {
        console.error("Error verificando autenticación:", error)
        window.location.href = "/admin/login"
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <>
      <Dashboard />
      <FloatingAIChatButton />
    </>
  )
}
