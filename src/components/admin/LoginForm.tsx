"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login, getIdToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { FormField } from "./FormField"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Login con Firebase Auth
      await login(email, password)
      
      // Esperar a que el estado de Firebase Auth se actualice completamente
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Obtener el token (forzar refresh para asegurar que sea válido)
      const idToken = await getIdToken(true)
      
      if (!idToken) {
        throw new Error("No se pudo obtener el token. Verifica que Firebase Auth esté configurado correctamente.")
      }

      // Verificar el token con el servidor
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al iniciar sesión")
      }

      // Usar window.location para forzar una recarga completa y asegurar que el estado se actualice
      window.location.href = "/admin/dashboard"
    } catch (err) {
      console.error("Error en login:", err)
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">Inicia sesión para gestionar tu portafolio</p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <FormField label="Email" required>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md bg-background"
          placeholder="tu@email.com"
        />
      </FormField>

      <FormField label="Contraseña" required>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md bg-background"
          placeholder="••••••••"
        />
      </FormField>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  )
}
