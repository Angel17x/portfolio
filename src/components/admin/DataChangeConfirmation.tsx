"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, X, AlertCircle } from "lucide-react"
import { motion } from "motion/react"

export interface ProposedChange {
  section: "hero" | "about" | "experience" | "project" | "skill" | "education" | "contact"
  field?: string
  oldValue?: string
  newValue: string
  description?: string
  index?: number
  company?: string
  itemId?: string
  itemIndex?: number
}

interface DataChangeConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  changes: ProposedChange[]
  onConfirm: () => void
  loading?: boolean
}

export function DataChangeConfirmation({
  open,
  onOpenChange,
  changes,
  onConfirm,
  loading = false,
}: DataChangeConfirmationProps) {
  if (changes.length === 0) return null

  const getSectionLabel = (section: string) => {
    const labels: Record<string, string> = {
      hero: "Información Personal",
      about: "Resumen Profesional",
      experience: "Experiencia Laboral",
      project: "Proyectos",
      skill: "Habilidades",
      education: "Educación",
      contact: "Contacto",
    }
    return labels[section] || section
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            Confirmar Cambios en tus Datos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            La IA ha propuesto los siguientes cambios. Revisa cada uno y confirma si deseas aplicarlos:
          </p>

          <div className="space-y-4">
            {changes.map((change, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 bg-muted/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                        {getSectionLabel(change.section)}
                      </span>
                      {change.field && (
                        <span className="text-xs text-muted-foreground">
                          Campo: {change.field}
                        </span>
                      )}
                      {change.company && (
                        <span className="text-xs text-muted-foreground">
                          Empresa: {change.company}
                        </span>
                      )}
                      {(change.index !== undefined || change.itemIndex !== undefined) && (
                        <span className="text-xs text-muted-foreground">
                          Índice: {change.index ?? change.itemIndex}
                        </span>
                      )}
                    </div>
                    
                    {change.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {change.description}
                      </p>
                    )}

                    {change.oldValue && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Valor actual:</p>
                        <div className="bg-destructive/10 border border-destructive/20 rounded p-2 text-sm">
                          {change.oldValue}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Nuevo valor:</p>
                      <div className="bg-green-500/10 border border-green-500/20 rounded p-2 text-sm">
                        {change.newValue}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Aplicando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Confirmar y Aplicar Cambios
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
