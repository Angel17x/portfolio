"use client"

import { useState, useEffect } from "react"
import { getIdToken } from "@/lib/auth"
import type { ActivityLog } from "@/lib/logs"

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch("/api/admin/logs?limit=200", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Error al cargar logs")
      }

      const data = await response.json()
      setLogs(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar logs")
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "login":
        return "text-green-600 dark:text-green-400"
      case "logout":
        return "text-gray-600 dark:text-gray-400"
      case "create":
        return "text-blue-600 dark:text-blue-400"
      case "update":
        return "text-yellow-600 dark:text-yellow-400"
      case "delete":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      login: "Inició sesión",
      logout: "Cerró sesión",
      create: "Creó",
      update: "Actualizó",
      delete: "Eliminó",
    }
    return labels[action] || action
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando logs...</div>
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg md:text-xl font-semibold">Registro de Actividad</h2>
        <button
          onClick={loadLogs}
          className="px-3 md:px-4 py-2 text-xs md:text-sm border rounded-md hover:bg-accent w-full sm:w-auto"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium">Fecha</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium hidden sm:table-cell">Usuario</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium">Acción</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium hidden md:table-cell">Colección</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium hidden lg:table-cell">Documento</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium hidden lg:table-cell">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No hay registros de actividad
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/50">
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium hidden sm:table-cell truncate max-w-[150px]">
                        {log.userEmail}
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                        <span className={getActionColor(log.action)}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm hidden md:table-cell">
                        <span className="px-2 py-1 bg-muted rounded text-xs">
                          {log.collection}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-muted-foreground hidden lg:table-cell truncate max-w-[100px]">
                        {log.documentId || "-"}
                      </td>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-muted-foreground font-mono hidden lg:table-cell truncate max-w-[120px]">
                        {log.ipAddress || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
