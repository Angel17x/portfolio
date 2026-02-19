"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, getIdToken } from "@/lib/auth"
import { verifyAdminSession } from "@/app/admin/actions"
import { DashboardLayout } from "@/components/admin/DashboardLayout"
import { FloatingAIChatButton } from "@/components/admin/FloatingAIChatButton"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [authStatus, setAuthStatus] = useState<"pending" | "ok" | "unauthorized">("pending")

  useEffect(() => {
    let cancelled = false
    async function check() {
      try {
        const user = await getCurrentUser()
        if (!user || cancelled) {
          if (!cancelled) setAuthStatus("unauthorized")
          return
        }
        const token = await getIdToken()
        if (!token || cancelled) {
          if (!cancelled) setAuthStatus("unauthorized")
          return
        }
        const { ok } = await verifyAdminSession(token)
        if (cancelled) return
        setAuthStatus(ok ? "ok" : "unauthorized")
      } catch {
        if (!cancelled) setAuthStatus("unauthorized")
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (authStatus === "unauthorized") {
      window.location.href = "/admin/login"
    }
  }, [authStatus])

  if (authStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (authStatus === "unauthorized") {
    return null
  }

  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <FloatingAIChatButton />
    </>
  )
}
