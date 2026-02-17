"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ConfirmDialog } from "./ConfirmDialog"
import { getIdToken } from "@/lib/auth"
import { MessageSquare, Send, Loader2, Sparkles, X, Trash2, History, List, ThumbsUp, Copy, Check } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { ChatMessageFormatter } from "./ChatMessageFormatter"

interface AIChatAssistantProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplySuggestion?: (section: string, content: string) => void
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  improvedText?: string
  suggestions?: {
    experience?: string
    project?: string
    skill?: string
    education?: string
    cv?: string
  }
}

export function AIChatAssistant({
  open,
  onOpenChange,
  onApplySuggestion,
}: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showHistoryList, setShowHistoryList] = useState(false)
  const [conversationsList, setConversationsList] = useState<Array<{ id: string; createdAt: any; messageCount: number }>>([])
  const [likedMessageIndices, setLikedMessageIndices] = useState<Set<number>>(new Set())
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Estados para modales de confirmación
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [showDeleteConvConfirm, setShowDeleteConvConfirm] = useState(false)
  const [convToDelete, setConvToDelete] = useState<{ id: string; createdAt: Date } | null>(null)

  useEffect(() => {
    if (open) {
      loadChatHistory()
      loadConversationsList()
    }
  }, [open])

  const loadConversationsList = async () => {
    try {
      const token = await getIdToken()
      if (!token) return

      const response = await fetch("/api/admin/ai-chat/history", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const conversations = data.data || []
        
        // Agrupar por conversationId y contar mensajes
        const grouped: Record<string, { id: string; createdAt: Date; count: number }> = {}
        conversations.forEach((msg: any) => {
          const convId = msg.conversationId || "default"
          if (!grouped[convId]) {
            const msgDate = msg.createdAt?.toDate?.() || new Date(msg.createdAt)
            grouped[convId] = {
              id: convId,
              createdAt: msgDate,
              count: 0,
            }
          }
          grouped[convId].count++
        })

        setConversationsList(
          Object.values(grouped).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        )
      } else {
        // Si hay error (como índice faltante), simplemente no mostrar historial
        console.warn("No se pudo cargar el historial de conversaciones")
        setConversationsList([])
      }
    } catch (err) {
      console.error("Error cargando lista de conversaciones:", err)
      setConversationsList([])
    }
  }

  const loadChatHistory = async () => {
    setLoadingHistory(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const response = await fetch("/api/admin/ai-chat/history", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const conversations = data.data || []

        if (conversations.length > 0) {
          // Agrupar mensajes por conversationId (filtrar mensajes sin conversationId)
          const messagesByConv: Record<string, Message[]> = {}
          let latestConvId: string | null = null
          let latestDate: Date | null = null

          conversations.forEach((msg: any) => {
            // Solo procesar mensajes que tengan conversationId
            if (!msg.conversationId) return
            
            if (!messagesByConv[msg.conversationId]) {
              messagesByConv[msg.conversationId] = []
            }
            
            // Convertir createdAt de Firestore Timestamp a Date
            let messageDate: Date
            if (msg.createdAt?.toDate) {
              messageDate = msg.createdAt.toDate()
            } else if (msg.createdAt?.seconds) {
              messageDate = new Date(msg.createdAt.seconds * 1000)
            } else if (msg.createdAt instanceof Date) {
              messageDate = msg.createdAt
            } else {
              messageDate = new Date(msg.createdAt || Date.now())
            }
            
            // Encontrar la conversación más reciente basada en el último mensaje
            if (!latestDate || messageDate > latestDate) {
              latestDate = messageDate
              latestConvId = msg.conversationId
            }
            
            messagesByConv[msg.conversationId].push({
              role: msg.role,
              content: msg.content,
              timestamp: messageDate,
              improvedText: msg.improvedText,
              suggestions: msg.suggestions,
            })
          })

          // Cargar la conversación más reciente
          if (latestConvId && messagesByConv[latestConvId] && messagesByConv[latestConvId].length > 0) {
            // Ordenar mensajes por timestamp (más antiguo primero)
            const sortedMessages = messagesByConv[latestConvId].sort(
              (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
            )
            setMessages(sortedMessages)
            setConversationId(latestConvId)
            setConversationHistory(
              sortedMessages.map((m) => ({ role: m.role, content: m.content }))
            )
          } else {
            // Si no hay historial válido, mostrar mensaje de bienvenida
            showWelcomeMessage()
          }
        } else {
          showWelcomeMessage()
        }
      } else {
        // Si hay error (como índice faltante), mostrar mensaje de bienvenida sin historial
        console.warn("No se pudo cargar el historial. El índice de Firestore puede estar creándose.")
        showWelcomeMessage()
      }
    } catch (err) {
      console.error("Error cargando historial:", err)
      showWelcomeMessage()
    } finally {
      setLoadingHistory(false)
    }
  }

  const showWelcomeMessage = async () => {
    // Cargar mensaje de bienvenida desde la configuración
    try {
      const token = await getIdToken()
      if (token) {
        const response = await fetch("/api/admin/prompts", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          const welcomeMsg = data.data?.welcomeMessage || `¡Hola! Soy tu asistente de IA profesional. Tengo acceso completo a toda tu información del portafolio desde Firebase.`
          setMessages([
            {
              role: "assistant",
              content: welcomeMsg,
              timestamp: new Date(),
            },
          ])
          setConversationHistory([])
          setConversationId(null)
          setInput("")
          setError("")
          return
        }
      }
    } catch (error) {
      console.error("Error cargando mensaje de bienvenida:", error)
    }
    
    // Fallback a mensaje por defecto
    setMessages([
      {
        role: "assistant",
        content: `¡Hola! Soy tu asistente de IA profesional. Tengo acceso completo a toda tu información del portafolio desde Firebase.`,
        timestamp: new Date(),
      },
    ])
    setConversationHistory([])
    setConversationId(null)
    setInput("")
    setError("")
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setLoading(true)
    setError("")

    // Agregar mensaje del usuario
    const userMsg: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          conversationId: conversationId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al procesar el mensaje")
      }

      const data = await response.json()
      
      // Actualizar conversationId siempre que el servidor lo devuelva (para mantener consistencia)
      if (data.conversationId) {
        setConversationId(data.conversationId)
      }
      
      // Agregar respuesta del asistente
      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
        improvedText: data.improvedText,
        suggestions: data.suggestions,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setConversationHistory(data.conversationHistory || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el mensaje")
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Lo siento, hubo un error: ${err instanceof Error ? err.message : "Error desconocido"}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleApplySuggestion = (section: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      const button = document.activeElement as HTMLElement
      const originalText = button?.textContent
      if (button) button.textContent = "¡Copiado!"
      setTimeout(() => {
        if (button) button.textContent = originalText ?? ""
      }, 2000)
    })
    if (onApplySuggestion) {
      onApplySuggestion(section, content)
    }
  }

  // Función para limpiar markdown y convertir a texto plano legible
  const cleanMarkdownToPlainText = (text: string): string => {
    let cleaned = text
      // Eliminar títulos markdown (##, ###) pero mantener el texto como título
      .replace(/^#{1,6}\s+(.+)$/gm, '$1\n')
      // Eliminar negritas markdown (**texto**)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Eliminar emojis de títulos si existen
      .replace(/^[📄✨💡🎯🔧📝✅❌⚠️]\s*/gm, '')
      // Convertir listas markdown a texto plano
      .replace(/^[-•]\s+/gm, '• ')
      .replace(/^\d+\.\s+/gm, '')
      // Limpiar espacios múltiples pero mantener estructura
      .replace(/\n{4,}/g, '\n\n\n')
      // Limpiar espacios al inicio y final pero mantener saltos de línea importantes
      .split('\n')
      .map((line, idx, arr) => {
        const trimmed = line.trim()
        // Si es una línea vacía después de otra vacía, eliminar
        if (trimmed === '' && idx > 0 && arr[idx - 1].trim() === '') {
          return ''
        }
        return trimmed
      })
      .filter((line, idx, arr) => {
        // Eliminar líneas vacías duplicadas consecutivas
        if (line === '' && idx > 0 && arr[idx - 1] === '') {
          return false
        }
        return true
      })
      .join('\n')
      .trim()
    
    return cleaned
  }

  const handleCopyMessage = async (idx: number, content: string) => {
    const plainText = cleanMarkdownToPlainText(content)
    await navigator.clipboard.writeText(plainText)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleLikeMessage = async (idx: number, content: string) => {
    setLikedMessageIndices((prev) => new Set(prev).add(idx))
    try {
      const token = await getIdToken()
      if (!token) return
      await fetch("/api/admin/ai-chat/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })
    } catch (err) {
      console.error("Error guardando like:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Asistente de IA - Mejora tu Portafolio
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Tengo acceso a toda tu información profesional. Puedo ayudarte a mejorar cualquier sección.
              </p>
            </div>
            <div className="flex items-center gap-3 mr-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHistoryList(!showHistoryList)}
                className="shrink-0 h-9 w-9"
                title="Ver historial completo"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteAllConfirm(true)}
                className="shrink-0 h-9 w-9"
                title="Limpiar historial"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {showHistoryList ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              Historial de Conversaciones
            </h3>
            {conversationsList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 text-muted-foreground"
              >
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay conversaciones guardadas</p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {conversationsList.map((conv, idx) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setShowHistoryList(false)
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          Conversación del {conv.createdAt.toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {conv.count} mensaje{conv.count !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setConvToDelete({ id: conv.id, createdAt: conv.createdAt })
                          setShowDeleteConvConfirm(true)
                        }}
                        className="shrink-0"
                        title="Eliminar conversación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingHistory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4 text-muted-foreground text-sm"
              >
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                Cargando historial...
              </motion.div>
            )}
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted border border-border"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <>
                        <ChatMessageFormatter
                          content={msg.content}
                          improvedText={msg.improvedText}
                          suggestions={msg.suggestions}
                        />
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
                            onClick={() => handleCopyMessage(idx, msg.content)}
                          >
                            {copiedIndex === idx ? (
                              <Check className="w-4 h-4 mr-1 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 mr-1" />
                            )}
                            {copiedIndex === idx ? "Copiado" : "Copiar"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2 text-xs ${
                              likedMessageIndices.has(idx)
                                ? "text-primary"
                                : "text-muted-foreground hover:text-primary"
                            }`}
                            onClick={() => handleLikeMessage(idx, msg.content)}
                          >
                            <ThumbsUp
                              className={`w-4 h-4 mr-1 ${
                                likedMessageIndices.has(idx) ? "fill-current" : ""
                              }`}
                            />
                            {likedMessageIndices.has(idx) ? "Me gusta" : "Me gusta"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-3 justify-start"
              >
                <div className="bg-muted border border-border rounded-lg p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="border-t border-border p-4 shrink-0">
          <div className="flex gap-2 items-stretch">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
              placeholder="Pregunta o pide mejoras específicas... (ej: 'Mejora mi experiencia en X', 'Optimiza mi CV', 'Sugiere mejoras para mis proyectos')"
              className="flex-1 min-h-12 h-12 px-4 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="icon"
              className="shrink-0 h-12 w-12 rounded-lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Mejora mi CV completo")}
              className="text-xs"
            >
              Mejorar CV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Sugiere mejoras para mis experiencias laborales")}
              className="text-xs"
            >
              Mejorar Experiencias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("Optimiza las descripciones de mis proyectos")}
              className="text-xs"
            >
              Mejorar Proyectos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("¿Cómo puedo mejorar mi portafolio?")}
              className="text-xs"
            >
              Sugerencias Generales
            </Button>
          </div>
        </div>
      </DialogContent>
      
      {/* Modal de confirmación para eliminar todo el historial */}
      <ConfirmDialog
        open={showDeleteAllConfirm}
        onOpenChange={setShowDeleteAllConfirm}
        onConfirm={async () => {
          try {
            const token = await getIdToken()
            if (!token) return
            await fetch("/api/admin/ai-chat/history", {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            })
            showWelcomeMessage()
            loadConversationsList()
          } catch (err) {
            console.error("Error eliminando historial:", err)
          }
        }}
        title="¿Eliminar todo el historial?"
        description="Se eliminarán todas las conversaciones guardadas. Esta acción no se puede deshacer."
        confirmText="Eliminar todo"
        cancelText="Cancelar"
        variant="destructive"
      />
      
      {/* Modal de confirmación para eliminar conversación individual */}
      <ConfirmDialog
        open={showDeleteConvConfirm}
        onOpenChange={setShowDeleteConvConfirm}
        onConfirm={async () => {
          if (!convToDelete) return
          try {
            const token = await getIdToken()
            if (!token) return
            const response = await fetch(`/api/admin/ai-chat/history?id=${convToDelete.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            })
            if (response.ok) {
              // Recargar lista de conversaciones
              loadConversationsList()
              // Si era la conversación actual, mostrar mensaje de bienvenida
              if (conversationId === convToDelete.id) {
                showWelcomeMessage()
                setConversationId(null)
              }
              setConvToDelete(null)
            }
          } catch (err) {
            console.error("Error eliminando conversación:", err)
          }
        }}
        title="¿Eliminar esta conversación?"
        description={
          convToDelete
            ? `Se eliminará la conversación del ${convToDelete.createdAt.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}. Esta acción no se puede deshacer.`
            : "Esta acción no se puede deshacer."
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </Dialog>
  )
}
