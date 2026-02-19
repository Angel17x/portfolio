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
import type { SkillGroupData } from "@/types/portfolio"

interface SkillGroupWithId extends SkillGroupData {
  id: string
  order?: number
}

export function SkillGroupsEditor() {
  const [skillGroups, setSkillGroups] = useState<SkillGroupWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadSkillGroups()
  }, [])

  const loadSkillGroups = async () => {
    try {
      const response = await fetch("/api/admin/skill-groups")
      if (response.ok) {
        const data = await response.json()
        setSkillGroups(data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar skill groups")
    } finally {
      setLoading(false)
    }
  }

  const saveSkillGroup = async (sg: SkillGroupWithId) => {
    setError("")
    setSuccess("")

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const url = sg.id.startsWith("sg-")
        ? `/api/admin/skill-groups/${sg.id}`
        : "/api/admin/skill-groups"
      const method = sg.id.startsWith("sg-") ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: sg.title,
          level: sg.level,
          accent: sg.accent,
          skills: sg.skills,
          ...(sg.order !== undefined && { order: sg.order }),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar")
      }

      setSuccess("Skill group guardado correctamente")
      setTimeout(() => setSuccess(""), 3000)
      setEditingId(null)
      await loadSkillGroups()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    }
  }

  const deleteSkillGroup = async (id: string) => {
    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch(`/api/admin/skill-groups/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Error al eliminar")

      setSuccess("Skill group eliminado")
      setTimeout(() => setSuccess(""), 3000)
      setDeleteId(null)
      await loadSkillGroups()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const addNew = () => {
    const newSg: SkillGroupWithId = {
      id: `new-${Date.now()}`,
      title: "",
      level: 50,
      accent: "from-primary to-primary/70",
      skills: [],
      order: skillGroups.length,
    }
    setSkillGroups([...skillGroups, newSg])
    setEditingId(newSg.id)
  }

  const currentSg = skillGroups.find((sg) => sg.id === editingId)

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Grupos de Habilidades</h2>
        <Button onClick={addNew}>+ Agregar Grupo</Button>
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
        {skillGroups.map((sg) => (
          <div key={sg.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{sg.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Nivel: {sg.level}% • {sg.skills.length} habilidades
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(sg.id)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(sg.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {sg.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-muted rounded text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {currentSg && (
        <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <DialogTitle className="text-2xl font-bold">
                {currentSg.id.startsWith("new-") ? "Nuevo Grupo de Habilidades" : "Editar Grupo de Habilidades"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6 px-6">
              <FormField label="Título del Grupo" required>
                <input
                  type="text"
                  value={currentSg.title}
                  onChange={(e) =>
                    setSkillGroups(
                      skillGroups.map((x) =>
                        x.id === currentSg.id ? { ...x, title: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Ej: Frontend, Backend, DevOps..."
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </FormField>
              <FormField label="Nivel de Dominio (0-100)" required>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={currentSg.level}
                  onChange={(e) =>
                    setSkillGroups(
                      skillGroups.map((x) =>
                        x.id === currentSg.id ? { ...x, level: parseInt(e.target.value) || 0 } : x
                      )
                    )
                  }
                  placeholder="Ej: 85"
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </FormField>
              <FormField label="Clases CSS para Gradiente" required>
                <input
                  type="text"
                  value={currentSg.accent}
                  onChange={(e) =>
                    setSkillGroups(
                      skillGroups.map((x) =>
                        x.id === currentSg.id ? { ...x, accent: e.target.value } : x
                      )
                    )
                  }
                  placeholder="from-primary to-primary/70"
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 font-mono text-sm"
                />
              </FormField>
              <FormField label="Habilidades">
                <div className="space-y-3">
                  {currentSg.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/30 border border-border min-h-[60px]">
                      {currentSg.skills.map((skill, idx) => (
                        <div
                          key={idx}
                          className="group relative inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md border border-primary/20 hover:bg-primary/20 transition-colors"
                        >
                          <input
                            type="text"
                            value={skill}
                            onChange={(e) => {
                              const newSkills = [...currentSg.skills]
                              newSkills[idx] = e.target.value
                              setSkillGroups(
                                skillGroups.map((x) =>
                                  x.id === currentSg.id ? { ...x, skills: newSkills } : x
                                )
                              )
                            }}
                            className="bg-transparent border-none outline-none text-sm font-medium min-w-[100px] max-w-[200px] text-primary placeholder:text-primary/50"
                            placeholder="Habilidad..."
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSkillGroups(
                                skillGroups.map((x) =>
                                  x.id === currentSg.id
                                    ? { ...x, skills: currentSg.skills.filter((_, i) => i !== idx) }
                                    : x
                                )
                              )
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-destructive ml-1"
                            title="Eliminar"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSkillGroups(
                        skillGroups.map((x) =>
                          x.id === currentSg.id ? { ...x, skills: [...x.skills, ""] } : x
                        )
                      )
                    }}
                    className="w-full sm:w-auto"
                  >
                    + Agregar Habilidad
                  </Button>
                  {currentSg.skills.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Agrega las habilidades que pertenecen a este grupo
                    </p>
                  )}
                </div>
              </FormField>
            </div>
            <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  if (currentSg.id.startsWith("new-")) {
                    setSkillGroups(skillGroups.filter((x) => x.id !== currentSg.id))
                  } else {
                    loadSkillGroups()
                  }
                }}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => saveSkillGroup(currentSg)}
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
        onConfirm={() => deleteId && deleteSkillGroup(deleteId)}
        title="¿Eliminar grupo de habilidades?"
        description="¿Estás seguro de eliminar este grupo de habilidades? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}
