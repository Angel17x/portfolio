"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "./FormField"
import { getIdToken } from "@/lib/auth"
import type { ThemeColors } from "@/lib/validations/theme-schemas"

// Helper para convertir oklch a hex (simplificado, para mostrar preview)
function oklchToHex(oklch: string): string {
  // Esto es una aproximación simple, en producción deberías usar una librería
  // Por ahora retornamos un color por defecto
  return "#000000"
}

// Helper para convertir hex a oklch (simplificado)
function hexToOklch(hex: string): string {
  // Conversión simplificada - en producción usar una librería adecuada
  return "oklch(0.5 0.1 180)"
}

const colorFields = [
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground" },
  { key: "primary", label: "Primary" },
  { key: "primaryForeground", label: "Primary Foreground" },
  { key: "secondary", label: "Secondary" },
  { key: "secondaryForeground", label: "Secondary Foreground" },
  { key: "accent", label: "Accent" },
  { key: "accentForeground", label: "Accent Foreground" },
  { key: "muted", label: "Muted" },
  { key: "mutedForeground", label: "Muted Foreground" },
  { key: "destructive", label: "Destructive" },
  { key: "border", label: "Border" },
  { key: "input", label: "Input" },
  { key: "ring", label: "Ring" },
  { key: "card", label: "Card" },
  { key: "cardForeground", label: "Card Foreground" },
  { key: "popover", label: "Popover" },
  { key: "popoverForeground", label: "Popover Foreground" },
  { key: "sidebar", label: "Sidebar" },
  { key: "sidebarForeground", label: "Sidebar Foreground" },
  { key: "sidebarPrimary", label: "Sidebar Primary" },
  { key: "sidebarPrimaryForeground", label: "Sidebar Primary Foreground" },
  { key: "sidebarAccent", label: "Sidebar Accent" },
  { key: "sidebarAccentForeground", label: "Sidebar Accent Foreground" },
  { key: "sidebarBorder", label: "Sidebar Border" },
  { key: "sidebarRing", label: "Sidebar Ring" },
]

export function ThemeEditor() {
  const [theme, setTheme] = useState<ThemeColors | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeMode, setActiveMode] = useState<"light" | "dark">("light")

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    try {
      const response = await fetch("/api/admin/theme")
      if (response.ok) {
        const data = await response.json()
        setTheme(data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar tema")
    } finally {
      setLoading(false)
    }
  }

  const saveTheme = async () => {
    if (!theme) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(theme),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar")
      }

      setSuccess("Tema guardado correctamente. Recarga la página para ver los cambios.")
      setTimeout(() => setSuccess(""), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const updateColor = (mode: "light" | "dark", key: string, value: string) => {
    if (!theme) return

    setTheme({
      ...theme,
      [mode]: {
        ...theme[mode],
        [key]: value,
      },
    })
  }

  if (loading) {
    return <div className="text-center py-8">Cargando tema...</div>
  }

  if (!theme) {
    return <div className="text-center py-8">Error al cargar tema</div>
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Tabs para Light/Dark */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveMode("light")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeMode === "light"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Tema Claro
        </button>
        <button
          onClick={() => setActiveMode("dark")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeMode === "dark"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Tema Oscuro
        </button>
      </div>

      {/* Grid de colores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colorFields.map((field) => (
          <FormField key={field.key} label={field.label}>
            <div className="flex gap-2">
              <input
                type="text"
                value={theme[activeMode][field.key as keyof typeof theme.light] || ""}
                onChange={(e) => updateColor(activeMode, field.key, e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md bg-background font-mono text-sm"
                placeholder="oklch(0.5 0.1 180)"
              />
              <div
                className="w-12 h-10 border rounded-md cursor-pointer"
                style={{
                  backgroundColor: `var(--${field.key.replace(/([A-Z])/g, "-$1").toLowerCase()})`,
                }}
                title="Preview del color"
              />
            </div>
          </FormField>
        ))}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={saveTheme} disabled={saving}>
          {saving ? "Guardando..." : "Guardar Tema"}
        </Button>
        <Button variant="outline" onClick={loadTheme}>
          Restaurar
        </Button>
      </div>

      <div className="p-4 bg-muted rounded-lg text-sm">
        <p className="font-semibold mb-2">Nota:</p>
        <p className="text-muted-foreground">
          Los colores deben estar en formato oklch. Ejemplo: <code className="bg-background px-1 rounded">oklch(0.52 0.15 165)</code>
        </p>
        <p className="text-muted-foreground mt-2">
          Después de guardar, recarga la página para ver los cambios aplicados.
        </p>
      </div>
    </div>
  )
}
