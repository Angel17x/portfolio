"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileDownIcon } from "lucide-react"

interface CVDownloadLinkProps {
  fallbackUrl?: string
  children?: React.ReactNode
  className?: string
  asButton?: boolean
}

export function CVDownloadLink({
  fallbackUrl,
  children,
  className,
  asButton = false,
}: CVDownloadLinkProps) {
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestCV = async () => {
      try {
        // Primero intentar obtener el último CV generado
        const cvResponse = await fetch("/api/cv/latest")
        if (cvResponse.ok) {
          const cvData = await cvResponse.json()
          // Usar el endpoint de descarga
          const downloadUrl = `/api/cv/download?file=${encodeURIComponent(cvData.fileName)}`
          setCvUrl(downloadUrl)
          setLoading(false)
          return
        }

        // Si no hay CV generado, obtener cvUrl de site-config
        const configResponse = await fetch("/api/site-config")
        if (configResponse.ok) {
          const configData = await configResponse.json()
          if (configData.data?.cvUrl) {
            setCvUrl(configData.data.cvUrl)
          } else {
            setCvUrl(fallbackUrl || "#")
          }
        } else {
          setCvUrl(fallbackUrl || "#")
        }
      } catch (error) {
        console.error("Error obteniendo CV:", error)
        setCvUrl(fallbackUrl || "#")
      } finally {
        setLoading(false)
      }
    }

    fetchLatestCV()
  }, [fallbackUrl])

  if (loading) {
    return null // O un spinner si prefieres
  }

  const content = children || (
    <>
      <FileDownIcon className="size-5" />
      Descargar CV
    </>
  )

  if (asButton) {
    return (
      <Link
        href={cvUrl || fallbackUrl || "#"}
        download
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </Link>
    )
  }

  return (
    <Link
      href={cvUrl || fallbackUrl || "#"}
      download
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </Link>
  )
}
