"use client"

import { useState, useEffect, useRef } from "react"
import { pdf } from "@react-pdf/renderer"
import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Download, X } from "lucide-react"
import { getIdToken } from "@/lib/auth"
import { HarvardCVTemplate } from "@/components/cv/templates/HarvardCVTemplate"
import { ModernCVTemplate } from "@/components/cv/templates/ModernCVTemplate"
import type { CVConfig } from "@/lib/validations/cv-config-schemas"
import type {
  HeroData,
  AboutData,
  ExperienceData,
  ProjectData,
  SkillGroupData,
  EducationData,
  ContactData,
} from "@/types/portfolio"

interface PortfolioData {
  hero: HeroData
  about: AboutData
  experiences: ExperienceData[]
  projects: ProjectData[]
  skillGroups: SkillGroupData[]
  education: EducationData[]
  contact: ContactData
}

interface CVPreviewProps {
  config: CVConfig
  open: boolean
  onOpenChange: (open: boolean) => void
  inline?: boolean
}

export function CVPreview({ config, open, onOpenChange, inline = false }: CVPreviewProps) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string>("")
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if ((open || inline) && config) {
      loadPortfolioData()
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [open, inline])

  const loadPortfolioData = async () => {
    try {
      setLoading(true)
      setError("")
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/portfolio-data", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Error al cargar datos del portfolio")
      }

      const data = await response.json()
      setPortfolioData(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (portfolioData && config && (open || inline)) {
      // Debounce para evitar regenerar en cada cambio pequeño
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      
      debounceTimerRef.current = setTimeout(() => {
        generatePreview()
      }, 500) // Esperar 500ms después del último cambio

      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
      }
    }
  }, [portfolioData, config, open, inline])

  const generatePreview = async () => {
    if (!portfolioData) return

    try {
      setLoading(true)
      setError("")

      let pdfDoc: React.ReactElement

      switch (config.template) {
        case "harvard":
          pdfDoc = React.createElement(HarvardCVTemplate, {
            portfolioData,
            config,
          })
          break
        case "modern":
          pdfDoc = React.createElement(ModernCVTemplate, {
            portfolioData,
            config,
          })
          break
        case "classic":
          pdfDoc = React.createElement(HarvardCVTemplate, {
            portfolioData,
            config,
          })
          break
        default:
          pdfDoc = React.createElement(HarvardCVTemplate, {
            portfolioData,
            config,
          })
      }

      // Generar blob del PDF
      const blob = await pdf(pdfDoc).toBlob()
      
      // Revocar URL anterior si existe
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }

      // Crear nueva URL
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (err) {
      console.error("Error generando preview:", err)
      setError(err instanceof Error ? err.message : "Error al generar preview")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!pdfUrl) return
    try {
      const a = document.createElement("a")
      a.href = pdfUrl
      a.download = `cv-${config.template}-preview.pdf`
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
      }, 200)
    } catch (e) {
      console.error("Error al descargar CV:", e)
    }
  }

  const previewContent = (
    <div className="flex-1 overflow-auto bg-muted/30">
      {loading && (
        <div className="flex items-center justify-center h-full min-h-[600px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Generando vista previa...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-full min-h-[600px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={generatePreview}>
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {pdfUrl && !loading && (
        <div className="flex justify-center p-4">
          <iframe
            src={pdfUrl}
            className="w-full border border-border rounded-lg shadow-lg"
            style={{ height: inline ? "70vh" : "80vh", minHeight: "600px" }}
            title="Vista previa del CV"
          />
        </div>
      )}
    </div>
  )

  if (inline) {
    return previewContent
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">
              Vista Previa del CV
            </DialogTitle>
            <div className="flex gap-2">
              {pdfUrl && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-9 w-9"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        {previewContent}
      </DialogContent>
    </Dialog>
  )
}
