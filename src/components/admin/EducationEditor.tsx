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
import type { EducationData } from "@/types/portfolio"

interface EducationWithId extends EducationData {
  id: string
}

export function EducationEditor() {
  const [education, setEducation] = useState<EducationWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadEducation()
  }, [])

  const loadEducation = async () => {
    try {
      const response = await fetch("/api/admin/education")
      if (response.ok) {
        const data = await response.json()
        setEducation(data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar educación")
    } finally {
      setLoading(false)
    }
  }

  const saveEducation = async (edu: EducationWithId) => {
    setError("")
    setSuccess("")

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const url = edu.id.startsWith("edu-")
        ? `/api/admin/education/${edu.id}`
        : "/api/admin/education"
      const method = edu.id.startsWith("edu-") ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          degree: edu.degree,
          institution: edu.institution,
          period: edu.period,
          order: edu.order,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar")
      }

      setSuccess("Educación guardada correctamente")
      setTimeout(() => setSuccess(""), 3000)
      setEditingId(null)
      await loadEducation()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    }
  }

  const deleteEducation = async (id: string) => {
    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch(`/api/admin/education/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Error al eliminar")

      setSuccess("Educación eliminada")
      setTimeout(() => setSuccess(""), 3000)
      setDeleteId(null)
      await loadEducation()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const addNew = () => {
    const newEdu: EducationWithId = {
      id: `new-${Date.now()}`,
      degree: "",
      institution: "",
      period: "",
      order: education.length,
    }
    setEducation([...education, newEdu])
    setEditingId(newEdu.id)
  }

  const currentEdu = education.find((edu) => edu.id === editingId)

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Educación</h2>
        <Button onClick={addNew}>+ Agregar Educación</Button>
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
        {education.map((edu) => (
          <div key={edu.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{edu.degree}</h3>
                <p className="text-sm text-muted-foreground">
                  {edu.institution} • {edu.period}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(edu.id)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(edu.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {currentEdu && (
        <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
          <DialogContent className="max-w-lg p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <DialogTitle className="text-2xl font-bold">
                {currentEdu.id.startsWith("new-") ? "Nueva Educación" : "Editar Educación"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6 px-6">
              <FormField label="Título o Grado" required>
                <input
                  type="text"
                  value={currentEdu.degree}
                  onChange={(e) =>
                    setEducation(
                      education.map((x) =>
                        x.id === currentEdu.id ? { ...x, degree: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Ej: Ingeniería en Sistemas, Licenciatura en..."
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </FormField>
              <FormField label="Institución" required>
                <input
                  type="text"
                  value={currentEdu.institution}
                  onChange={(e) =>
                    setEducation(
                      education.map((x) =>
                        x.id === currentEdu.id ? { ...x, institution: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Ej: Universidad Nacional, Instituto Tecnológico..."
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </FormField>
              <FormField label="Período" required>
                <input
                  type="text"
                  value={currentEdu.period}
                  onChange={(e) =>
                    setEducation(
                      education.map((x) =>
                        x.id === currentEdu.id ? { ...x, period: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Ej: 2020 - 2024"
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </FormField>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  if (currentEdu.id.startsWith("new-")) {
                    setEducation(education.filter((x) => x.id !== currentEdu.id))
                  } else {
                    loadEducation()
                  }
                }}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => saveEducation(currentEdu)}
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
        onConfirm={() => deleteId && deleteEducation(deleteId)}
        title="¿Eliminar educación?"
        description="¿Estás seguro de eliminar esta educación? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}
