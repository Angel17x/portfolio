import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getPortfolioData } from "@/lib/portfolio-server"
import { getAdminDb, getAdminStorage } from "@/lib/firebase-admin"
import { CVConfigSchema } from "@/lib/validations/cv-config-schemas"
import { generateCVPDF } from "@/lib/cv/pdf-generator"
import { logCRUDAction } from "@/lib/log-helper"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Guardar headers antes de cualquier operación
    const origin = request.headers.get("origin")
    const host = request.headers.get("host")

    // Obtener datos del portfolio
    const portfolioData = await getPortfolioData()

    // Obtener configuración del CV
    const db = getAdminDb()
    let cvConfig
    if (db) {
      const doc = await db.collection("cvConfig").doc("main").get()
      if (doc.exists) {
        cvConfig = CVConfigSchema.parse(doc.data())
      } else {
        cvConfig = CVConfigSchema.parse({})
      }
    } else {
      cvConfig = CVConfigSchema.parse({})
    }

    // Generar PDF usando la función helper (retorna Buffer directamente)
    const pdfBuffer = await generateCVPDF(portfolioData, cvConfig)

    // Crear una copia del Buffer para usar en Storage (evita problemas de "locked")
    const pdfBufferCopy = Buffer.from(pdfBuffer)

    // Guardar en Firebase Storage y Firestore
    const storage = getAdminStorage()
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

    if (storage && bucketName && db) {
      try {
        const timestamp = Date.now()
        const fileName = `cvs/${timestamp}-cv-${cvConfig.template}.pdf`
        const bucket = storage.bucket(bucketName)
        const fileRef = bucket.file(fileName)

        // Subir a Storage usando la copia
        await fileRef.save(pdfBufferCopy, {
          metadata: {
            contentType: "application/pdf",
          },
        })

        await fileRef.makePublic()

        // Obtener URL usando los headers guardados
        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          origin ||
          `https://${host || "localhost:3000"}`
        const isProduction = !baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1")
        const savedUrl = isProduction
          ? `${baseUrl}/api/files/${fileName}`
          : `https://storage.googleapis.com/${bucket.name}/${fileName}`

        // Guardar metadata en Firestore
        const cvDoc = {
          fileName,
          url: savedUrl,
          template: cvConfig.template,
          generatedAt: new Date(),
          generatedBy: user.uid,
          isLatest: false, // Se actualizará después
        }

        // Marcar todos los CVs anteriores como no-latest y no-activo
        const previousCVs = await db.collection("generatedCVs").where("isLatest", "==", true).get()
        const batch = db.batch()
        previousCVs.docs.forEach((doc) => {
          batch.update(doc.ref, { isLatest: false, isActive: false })
        })
        await batch.commit()

        // Guardar nuevo CV como latest y activo por defecto
        cvDoc.isLatest = true
        cvDoc.isActive = true // Nuevo CV se activa automáticamente
        const docRef = await db.collection("generatedCVs").add(cvDoc)

        // Log de la acción (usar request original)
        try {
          await logCRUDAction(
            request,
            "create",
            "generatedCVs",
            docRef.id,
            { template: cvConfig.template }
          )
        } catch (logError) {
          // No fallar si el log falla
          console.error("Error en log:", logError)
        }
      } catch (storageError) {
        console.error("Error guardando CV en Storage:", storageError)
        // Continuar aunque falle el guardado, al menos descargar el PDF
      }
    }

    // Retornar el Buffer original como Uint8Array para evitar problemas de "locked"
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cv-${cvConfig.template}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generando PDF:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al generar PDF" },
      { status: 500 }
    )
  }
}
