"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "./FormField"
import { AITextImprover } from "./AITextImprover"
import { CVHistory } from "./CVHistory"
import { CVDesignAnalyzer } from "./CVDesignAnalyzer"
import { CVPreview } from "./CVPreview"
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
  X,
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
  const [previewOpen, setPreviewOpen] = useState(false)
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
        let configData = data.data
        
        // Migración: convertir configuraciones antiguas a nuevos tamaños granulares
        if (configData?.fonts) {
          // Si tiene fonts.size antiguo, convertir
          if ('size' in configData.fonts && !configData.fonts.titleSize) {
            const oldSize = configData.fonts.size || 11
            configData = {
              ...configData,
              fonts: {
                ...configData.fonts,
                titleSize: 28,
                sectionTitleSize: Math.max(12, oldSize + 1),
                subtitleSize: oldSize,
                bodySize: Math.max(10, oldSize - 1),
              },
            }
            delete configData.fonts.size
          }
          // Si tiene headingSize/bodySize antiguos, convertir a nuevos
          if ('headingSize' in configData.fonts && !configData.fonts.titleSize) {
            const headingSize = configData.fonts.headingSize || 14
            const bodySize = configData.fonts.bodySize || 11
            configData = {
              ...configData,
              fonts: {
                ...configData.fonts,
                titleSize: headingSize * 2,
                sectionTitleSize: headingSize,
                subtitleSize: bodySize,
                bodySize: Math.max(10, bodySize - 1),
              },
            }
            delete configData.fonts.headingSize
          }
        }
        
        setConfig(configData)
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
      try {
        const a = document.createElement("a")
        a.href = url
        a.download = `cv-${config?.template || "harvard"}.pdf`
        a.style.display = "none"
        document.body.appendChild(a)
        a.click()
        // Usar setTimeout para asegurar que el click se complete antes de eliminar
        setTimeout(() => {
          try {
            if (a && a.parentNode === document.body && document.body.contains(a)) {
              document.body.removeChild(a)
            }
          } catch (e) {
            console.warn("Error al eliminar elemento de descarga:", e)
          }
          window.URL.revokeObjectURL(url)
        }, 200)
      } catch (e) {
        console.error("Error al descargar CV:", e)
        window.URL.revokeObjectURL(url)
      }

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
            variant={previewOpen ? "default" : "outline"}
            onClick={() => setPreviewOpen(!previewOpen)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewOpen ? "Ocultar Preview" : "Vista Previa"}
          </Button>
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

      <div className={`grid gap-6 ${previewOpen ? "grid-cols-1 xl:grid-cols-[1fr_1fr]" : "grid-cols-1 lg:grid-cols-2"}`}>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
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
          <FormField label="Tamaño de Título Principal">
            <select
              value={config.fonts.titleSize || 28}
              onChange={(e) =>
                setConfig({
                  ...config,
                  fonts: {
                    ...config.fonts,
                    titleSize: parseInt(e.target.value) || 28,
                  },
                })
              }
              className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value={20}>20px - Muy Pequeño</option>
              <option value={24}>24px - Pequeño</option>
              <option value={28}>28px - Normal</option>
              <option value={32}>32px - Grande</option>
              <option value={36}>36px - Muy Grande</option>
              <option value={40}>40px - Extra Grande</option>
              <option value={44}>44px - Muy Extra Grande</option>
              <option value={48}>48px - Enorme</option>
              <option value={52}>52px - Muy Enorme</option>
              <option value={56}>56px - Gigante</option>
              <option value={60}>60px - Muy Gigante</option>
              <option value={64}>64px - Extremo</option>
              <option value={68}>68px - Muy Extremo</option>
              <option value={72}>72px - Máximo</option>
            </select>
          </FormField>
          <FormField label="Tamaño de Títulos de Sección">
            <select
              value={config.fonts.sectionTitleSize || 12}
              onChange={(e) =>
                setConfig({
                  ...config,
                  fonts: {
                    ...config.fonts,
                    sectionTitleSize: parseInt(e.target.value) || 12,
                  },
                })
              }
              className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value={8}>8px - Muy Pequeño</option>
              <option value={9}>9px - Pequeño</option>
              <option value={10}>10px - Pequeño-Medio</option>
              <option value={11}>11px - Medio-Pequeño</option>
              <option value={12}>12px - Normal</option>
              <option value={13}>13px - Medio-Grande</option>
              <option value={14}>14px - Grande</option>
              <option value={15}>15px - Muy Grande</option>
              <option value={16}>16px - Extra Grande</option>
              <option value={18}>18px - Muy Extra Grande</option>
              <option value={20}>20px - Enorme</option>
              <option value={22}>22px - Muy Enorme</option>
              <option value={24}>24px - Gigante</option>
            </select>
          </FormField>
          <FormField label="Tamaño de Subtítulos">
            <select
              value={config.fonts.subtitleSize || 11}
              onChange={(e) =>
                setConfig({
                  ...config,
                  fonts: {
                    ...config.fonts,
                    subtitleSize: parseInt(e.target.value) || 11,
                  },
                })
              }
              className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value={8}>8px - Muy Pequeño</option>
              <option value={9}>9px - Pequeño</option>
              <option value={10}>10px - Pequeño-Medio</option>
              <option value={11}>11px - Normal</option>
              <option value={12}>12px - Medio-Grande</option>
              <option value={13}>13px - Grande</option>
              <option value={14}>14px - Muy Grande</option>
              <option value={15}>15px - Extra Grande</option>
              <option value={16}>16px - Muy Extra Grande</option>
              <option value={18}>18px - Enorme</option>
              <option value={20}>20px - Muy Enorme</option>
            </select>
          </FormField>
          <FormField label="Tamaño de Cuerpo">
            <select
              value={config.fonts.bodySize || 10}
              onChange={(e) =>
                setConfig({
                  ...config,
                  fonts: {
                    ...config.fonts,
                    bodySize: parseInt(e.target.value) || 10,
                  },
                })
              }
              className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value={8}>8px - Muy Pequeño</option>
              <option value={9}>9px - Pequeño</option>
              <option value={10}>10px - Normal</option>
              <option value={11}>11px - Medio-Grande</option>
              <option value={12}>12px - Grande</option>
              <option value={13}>13px - Muy Grande</option>
              <option value={14}>14px - Extra Grande</option>
              <option value={15}>15px - Muy Extra Grande</option>
              <option value={16}>16px - Enorme</option>
              <option value={18}>18px - Muy Enorme</option>
            </select>
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

        {/* Preview en tiempo real */}
        {previewOpen && config && (
          <div className="xl:col-span-1 border rounded-lg overflow-hidden bg-muted/30 flex flex-col">
            <div className="p-4 border-b border-border bg-background shrink-0">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Vista Previa en Tiempo Real
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                El preview se actualiza automáticamente al cambiar la configuración
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <CVPreview
                config={config}
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                inline
              />
            </div>
          </div>
        )}
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
