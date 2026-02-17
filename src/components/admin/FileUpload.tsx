"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getIdToken } from "@/lib/auth"

interface FileUploadProps {
  folder?: string
  accept?: string
  onUploadComplete: (url: string) => void
  currentUrl?: string
  label?: string
}

export function FileUpload({
  folder = "cv",
  accept = "application/pdf",
  onUploadComplete,
  currentUrl,
  label = "Subir archivo",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setUploading(true)

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al subir archivo")
      }

      const data = await response.json()
      onUploadComplete(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir archivo")
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="cursor-pointer">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <Button type="button" variant="outline" size="sm" asChild>
            <span>{uploading ? "Subiendo..." : label}</span>
          </Button>
        </label>
        {currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Ver archivo actual
          </a>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
