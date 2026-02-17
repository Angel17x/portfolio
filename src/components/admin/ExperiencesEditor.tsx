"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "./FormField"
import { ConfirmDialog } from "./ConfirmDialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { getIdToken } from "@/lib/auth"
import type { ExperienceData } from "@/types/portfolio"

interface ExperienceWithId extends ExperienceData {
  id: string
}

export function ExperiencesEditor() {
  const [experiences, setExperiences] = useState<ExperienceWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadExperiences()
  }, [])

  const loadExperiences = async () => {
    try {
      const response = await fetch("/api/admin/experiences")
      if (response.ok) {
        const data = await response.json()
        setExperiences(data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar experiencias")
    } finally {
      setLoading(false)
    }
  }

  const saveExperience = async (exp: ExperienceWithId) => {
    setError("")
    setSuccess("")

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const url = exp.id.startsWith("exp-")
        ? `/api/admin/experiences/${exp.id}`
        : "/api/admin/experiences"
      const method = exp.id.startsWith("exp-") ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: exp.title,
          company: exp.company,
          period: exp.period,
          current: exp.current,
          description: exp.description,
          order: exp.order,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar")
      }

      setSuccess("Experiencia guardada correctamente")
      setTimeout(() => setSuccess(""), 3000)
      setEditingId(null)
      await loadExperiences()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    }
  }

  const deleteExperience = async (id: string) => {
    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch(`/api/admin/experiences/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Error al eliminar")

      setSuccess("Experiencia eliminada")
      setTimeout(() => setSuccess(""), 3000)
      setDeleteId(null)
      await loadExperiences()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const addNew = () => {
    const newExp: ExperienceWithId = {
      id: `new-${Date.now()}`,
      title: "",
      company: "",
      period: "",
      current: false,
      description: "",
      order: experiences.length,
    }
    setExperiences([...experiences, newExp])
    setEditingId(newExp.id)
  }

  const currentExp = experiences.find((exp) => exp.id === editingId)

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Experiencias</h2>
        <Button onClick={addNew}>+ Agregar Experiencia</Button>
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

      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{exp.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {exp.company} • {exp.period}
                  {exp.current && (
                    <span className="ml-2 text-primary">(Actual)</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(exp.id)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(exp.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
            <p className="text-sm">{exp.description}</p>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {currentExp && (
        <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <DialogTitle className="text-2xl font-bold">
                {currentExp.id.startsWith("new-") ? "Nueva Experiencia" : "Editar Experiencia"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6 px-6">
              <FormField label="Título del Puesto" required>
                <input
                  type="text"
                  value={currentExp.title}
                  onChange={(e) =>
                    setExperiences(
                      experiences.map((x) =>
                        x.id === currentExp.id ? { ...x, title: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Ej: Desarrollador Full Stack"
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </FormField>
              <FormField label="Empresa" required>
                <input
                  type="text"
                  value={currentExp.company}
                  onChange={(e) =>
                    setExperiences(
                      experiences.map((x) =>
                        x.id === currentExp.id ? { ...x, company: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Ej: Tech Solutions S.A."
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </FormField>
              <FormField label="Período" required>
                <input
                  type="text"
                  value={currentExp.period}
                  onChange={(e) =>
                    setExperiences(
                      experiences.map((x) =>
                        x.id === currentExp.id ? { ...x, period: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Ej: Enero 2020 - Diciembre 2022"
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </FormField>
              <FormField label="Descripción" required>
                <textarea
                  value={currentExp.description}
                  onChange={(e) =>
                    setExperiences(
                      experiences.map((x) =>
                        x.id === currentExp.id ? { ...x, description: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Describe tus responsabilidades, logros y contribuciones en este puesto..."
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                  rows={5}
                />
              </FormField>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                <input
                  type="checkbox"
                  id={`current-${currentExp.id}`}
                  checked={currentExp.current}
                  onChange={(e) =>
                    setExperiences(
                      experiences.map((x) =>
                        x.id === currentExp.id ? { ...x, current: e.target.checked } : x
                      )
                    )
                  }
                  className="w-5 h-5 rounded border-2 border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <label htmlFor={`current-${currentExp.id}`} className="text-sm font-medium cursor-pointer">
                  Trabajo actual
                </label>
              </div>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  if (currentExp.id.startsWith("new-")) {
                    setExperiences(experiences.filter((x) => x.id !== currentExp.id))
                  } else {
                    loadExperiences()
                  }
                }}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => saveExperience(currentExp)}
                className="min-w-[100px] font-medium"
              >
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteExperience(deleteId)}
        title="¿Eliminar experiencia?"
        description="¿Estás seguro de eliminar esta experiencia? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}
