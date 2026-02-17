"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "./FormField"
import { FileUpload } from "./FileUpload"
import { ThemeEditor } from "./ThemeEditor"
import { getIdToken } from "@/lib/auth"
import { Settings, Palette, Image, Type, FileDown, Sparkles, MessageSquare } from "lucide-react"
import type { PromptConfig } from "@/lib/validations/prompt-schemas"
import { CVGenerator } from "./CVGenerator"
import { AIChatAssistant } from "./AIChatAssistant"
import type { SiteConfig } from "@/lib/validations/site-config-schemas"

type SettingsTab = "general" | "theme" | "cv" | "prompts"

export function SettingsEditor() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null)
  const [loadingPrompts, setLoadingPrompts] = useState(false)
  const [savingPrompts, setSavingPrompts] = useState(false)

  useEffect(() => {
    loadConfig()
    loadPromptConfig()
  }, [])

  const loadPromptConfig = async () => {
    setLoadingPrompts(true)
    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/prompts", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setPromptConfig(data.data)
      }
    } catch (err) {
      console.error("Error cargando configuración de prompts:", err)
    } finally {
      setLoadingPrompts(false)
    }
  }

  const savePromptConfig = async () => {
    if (!promptConfig) return

    setSavingPrompts(true)
    setError("")
    setSuccess("")

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/prompts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(promptConfig),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar")
      }

      setSuccess("Configuración de prompts guardada correctamente")
      setTimeout(() => setSuccess(""), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSavingPrompts(false)
    }
  }

  const loadConfig = async () => {
    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/site-config", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.data)
      } else {
        throw new Error("Error al cargar configuración")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar configuración")
    } finally {
      setLoading(false)
    }
  }

  const parseCV = async (cvUrl: string) => {
    if (!cvUrl) return

    setError("")
    setSuccess("")

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/cv/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cvUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al parsear CV")
      }

      const data = await response.json()
      setSuccess(
        `CV parseado correctamente (${data.data.pageCount} páginas). La IA ahora puede leerlo y ayudarte a mejorarlo.`
      )
      setTimeout(() => setSuccess(""), 5000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al parsear CV. Asegúrate de que sea un PDF válido con texto."
      )
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

      const response = await fetch("/api/admin/site-config", {
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

      const responseData = await response.json()
      setConfig(responseData.data)
      setSuccess("Configuración guardada correctamente. Recarga la página para ver los cambios.")
      setTimeout(() => setSuccess(""), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
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
          <h2 className="text-2xl font-bold">Configuración</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona la configuración general, tema y CV de tu portafolio
          </p>
        </div>
        <Button
          onClick={() => setAiChatOpen(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Asistente IA
        </Button>
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

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4" />
          General
        </button>
        <button
          onClick={() => setActiveTab("theme")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "theme"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Palette className="w-4 h-4" />
          Tema
        </button>
        <button
          onClick={() => setActiveTab("cv")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "cv"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileDown className="w-4 h-4" />
          Generar CV
        </button>
        <button
          onClick={() => setActiveTab("prompts")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "prompts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Prompts IA
        </button>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <FormField label="Título del sitio" required>
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-md bg-background"
                  placeholder="Ej: Angel Lugo | Desarrollador Full Stack"
                />
              </div>
            </FormField>

            <FormField label="Descripción">
              <textarea
                value={config.description || ""}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
                rows={3}
                placeholder="Descripción del sitio para SEO"
              />
            </FormField>

            <FormField label="Favicon">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-muted-foreground" />
                  <FileUpload
                    folder="favicon"
                    accept="image/*"
                    onUploadComplete={(url) => setConfig({ ...config, faviconUrl: url })}
                    currentUrl={config.faviconUrl || ""}
                    label="Subir Favicon"
                  />
                </div>
                {config.faviconUrl && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                    <img
                      src={config.faviconUrl}
                      alt="Favicon"
                      className="w-8 h-8 object-contain"
                    />
                    <input
                      type="text"
                      value={config.faviconUrl}
                      onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })}
                      className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
                      placeholder="O ingresa la URL manualmente"
                    />
                  </div>
                )}
              </div>
            </FormField>

            <FormField label="CV (URL de descarga)">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-muted-foreground" />
                  <FileUpload
                    folder="cv"
                    accept="application/pdf"
                    onUploadComplete={(url) => {
                      setConfig({ ...config, cvUrl: url })
                      // Parsear automáticamente el CV cuando se sube (sin await para no bloquear)
                      parseCV(url).catch((err) => {
                        console.error("Error parseando CV automáticamente:", err)
                      })
                    }}
                    currentUrl={config.cvUrl || ""}
                    label="Subir CV (PDF)"
                  />
                </div>
                {config.cvUrl && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={config.cvUrl}
                      onChange={(e) => setConfig({ ...config, cvUrl: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                      placeholder="O ingresa la URL manualmente"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => parseCV(config.cvUrl || "")}
                      className="text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-2" />
                      Leer e Interpretar CV con IA
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Al parsear el CV, la IA podrá leerlo y ayudarte a mejorarlo.
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Nota: Si generas un CV desde la pestaña "Generar CV", se usará automáticamente el último CV generado.
                </p>
              </div>
            </FormField>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={saveConfig} disabled={saving}>
              {saving ? "Guardando..." : "Guardar Configuración"}
            </Button>
            <Button variant="outline" onClick={loadConfig}>
              Restaurar
            </Button>
          </div>
        </div>
      )}

      {/* Theme Settings */}
      {activeTab === "theme" && <ThemeEditor />}

      {/* CV Generator */}
      {activeTab === "cv" && <CVGenerator />}

      {/* Prompts Configuration */}
      {activeTab === "prompts" && (
        <div className="space-y-6">
          {loadingPrompts ? (
            <div className="text-center py-8">Cargando configuración de prompts...</div>
          ) : promptConfig ? (
            <>
              <div className="space-y-4">
                <FormField label="Prompt del Sistema" required>
                  <textarea
                    value={promptConfig.systemPrompt}
                    onChange={(e) =>
                      setPromptConfig({ ...promptConfig, systemPrompt: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                    rows={8}
                    placeholder="Prompt principal del sistema para la IA..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Este prompt define el comportamiento general de la IA. Puedes usar variables como {"{"}portfolioData{"}"} para incluir datos del portafolio.
                  </p>
                </FormField>

                <FormField label="Mensaje de Bienvenida" required>
                  <textarea
                    value={promptConfig.welcomeMessage}
                    onChange={(e) =>
                      setPromptConfig({ ...promptConfig, welcomeMessage: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    rows={6}
                    placeholder="Mensaje que verá el usuario al abrir el chat..."
                  />
                </FormField>

                <FormField label="Instrucciones de Mejora" required>
                  <textarea
                    value={promptConfig.improvementInstructions}
                    onChange={(e) =>
                      setPromptConfig({
                        ...promptConfig,
                        improvementInstructions: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                    rows={10}
                    placeholder="Instrucciones específicas para cuando la IA mejore textos..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Define cómo debe responder la IA cuando se le pide mejorar contenido.
                  </p>
                </FormField>

                <FormField label="Prompt de Análisis de CV" required>
                  <textarea
                    value={promptConfig.cvAnalysisPrompt}
                    onChange={(e) =>
                      setPromptConfig({ ...promptConfig, cvAnalysisPrompt: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    rows={8}
                    placeholder="Prompt para cuando se analiza un CV con imágenes..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Este prompt se usa cuando se analiza un CV subido como imagen.
                  </p>
                </FormField>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={loadPromptConfig}>
                  Restaurar
                </Button>
                <Button onClick={savePromptConfig} disabled={savingPrompts}>
                  {savingPrompts ? "Guardando..." : "Guardar Prompts"}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">Error al cargar configuración de prompts</div>
          )}
        </div>
      )}

      {/* Chat Asistente de IA */}
      <AIChatAssistant
        open={aiChatOpen}
        onOpenChange={setAiChatOpen}
        onApplySuggestion={(section, content) => {
          console.log("Aplicar sugerencia:", section, content)
        }}
      />
    </div>
  )
}
