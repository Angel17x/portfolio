"use client"

import { ReactNode } from "react"
import { motion } from "motion/react"
import { CheckCircle2, Lightbulb, FileText, Sparkles } from "lucide-react"

interface ChatMessageFormatterProps {
  content: string
  improvedText?: string
  suggestions?: {
    experience?: string
    project?: string
    skill?: string
    education?: string
    cv?: string
  }
}

export function ChatMessageFormatter({
  content,
  improvedText,
  suggestions,
}: ChatMessageFormatterProps) {
  // Función para parsear el contenido y extraer secciones estructuradas
  const parseContent = (text: string) => {
    const sections: Array<{ type: "h1" | "h2" | "h3" | "list" | "text" | "code"; content: string }> = []
    
    // Dividir por líneas
    const lines = text.split("\n")
    let currentSection: { type: "text" | "list"; content: string[] } | null = null
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Detectar títulos markdown (##, ###)
      if (trimmed.startsWith("###")) {
        if (currentSection) {
          sections.push({
            type: currentSection.type,
            content: currentSection.content.join("\n"),
          })
        }
        sections.push({ type: "h3", content: trimmed.replace(/^###\s*/, "") })
        currentSection = null
      }
      else if (trimmed.startsWith("##")) {
        if (currentSection) {
          sections.push({
            type: currentSection.type,
            content: currentSection.content.join("\n"),
          })
        }
        sections.push({ type: "h2", content: trimmed.replace(/^##\s*/, "") })
        currentSection = null
      }
      // Detectar títulos con emojis o en mayúsculas
      else if (trimmed.match(/^[📄✨💡🎯🔧📝✅❌⚠️]/) || 
          (trimmed.length > 0 && trimmed.length < 60 && trimmed.match(/^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s:]+$/))) {
        if (currentSection) {
          sections.push({
            type: currentSection.type,
            content: currentSection.content.join("\n"),
          })
        }
        sections.push({ type: "h2", content: trimmed })
        currentSection = null
      }
      // Detectar listas
      else if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.match(/^\d+\./)) {
        if (currentSection?.type !== "list") {
          if (currentSection) {
            sections.push({
              type: currentSection.type,
              content: currentSection.content.join("\n"),
            })
          }
          currentSection = { type: "list", content: [] }
        }
        currentSection.content.push(trimmed)
      }
      // Texto normal
      else if (trimmed.length > 0) {
        if (currentSection?.type !== "text") {
          if (currentSection) {
            sections.push({
              type: currentSection.type,
              content: currentSection.content.join("\n"),
            })
          }
          currentSection = { type: "text", content: [] }
        }
        currentSection.content.push(trimmed)
      }
    }
    
    if (currentSection) {
      sections.push({
        type: currentSection.type,
        content: currentSection.content.join("\n"),
      })
    }
    
    return sections
  }
  
  // Función para procesar texto con negrita markdown
  const processBold = (text: string) => {
    const parts: ReactNode[] = []
    const regex = /\*\*(.*?)\*\*/g
    let lastIndex = 0
    let match
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }
      parts.push(<strong key={match.index} className="font-semibold text-foreground">{match[1]}</strong>)
      lastIndex = regex.lastIndex
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }
    
    return parts.length > 0 ? parts : [text]
  }

  const sections = parseContent(content)

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
        >
          {section.type === "h2" && (
            <h3 className="text-lg font-bold mt-6 mb-3 flex items-center gap-2 text-foreground border-b border-border/50 pb-2">
              {section.content.match(/^[📄✨💡🎯🔧📝✅❌⚠️]/) && (
                <span className="text-xl">{section.content.match(/^[📄✨💡🎯🔧📝✅❌⚠️]/)?.[0]}</span>
              )}
              <span>{processBold(section.content.replace(/^[📄✨💡🎯🔧📝✅❌⚠️]\s*/, ""))}</span>
            </h3>
          )}
          
          {section.type === "h3" && (
            <h4 className="text-base font-semibold mt-4 mb-2 flex items-center gap-2 text-foreground/90">
              <span>{processBold(section.content)}</span>
            </h4>
          )}
          
          {section.type === "list" && (
            <ul className="space-y-2 ml-4 my-2">
              {section.content.split("\n").map((item, itemIdx) => {
                const cleanItem = item.replace(/^[•\-\d+\.]\s*/, "")
                return (
                  <li key={itemIdx} className="flex items-start gap-2">
                    <span className="text-primary mt-1.5 shrink-0">•</span>
                    <span className="text-sm leading-relaxed">{processBold(cleanItem)}</span>
                  </li>
                )
              })}
            </ul>
          )}
          
          {section.type === "text" && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap my-2">
              {processBold(section.content)}
            </p>
          )}
        </motion.div>
      ))}

      {/* Mostrar texto mejorado si existe */}
      {improvedText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-4 pt-4 border-t border-border/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-semibold">Texto Mejorado Listo para Usar:</span>
          </div>
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {improvedText}
            </pre>
          </div>
        </motion.div>
      )}

      {/* Mostrar sugerencias específicas */}
      {suggestions && Object.values(suggestions).some(Boolean) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 pt-4 border-t border-border/50 space-y-3"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-semibold">Sugerencias Específicas:</span>
          </div>
          
          {suggestions.experience && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Experiencia:</span>
              </div>
              <p className="text-xs leading-relaxed">{suggestions.experience}</p>
            </div>
          )}
          
          {suggestions.project && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Proyecto:</span>
              </div>
              <p className="text-xs leading-relaxed">{suggestions.project}</p>
            </div>
          )}
          
          {suggestions.cv && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">CV:</span>
              </div>
              <p className="text-xs leading-relaxed">{suggestions.cv}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
