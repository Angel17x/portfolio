"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getIdToken } from "@/lib/auth"
import { Upload, Image as ImageIcon, Loader2, Sparkles, X } from "lucide-react"

interface CVDesignAnalyzerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CVDesignAnalyzer({ open, onOpenChange }: CVDesignAnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen es demasiado grande (máximo 10MB)")
      return
    }

    setSelectedImage(file)
    setError("")
    setAnalysis(null)

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setAnalyzing(true)
    setError("")
    setAnalysis(null)

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const formData = new FormData()
      formData.append("image", selectedImage)
      if (customPrompt.trim()) {
        formData.append("prompt", customPrompt.trim())
      }

      const response = await fetch("/api/admin/cv/analyze-design", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al analizar diseño")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al analizar diseño")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectedImage(null)
    setPreview(null)
    setAnalysis(null)
    setError("")
    setCustomPrompt("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Analizar Diseño de CV con IA
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Sube una imagen de un CV que te guste y la IA analizará su diseño para sugerir mejoras
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              {preview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full max-h-96 rounded-lg shadow-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleReset}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedImage?.name} ({(selectedImage?.size || 0) / 1024} KB)
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <label htmlFor="cv-image-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Seleccionar Imagen de CV
                        </span>
                      </Button>
                    </label>
                    <input
                      id="cv-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Formatos soportados: JPG, PNG, WebP (máximo 10MB)
                  </p>
                </div>
              )}
            </div>

            {selectedImage && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Prompt personalizado (opcional):
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ej: Analiza específicamente los colores y el espaciado..."
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Analysis Section */}
          {analysis && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Análisis y Sugerencias
              </h3>
              <div className="p-4 bg-muted rounded-lg border border-border">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {analysis}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 shrink-0 flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={analyzing}>
            Limpiar
          </Button>
          <Button
            onClick={handleAnalyze}
            disabled={!selectedImage || analyzing}
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analizar Diseño
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
