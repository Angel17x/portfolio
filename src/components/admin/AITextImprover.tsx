"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "./FormField"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { getIdToken } from "@/lib/auth"
import { Sparkles, Loader2, Check, X, MessageSquare, RefreshCw, Send } from "lucide-react"

interface AITextImproverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialText: string
  type: "experience" | "project" | "about" | "general"
  context?: string
  onImproved: (improvedText: string) => void
}

export function AITextImprover({
  open,
  onOpenChange,
  initialText,
  type,
  context,
  onImproved,
}: AITextImproverProps) {
  const [text, setText] = useState(initialText)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [previewMode, setPreviewMode] = useState<"input" | "preview" | "conversation">("input")
  const [improvedText, setImprovedText] = useState("")
  const [explanation, setExplanation] = useState<string[]>([])
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([])
  const [userMessage, setUserMessage] = useState("")
  const [conversationLoading, setConversationLoading] = useState(false)

  // Reset cuando se abre el modal
  useEffect(() => {
    if (open) {
      setText(initialText)
      setPreviewMode("input")
      setImprovedText("")
      setExplanation([])
      setConversationHistory([])
      setUserMessage("")
      setError("")
    }
  }, [open, initialText])

  const handlePreview = async () => {
    if (!text.trim()) {
      setError("El texto no puede estar vacío")
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/cv/improve-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          type,
          context,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al generar preview")
      }

      const data = await response.json()
      setImprovedText(data.improvedText)
      setExplanation(data.explanation || [])
      setPreviewMode("preview")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar preview")
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = () => {
    if (improvedText) {
      onImproved(improvedText)
      onOpenChange(false)
    }
  }

  const handleConversation = async () => {
    if (!userMessage.trim()) return

    setConversationLoading(true)
    setError("")

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/cv/improve-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          type,
          context,
          userMessage,
          conversationHistory,
          improvedText: improvedText || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error en la conversación")
      }

      const data = await response.json()
      setConversationHistory(data.conversationHistory || [])
      setUserMessage("")

      // Si la respuesta contiene texto mejorado, actualizarlo y volver al preview
      if (data.improvedText) {
        setImprovedText(data.improvedText)
        setPreviewMode("preview")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en la conversación")
    } finally {
      setConversationLoading(false)
    }
  }

  const typeLabels = {
    experience: "Experiencia Laboral",
    project: "Proyecto",
    about: "Resumen Profesional",
    general: "Texto General",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Mejorar Texto con IA
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6 px-6">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              Tipo: <span className="font-medium">{typeLabels[type]}</span>
            </p>
            {context && (
              <p className="text-sm text-muted-foreground mt-2">
                Contexto: {context}
              </p>
            )}
          </div>

          {/* Modo Input */}
          {previewMode === "input" && (
            <>
              <FormField label="Texto a Mejorar" required>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribe o pega el texto que deseas mejorar..."
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                  rows={8}
                />
              </FormField>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> Primero verás un preview de las mejoras sugeridas antes de aplicarlas.
                </p>
              </div>
            </>
          )}

          {/* Modo Preview */}
          {previewMode === "preview" && (
            <>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Mejoras Sugeridas
                  </h3>
                  {explanation.length > 0 ? (
                    <ul className="space-y-2">
                      {explanation.map((point, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      La IA ha mejorado el texto para hacerlo más profesional e impactante.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-sm text-muted-foreground">Texto Original</h4>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border text-sm max-h-48 overflow-y-auto">
                      {text}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-sm text-muted-foreground">Texto Mejorado</h4>
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm max-h-48 overflow-y-auto">
                      {improvedText}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
            </>
          )}

          {/* Modo Conversación */}
          {previewMode === "conversation" && (
            <div className="space-y-4">
              {improvedText && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-2 text-sm">Texto Mejorado Actual</h4>
                  <div className="text-sm max-h-32 overflow-y-auto">
                    {improvedText}
                  </div>
                </div>
              )}
              
              <div className="p-4 rounded-lg bg-muted/30 border border-border max-h-64 overflow-y-auto space-y-3">
                {conversationHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Haz preguntas o pide ajustes específicos sobre la mejora sugerida.
                    <br />
                    <span className="text-xs mt-2 block">
                      Ejemplos: "Hazlo más corto", "Agrega más números", "Enfócate en los logros"
                    </span>
                  </p>
                ) : (
                  conversationHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted border border-border"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {conversationLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="bg-muted border border-border p-3 rounded-lg text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !conversationLoading && handleConversation()}
                  placeholder="Pregunta o pide ajustes específicos..."
                  className="flex-1 px-4 py-2 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={conversationLoading}
                />
                <Button
                  onClick={handleConversation}
                  disabled={conversationLoading || !userMessage.trim()}
                  size="icon"
                >
                  {conversationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex-wrap gap-2">
          {previewMode === "input" && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePreview}
                disabled={loading || !text.trim()}
                className="min-w-[100px] font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ver Mejoras Sugeridas
                  </>
                )}
              </Button>
            </>
          )}

          {previewMode === "preview" && (
            <>
              <Button
                variant="outline"
                onClick={() => setPreviewMode("input")}
                className="min-w-[100px]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                variant="outline"
                onClick={() => setPreviewMode("conversation")}
                className="min-w-[100px]"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Hacer Preguntas
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="min-w-[100px]"
              >
                <X className="w-4 h-4 mr-2" />
                Rechazar
              </Button>
              <Button
                onClick={handleAccept}
                className="min-w-[100px] font-medium"
              >
                <Check className="w-4 h-4 mr-2" />
                Aceptar Mejora
              </Button>
            </>
          )}

          {previewMode === "conversation" && (
            <>
              <Button
                variant="outline"
                onClick={() => setPreviewMode("preview")}
                className="min-w-[100px]"
              >
                Volver al Preview
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              {improvedText && (
                <Button
                  onClick={handleAccept}
                  className="min-w-[100px] font-medium"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Aceptar Mejora
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
