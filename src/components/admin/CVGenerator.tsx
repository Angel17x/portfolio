"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "./FormField"
import { AITextImprover } from "./AITextImprover"
import { CVHistory } from "./CVHistory"
import { CVDesignAnalyzer } from "./CVDesignAnalyzer"
import { getIdToken } from "@/lib/auth"
import type { CVConfig } from "@/lib/validations/cv-config-schemas"
import {
  FileText,
  Download,
  Sparkles,
  Eye,
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
} from "lucide-react"

export function CVGenerator() {
  const [config, setConfig] = useState<CVConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [aiImproverOpen, setAiImproverOpen] = useState(false)
  const [designAnalyzerOpen, setDesignAnalyzerOpen] = useState(false)
  const [aiImproverData, setAiImproverData] = useState<{
    text: string
    type: "experience" | "project" | "about" | "general"
    context?: string
    onImproved: (text: string) => void
  } | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/cv-config", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar configuración")
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/cv-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar")
      }

      setSuccess("Configuración guardada correctamente")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const generatePDF = async () => {
    setGenerating(true)
    setError("")

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/cv/generate-pdf", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al generar PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cv-${config?.template || "harvard"}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setSuccess("CV generado, descargado y guardado correctamente")
      setTimeout(() => setSuccess(""), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar PDF")
    } finally {
      setGenerating(false)
    }
  }

  const openAIImprover = (
    text: string,
    type: "experience" | "project" | "about" | "general",
    context?: string,
    onImproved?: (text: string) => void
  ) => {
    setAiImproverData({
      text,
      type,
      context,
      onImproved: onImproved || (() => {}),
    })
    setAiImproverOpen(true)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando configuración...</div>
  }

  if (!config) {
    return <div className="text-center py-8">Error al cargar configuración</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Generador de CV
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configura y genera tu CV profesional en formato PDF
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setDesignAnalyzerOpen(true)}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Analizar Diseño
          </Button>
          <Button
            variant="outline"
            onClick={() => openAIImprover("", "general")}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Mejorar con IA
          </Button>
          <Button onClick={generatePDF} disabled={generating}>
            {generating ? (
              <>
                <Download className="w-4 h-4 mr-2 animate-pulse" />
                Generando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generar PDF
              </>
            )}
          </Button>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración de Plantilla */}
        <div className="space-y-4 p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Layout className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Plantilla</h3>
          </div>
          <FormField label="Formato del CV">
            <select
              value={config.template}
              onChange={(e) =>
                setConfig({
                  ...config,
                  template: e.target.value as CVConfig["template"],
                })
              }
              className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value="harvard">Harvard (Clásico)</option>
              <option value="modern">Moderno</option>
              <option value="classic">Clásico</option>
            </select>
          </FormField>
        </div>

        {/* Configuración de Colores */}
        <div className="space-y-4 p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Colores</h3>
          </div>
          <FormField label="Color Principal">
            <input
              type="color"
              value={config.colors.primary}
              onChange={(e) =>
                setConfig({
                  ...config,
                  colors: { ...config.colors, primary: e.target.value },
                })
              }
              className="w-full h-12 border-2 border-border rounded-lg cursor-pointer"
            />
          </FormField>
          <FormField label="Color Secundario">
            <input
              type="color"
              value={config.colors.secondary}
              onChange={(e) =>
                setConfig({
                  ...config,
                  colors: { ...config.colors, secondary: e.target.value },
                })
              }
              className="w-full h-12 border-2 border-border rounded-lg cursor-pointer"
            />
          </FormField>
          <FormField label="Color de Acento">
            <input
              type="color"
              value={config.colors.accent}
              onChange={(e) =>
                setConfig({
                  ...config,
                  colors: { ...config.colors, accent: e.target.value },
                })
              }
              className="w-full h-12 border-2 border-border rounded-lg cursor-pointer"
            />
          </FormField>
        </div>

        {/* Configuración de Fuentes */}
        <div className="space-y-4 p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Fuentes</h3>
          </div>
          <FormField label="Fuente de Títulos">
            <select
              value={config.fonts.heading}
              onChange={(e) =>
                setConfig({
                  ...config,
                  fonts: { ...config.fonts, heading: e.target.value },
                })
              }
              className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Calibri">Calibri</option>
            </select>
          </FormField>
          <FormField label="Fuente del Cuerpo">
            <select
              value={config.fonts.body}
              onChange={(e) =>
                setConfig({
                  ...config,
                  fonts: { ...config.fonts, body: e.target.value },
                })
              }
              className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Calibri">Calibri</option>
            </select>
          </FormField>
          <FormField label="Tamaño de Fuente (8-14)">
            <input
              type="number"
              min="8"
              max="14"
              value={config.fonts.size}
              onChange={(e) =>
                setConfig({
                  ...config,
                  fonts: {
                    ...config.fonts,
                    size: parseInt(e.target.value) || 11,
                  },
                })
              }
              className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </FormField>
        </div>

        {/* Visibilidad de Secciones */}
        <div className="space-y-4 p-6 border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Secciones Visibles</h3>
          </div>
          {Object.entries(config.sectionVisibility).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium capitalize">
                {key === "hero" ? "Información Personal" :
                 key === "about" ? "Resumen Profesional" :
                 key === "experiences" ? "Experiencia Laboral" :
                 key === "projects" ? "Proyectos" :
                 key === "skills" ? "Habilidades" :
                 key === "education" ? "Educación" :
                 key === "contact" ? "Contacto" : key}
              </label>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    sectionVisibility: {
                      ...config.sectionVisibility,
                      [key]: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
              />
            </div>
          ))}
        </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={loadConfig}>
            Cancelar
          </Button>
          <Button onClick={saveConfig} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Configuración"}
          </Button>
        </div>

      <div className="pt-8 border-t mt-8">
        <CVHistory />
      </div>

      {/* Modal de Mejora con IA */}
      {aiImproverData && (
        <AITextImprover
          open={aiImproverOpen}
          onOpenChange={setAiImproverOpen}
          initialText={aiImproverData.text}
          type={aiImproverData.type}
          context={aiImproverData.context}
          onImproved={aiImproverData.onImproved}
        />
      )}

      {/* Modal de Análisis de Diseño */}
      <CVDesignAnalyzer
        open={designAnalyzerOpen}
        onOpenChange={setDesignAnalyzerOpen}
      />
    </div>
  )
}
