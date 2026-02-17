"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "./FormField"
import { ConfirmDialog } from "./ConfirmDialog"
import { IconPicker } from "./IconPicker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { getIdToken } from "@/lib/auth"
import type { ProjectData, ProjectIcon } from "@/types/portfolio"
import {
  BotIcon,
  GlobeIcon,
  SmartphoneIcon,
  ShieldIcon,
  CodeIcon,
  DatabaseIcon,
  CloudIcon,
  ServerIcon,
  LaptopIcon,
  MonitorIcon,
  PaletteIcon,
  RocketIcon,
  ZapIcon,
  LockIcon,
  KeyIcon,
  WifiIcon,
  CpuIcon,
  BoxIcon,
  PackageIcon,
  LayersIcon,
  GitBranchIcon,
  SettingsIcon,
  Wand2Icon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react"

interface ProjectWithId extends ProjectData {
  id: string
}

const iconMap: Record<ProjectIcon, LucideIcon> = {
  bot: BotIcon,
  globe: GlobeIcon,
  smartphone: SmartphoneIcon,
  shield: ShieldIcon,
  code: CodeIcon,
  database: DatabaseIcon,
  cloud: CloudIcon,
  server: ServerIcon,
  laptop: LaptopIcon,
  monitor: MonitorIcon,
  palette: PaletteIcon,
  rocket: RocketIcon,
  zap: ZapIcon,
  lock: LockIcon,
  key: KeyIcon,
  wifi: WifiIcon,
  cpu: CpuIcon,
  box: BoxIcon,
  package: PackageIcon,
  layers: LayersIcon,
  "git-branch": GitBranchIcon,
  settings: SettingsIcon,
  "wand-2": Wand2Icon,
  sparkles: SparklesIcon,
}

export function ProjectsEditor() {
  const [projects, setProjects] = useState<ProjectWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar proyectos")
    } finally {
      setLoading(false)
    }
  }

  const saveProject = async (proj: ProjectWithId) => {
    setError("")
    setSuccess("")

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const url = proj.id.startsWith("proj-")
        ? `/api/admin/projects/${proj.id}`
        : "/api/admin/projects"
      const method = proj.id.startsWith("proj-") ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: proj.title,
          stack: proj.stack,
          description: proj.description,
          icon: proj.icon,
          order: proj.order,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar")
      }

      setSuccess("Proyecto guardado correctamente")
      setTimeout(() => setSuccess(""), 3000)
      setEditingId(null)
      await loadProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Error al eliminar")

      setSuccess("Proyecto eliminado")
      setTimeout(() => setSuccess(""), 3000)
      setDeleteId(null)
      await loadProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const addNew = () => {
    const newProj: ProjectWithId = {
      id: `new-${Date.now()}`,
      title: "",
      stack: [],
      description: "",
      icon: "rocket",
      order: projects.length,
    }
    setProjects([...projects, newProj])
    setEditingId(newProj.id)
  }

  const currentProj = projects.find((proj) => proj.id === editingId)

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Proyectos</h2>
        <Button onClick={addNew}>+ Agregar Proyecto</Button>
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
        {projects.map((proj) => (
          <div key={proj.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{proj.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {proj.stack.join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(proj.id)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(proj.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
            <p className="text-sm">{proj.description}</p>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {currentProj && (
        <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
              <DialogTitle className="text-2xl font-bold">
                {currentProj.id.startsWith("new-") ? "Nuevo Proyecto" : "Editar Proyecto"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6 px-6">
              {/* Preview del Icono - Mejorado */}
              <FormField label="Icono del Proyecto" required>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="flex items-center justify-center w-20 h-20 rounded-xl border-2 border-border bg-gradient-to-br from-card to-muted/50 shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:scale-105">
                      {(() => {
                        const Icon = iconMap[currentProj.icon] || GlobeIcon
                        return <Icon className="w-10 h-10 text-primary transition-transform duration-200 group-hover:scale-110" />
                      })()}
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIconPickerOpen(true)}
                    className="flex-1 h-11 font-medium"
                  >
                    Cambiar Icono
                  </Button>
                </div>
              </FormField>

              {/* Título - Mejorado */}
              <FormField label="Título del Proyecto" required>
                <input
                  type="text"
                  value={currentProj.title}
                  onChange={(e) =>
                    setProjects(
                      projects.map((x) =>
                        x.id === currentProj.id ? { ...x, title: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Ej: Sistema de Gestión de Inventario"
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </FormField>

              {/* Descripción - Mejorada */}
              <FormField label="Descripción" required>
                <textarea
                  value={currentProj.description}
                  onChange={(e) =>
                    setProjects(
                      projects.map((x) =>
                        x.id === currentProj.id ? { ...x, description: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Describe el proyecto, sus características principales y objetivos..."
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                  rows={5}
                />
              </FormField>

              {/* Stack - Mejorado con badges */}
              <FormField label="Stack Tecnológico">
                <div className="space-y-3">
                  {currentProj.stack.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/30 border border-border min-h-[60px]">
                      {currentProj.stack.map((tech, idx) => (
                        <div
                          key={idx}
                          className="group relative inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md border border-primary/20 hover:bg-primary/20 transition-colors"
                        >
                          <input
                            type="text"
                            value={tech}
                            onChange={(e) => {
                              const newStack = [...currentProj.stack]
                              newStack[idx] = e.target.value
                              setProjects(
                                projects.map((x) =>
                                  x.id === currentProj.id ? { ...x, stack: newStack } : x
                                )
                              )
                            }}
                            className="bg-transparent border-none outline-none text-sm font-medium min-w-[100px] max-w-[200px] text-primary placeholder:text-primary/50"
                            placeholder="Tecnología..."
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setProjects(
                                projects.map((x) =>
                                  x.id === currentProj.id
                                    ? { ...x, stack: currentProj.stack.filter((_, i) => i !== idx) }
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
                      setProjects(
                        projects.map((x) =>
                          x.id === currentProj.id ? { ...x, stack: [...x.stack, ""] } : x
                        )
                      )
                    }}
                    className="w-full sm:w-auto"
                  >
                    + Agregar Tecnología
                  </Button>
                  {currentProj.stack.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      Agrega las tecnologías utilizadas en este proyecto
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
                  if (currentProj.id.startsWith("new-")) {
                    setProjects(projects.filter((x) => x.id !== currentProj.id))
                  } else {
                    loadProjects()
                  }
                }}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => saveProject(currentProj)}
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
        onConfirm={() => deleteId && deleteProject(deleteId)}
        title="¿Eliminar proyecto?"
        description="¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />

      {/* Modal de selección de iconos */}
      {currentProj && (
        <IconPicker
          open={iconPickerOpen}
          onOpenChange={setIconPickerOpen}
          selectedIcon={currentProj.icon}
          onSelect={(icon) => {
            setProjects(
              projects.map((x) =>
                x.id === currentProj.id ? { ...x, icon } : x
              )
            )
          }}
        />
      )}
    </div>
  )
}
