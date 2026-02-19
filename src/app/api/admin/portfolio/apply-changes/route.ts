import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"
import { z } from "zod"
import type { DocumentReference } from "firebase-admin/firestore"

const ProposedChangeSchema = z.object({
  section: z.enum(["hero", "about", "experience", "project", "skill", "education", "contact"]),
  field: z.string().optional(),
  newValue: z.string(),
  itemId: z.string().optional(), // Para experiencias y proyectos específicos
  itemIndex: z.number().optional(),
  index: z.number().optional(), // Alias para itemIndex (lo que usa la IA)
  company: z.string().optional(), // Para buscar experiencias por nombre de empresa
})

const ApplyChangesSchema = z.object({
  changes: z.array(ProposedChangeSchema),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin no está configurado" }, { status: 500 })
    }

    const body = await request.json()
    const { changes } = ApplyChangesSchema.parse(body)

    const results = []

    for (const change of changes) {
      try {
        switch (change.section) {
          case "hero": {
            const heroDoc = db.collection("portfolio").doc("hero")
            const heroData = (await heroDoc.get()).data() || {}
            
            if (change.field) {
              await heroDoc.set({
                ...heroData,
                [change.field]: change.newValue,
              }, { merge: true })
            } else {
              // Si no hay campo específico, actualizar todo el objeto
              await heroDoc.set({
                ...heroData,
                ...JSON.parse(change.newValue),
              }, { merge: true })
            }
            results.push({ section: "hero", success: true })
            break
          }

          case "about": {
            const aboutDoc = db.collection("portfolio").doc("about")
            const aboutData = (await aboutDoc.get()).data() || {}
            
            if (change.field === "paragraphs") {
              await aboutDoc.set({
                ...aboutData,
                paragraphs: change.newValue.split("\n").filter(p => p.trim()),
              }, { merge: true })
            } else {
              await aboutDoc.set({
                ...aboutData,
                [change.field || "paragraphs"]: change.newValue,
              }, { merge: true })
            }
            results.push({ section: "about", success: true })
            break
          }

          case "experience": {
            let experienceDoc: DocumentReference | null = null
            
            // Buscar experiencia por ID, índice o nombre de empresa
            if (change.itemId) {
              experienceDoc = db.collection("experiences").doc(change.itemId)
            } else {
              const experiencesSnapshot = await db.collection("experiences").orderBy("order").get()
              const experiences = experiencesSnapshot.docs
              
              // Buscar por índice (puede venir como index o itemIndex)
              const targetIndex = change.index ?? change.itemIndex
              if (targetIndex !== undefined && targetIndex >= 0 && targetIndex < experiences.length) {
                experienceDoc = experiences[targetIndex].ref
              } 
              // Buscar por nombre de empresa (búsqueda flexible)
              else if (change.company) {
                const companyLower = change.company.toLowerCase().trim()
                const found = experiences.find(doc => {
                  const data = doc.data()
                  const docCompany = data.company?.toLowerCase().trim() || ""
                  // Buscar coincidencia exacta o parcial
                  return docCompany === companyLower || 
                         docCompany.includes(companyLower) || 
                         companyLower.includes(docCompany)
                })
                if (found) {
                  experienceDoc = found.ref
                }
              }
              // Si no se encontró, usar la primera experiencia
              else if (experiences.length > 0) {
                experienceDoc = experiences[0].ref
              }
            }
            
            if (experienceDoc) {
              const experienceData = (await experienceDoc.get()).data() || {}
              
              // Actualizar el campo especificado o description por defecto
              const updateData: any = {}
              if (change.field) {
                updateData[change.field] = change.newValue
                
                // Si se actualiza el período, verificar si debe actualizar el campo "current"
                if (change.field === "period") {
                  // Si el nuevo período no contiene "Actual", "Presente" o "Actualidad", marcar como no actual
                  const periodLower = change.newValue.toLowerCase()
                  const isCurrent = periodLower.includes("actual") || 
                                   periodLower.includes("presente") || 
                                   periodLower.includes("actualidad")
                  updateData.current = isCurrent
                }
              } else {
                // Si no hay campo específico pero el newValue parece ser un período, actualizar period
                if (change.newValue.includes("-") && (change.newValue.includes("2023") || change.newValue.includes("2024") || change.newValue.includes("2025"))) {
                  updateData.period = change.newValue
                  // Verificar si debe actualizar current
                  const periodLower = change.newValue.toLowerCase()
                  const isCurrent = periodLower.includes("actual") || 
                                   periodLower.includes("presente") || 
                                   periodLower.includes("actualidad")
                  updateData.current = isCurrent
                } else {
                  updateData.description = change.newValue
                }
              }
              
              await experienceDoc.set({
                ...experienceData,
                ...updateData,
              }, { merge: true })
              
              results.push({ section: "experience", success: true })
            } else {
              results.push({ section: "experience", success: false, error: "Experiencia no encontrada" })
            }
            break
          }

          case "project": {
            if (change.itemId) {
              await db.collection("projects").doc(change.itemId).set({
                description: change.newValue,
              }, { merge: true })
            } else {
              const projects = await db.collection("projects").orderBy("order").limit(1).get()
              if (!projects.empty) {
                await projects.docs[0].ref.set({
                  description: change.newValue,
                }, { merge: true })
              }
            }
            results.push({ section: "project", success: true })
            break
          }

          case "contact": {
            const contactDoc = db.collection("portfolio").doc("contact")
            const contactData = (await contactDoc.get()).data() || {}
            
            if (change.field) {
              await contactDoc.set({
                ...contactData,
                [change.field]: change.newValue,
              }, { merge: true })
            }
            results.push({ section: "contact", success: true })
            break
          }

          default:
            results.push({ section: change.section, success: false, error: "Sección no soportada" })
        }
      } catch (error) {
        console.error(`Error aplicando cambio en ${change.section}:`, error)
        results.push({ section: change.section, success: false, error: error instanceof Error ? error.message : "Error desconocido" })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.issues }, { status: 400 })
    }
    console.error("Error aplicando cambios:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    )
  }
}
