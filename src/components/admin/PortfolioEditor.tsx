"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "./FormField"
import { FileUpload } from "./FileUpload"
import { getIdToken } from "@/lib/auth"
import { getAdminPortfolioEditorData } from "@/app/admin/actions"
import type { HeroData, AboutData, ContactData } from "@/types/portfolio"

export function PortfolioEditor() {
  const [hero, setHero] = useState<HeroData | null>(null)
  const [about, setAbout] = useState<AboutData | null>(null)
  const [contact, setContact] = useState<ContactData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const token = await getIdToken()
        if (!token) throw new Error("No autenticado")
        if (cancelled) return
        const data = await getAdminPortfolioEditorData(token)
        if (cancelled) return
        setHero(data.hero)
        setAbout(data.about)
        setContact(data.contact)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar datos")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const saveData = async (docId: string, data: unknown) => {
    setSaving(docId)
    setError("")
    setSuccess("")

    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch(`/api/admin/portfolio/${docId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar")
      }

      const responseData = await response.json()
      
      // Actualizar el estado local con los datos guardados del servidor
      if (docId === "hero" && responseData.data) {
        setHero(responseData.data as HeroData)
      } else if (docId === "about" && responseData.data) {
        setAbout(responseData.data as AboutData)
      } else if (docId === "contact" && responseData.data) {
        setContact(responseData.data as ContactData)
      }

      setSuccess(`${docId} guardado correctamente`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div className="space-y-4 md:space-y-8">
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

      {/* Hero */}
      {hero && (
        <section className="border rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Hero</h2>
          <div className="space-y-4">
            <FormField label="Subtítulo" required>
              <input
                type="text"
                value={hero.subtitle}
                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </FormField>
            <FormField label="Nombre" required>
              <input
                type="text"
                value={hero.name}
                onChange={(e) => setHero({ ...hero, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </FormField>
            <FormField label="Tagline" required>
              <textarea
                value={hero.tagline}
                onChange={(e) => setHero({ ...hero, tagline: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
                rows={3}
              />
            </FormField>
            <FormField label="GitHub URL" required>
              <input
                type="url"
                value={hero.githubUrl}
                onChange={(e) => setHero({ ...hero, githubUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </FormField>
            <FormField label="LinkedIn URL" required>
              <input
                type="url"
                value={hero.linkedinUrl}
                onChange={(e) => setHero({ ...hero, linkedinUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </FormField>
            <Button
              onClick={() => saveData("hero", hero)}
              disabled={saving === "hero"}
            >
              {saving === "hero" ? "Guardando..." : "Guardar Hero"}
            </Button>
          </div>
        </section>
      )}

      {/* About */}
      {about && (
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Acerca de</h2>
          <div className="space-y-4">
            <FormField label="Título" required>
              <input
                type="text"
                value={about.title}
                onChange={(e) => setAbout({ ...about, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </FormField>
            <FormField label="Subtítulo" required>
              <input
                type="text"
                value={about.subtitle}
                onChange={(e) => setAbout({ ...about, subtitle: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </FormField>
            <FormField label="Párrafos">
              <div className="space-y-2">
                {about.paragraphs.map((para, idx) => (
                  <textarea
                    key={idx}
                    value={para}
                    onChange={(e) => {
                      const newParagraphs = [...about.paragraphs]
                      newParagraphs[idx] = e.target.value
                      setAbout({ ...about, paragraphs: newParagraphs })
                    }}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    rows={3}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAbout({ ...about, paragraphs: [...about.paragraphs, ""] })
                  }
                >
                  + Agregar párrafo
                </Button>
              </div>
            </FormField>
            <FormField label="Idiomas">
              <div className="space-y-2">
                {about.languages.map((lang, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Idioma"
                      value={lang.label}
                      onChange={(e) => {
                        const newLanguages = [...about.languages]
                        newLanguages[idx] = { ...lang, label: e.target.value }
                        setAbout({ ...about, languages: newLanguages })
                      }}
                      className="flex-1 px-3 py-2 border rounded-md bg-background"
                    />
                    <input
                      type="text"
                      placeholder="Nivel"
                      value={lang.level}
                      onChange={(e) => {
                        const newLanguages = [...about.languages]
                        newLanguages[idx] = { ...lang, level: e.target.value }
                        setAbout({ ...about, languages: newLanguages })
                      }}
                      className="flex-1 px-3 py-2 border rounded-md bg-background"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setAbout({
                          ...about,
                          languages: about.languages.filter((_, i) => i !== idx),
                        })
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAbout({
                      ...about,
                      languages: [...about.languages, { label: "", level: "" }],
                    })
                  }
                >
                  + Agregar idioma
                </Button>
              </div>
            </FormField>
            <Button
              onClick={() => saveData("about", about)}
              disabled={saving === "about"}
            >
              {saving === "about" ? "Guardando..." : "Guardar About"}
            </Button>
          </div>
        </section>
      )}

      {/* Contact */}
      {contact && (
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Contacto</h2>
          <div className="space-y-4">
            <FormField label="Título" required>
              <input
                type="text"
                value={contact.title}
                onChange={(e) => setContact({ ...contact, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </FormField>
            <FormField label="Descripción" required>
              <textarea
                value={contact.description}
                onChange={(e) =>
                  setContact({ ...contact, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
                rows={3}
              />
            </FormField>
            <FormField label="Email" required>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </FormField>
            <FormField label="Teléfono" required>
              <input
                type="text"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </FormField>
            <FormField label="Ubicación" required>
              <input
                type="text"
                value={contact.location}
                onChange={(e) =>
                  setContact({ ...contact, location: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </FormField>
            <FormField label="GitHub URL" required>
              <input
                type="url"
                value={contact.githubUrl}
                onChange={(e) =>
                  setContact({ ...contact, githubUrl: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </FormField>
            <FormField label="LinkedIn URL" required>
              <input
                type="url"
                value={contact.linkedinUrl}
                onChange={(e) =>
                  setContact({ ...contact, linkedinUrl: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </FormField>
            <Button
              onClick={() => saveData("contact", contact)}
              disabled={saving === "contact"}
            >
              {saving === "contact" ? "Guardando..." : "Guardar Contacto"}
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}
