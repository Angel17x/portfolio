"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "./ConfirmDialog"
import { getIdToken } from "@/lib/auth"
import { Trash2, Download, FileText, Calendar, CheckCircle2, Circle, Eye } from "lucide-react"

interface CVItem {
  id: string
  fileName: string
  url: string
  template: string
  generatedAt: string
  isLatest: boolean
  isActive: boolean
}

export function CVHistory() {
  const [cvs, setCvs] = useState<CVItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadCVs()
  }, [])

  const loadCVs = async () => {
    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/cv/list", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCvs(data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar CVs")
    } finally {
      setLoading(false)
    }
  }

  const deleteCV = async (id: string) => {
    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch(`/api/admin/cv/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Error al eliminar")

      setSuccess("CV eliminado correctamente")
      setTimeout(() => setSuccess(""), 3000)
      setDeleteId(null)
      await loadCVs()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  const activateCV = async (id: string) => {
    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch(`/api/admin/cv/${id}/activate`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Error al activar CV")

      setSuccess("CV activado correctamente. Este será el CV visible en la web.")
      setTimeout(() => setSuccess(""), 3000)
      await loadCVs()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al activar CV")
    }
  }

  const downloadCV = (url: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = fileName.split("/").pop() || "cv.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando historial...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Historial de CVs Generados
        </h3>
        <p className="text-sm text-muted-foreground">
          {cvs.length} CV{cvs.length !== 1 ? "s" : ""} generado{cvs.length !== 1 ? "s" : ""}
        </p>
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

      {cvs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay CVs generados aún.</p>
          <p className="text-sm mt-2">Genera tu primer CV desde la pestaña "Generar CV"</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Template</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Archivo</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cvs.map((cv) => (
                <tr
                  key={cv.id}
                  className={`border-b hover:bg-accent/50 transition-colors ${
                    cv.isActive ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {cv.isActive ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            Activo
                          </span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-5 h-5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Inactivo</span>
                        </>
                      )}
                      {cv.isLatest && (
                        <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                          Último
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium capitalize">{cv.template}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(cv.generatedAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-mono opacity-70 max-w-xs truncate">
                      {cv.fileName.split("/").pop()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {!cv.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activateCV(cv.id)}
                          className="text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Activar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadCV(cv.url, cv.fileName)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(cv.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteCV(deleteId)}
        title="¿Eliminar CV?"
        description="¿Estás seguro de eliminar este CV del historial? Esta acción no se puede deshacer y el archivo será eliminado permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  )
}
