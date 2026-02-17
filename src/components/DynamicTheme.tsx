"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export function DynamicTheme() {
  const { resolvedTheme } = useTheme()
  const [themeColors, setThemeColors] = useState<{
    light: Record<string, string>
    dark: Record<string, string>
  } | null>(null)
  const [mounted, setMounted] = useState(false)

  // Función helper para convertir camelCase a kebab-case
  const toKebabCase = (str: string) => {
    return str.replace(/([A-Z])/g, "-$1").toLowerCase()
  }

  // Función para aplicar colores
  const applyColors = (colors: Record<string, string>) => {
    const root = document.documentElement
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--${toKebabCase(key)}`
      root.style.setProperty(cssVar, value as string)
    })
  }

  // Cargar colores del tema desde Firebase
  useEffect(() => {
    const loadThemeColors = async () => {
      try {
        const response = await fetch("/api/theme")
        if (!response.ok) return

        const { data } = await response.json()
        if (!data) return

        setThemeColors(data)
      } catch (error) {
        console.error("Error cargando colores del tema:", error)
      }
    }

    loadThemeColors()
    setMounted(true)
  }, [])

  // Aplicar colores cuando cambian los colores o el tema
  useEffect(() => {
    if (!themeColors || !mounted) return

    // Aplicar colores según el tema actual
    if (resolvedTheme === "dark") {
      applyColors(themeColors.dark || {})
    } else {
      applyColors(themeColors.light || {})
    }
  }, [resolvedTheme, themeColors, mounted])

  if (!mounted) {
    return null
  }

  return null
}

