"use client"

import { useEffect } from "react"

export function DynamicSiteConfig() {
  useEffect(() => {
    const loadSiteConfig = async () => {
      try {
        const response = await fetch("/api/site-config")
        if (response.ok) {
          const data = await response.json()
          const config = data.data

          // Actualizar título
          if (config.title) {
            document.title = config.title
          }

          // Actualizar favicon
          if (config.faviconUrl) {
            // Remover favicon existente
            const existingFavicon = document.querySelector('link[rel="icon"]')
            if (existingFavicon) {
              existingFavicon.remove()
            }

            // Agregar nuevo favicon
            const link = document.createElement("link")
            link.rel = "icon"
            link.type = "image/x-icon"
            link.href = config.faviconUrl
            document.head.appendChild(link)
          }

          // Actualizar meta description si existe
          if (config.description) {
            let metaDescription = document.querySelector('meta[name="description"]')
            if (!metaDescription) {
              metaDescription = document.createElement("meta")
              metaDescription.setAttribute("name", "description")
              document.head.appendChild(metaDescription)
            }
            metaDescription.setAttribute("content", config.description)
          }
        }
      } catch (error) {
        console.error("Error cargando configuración del sitio:", error)
      }
    }

    loadSiteConfig()
  }, [])

  return null
}
