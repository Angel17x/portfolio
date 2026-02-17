"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // No trackear en rutas de admin
    if (pathname?.startsWith("/admin")) {
      return
    }

    const trackVisit = async () => {
      try {
        // Detectar sección basada en la ruta
        let section = "home"
        if (pathname) {
          if (pathname === "/") {
            section = "home"
          } else if (pathname.includes("about") || pathname.includes("acerca")) {
            section = "about"
          } else if (pathname.includes("experience") || pathname.includes("experiencia")) {
            section = "experiences"
          } else if (pathname.includes("project") || pathname.includes("proyecto")) {
            section = "projects"
          } else if (pathname.includes("skill") || pathname.includes("habilidad")) {
            section = "skills"
          } else if (pathname.includes("education") || pathname.includes("educacion")) {
            section = "education"
          } else if (pathname.includes("contact") || pathname.includes("contacto")) {
            section = "contact"
          }
        }

        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname || "/",
            section,
          }),
        })
      } catch (error) {
        // Silenciar errores de tracking para no afectar la experiencia del usuario
        console.error("Error tracking visita:", error)
      }
    }

    // Pequeño delay para asegurar que la página está cargada
    const timeoutId = setTimeout(trackVisit, 500)

    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}
