import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getAdminDb } from "@/lib/firebase-admin"
import { GoogleGenAI } from "@google/genai"
import { PromptConfigSchema } from "@/lib/validations/prompt-schemas"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no configurada" },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null
    const prompt = formData.get("prompt") as string | null

    if (!imageFile) {
      return NextResponse.json({ error: "Imagen requerida" }, { status: 400 })
    }

    // Convertir imagen a base64
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString("base64")
    const mimeType = imageFile.type

    const genAI = new GoogleGenAI({ apiKey })

    // Obtener prompt de análisis desde configuración
    let analysisPrompt = prompt
    if (!analysisPrompt) {
      try {
        const db = getAdminDb()
        if (db) {
          const promptDoc = await db.collection("promptConfig").doc("main").get()
          if (promptDoc.exists) {
            const promptConfig = PromptConfigSchema.parse(promptDoc.data())
            analysisPrompt = promptConfig.cvAnalysisPrompt
          }
        }
      } catch (error) {
        console.error("Error obteniendo prompt de análisis, usando default:", error)
      }
      
      // Fallback a prompt por defecto
      if (!analysisPrompt) {
        analysisPrompt = `Analiza este CV y proporciona:
1. Elementos de diseño destacados (colores, tipografía, layout, espaciado)
2. Sugerencias de mejora específicas
3. Cómo aplicar estos elementos al diseño de un CV profesional
4. Recomendaciones de colores, fuentes y estructura

Sé específico y proporciona sugerencias prácticas que puedan implementarse.`
      }
    }

    // Usar la API de Gemini para análisis de imágenes
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            {
              text: analysisPrompt,
            },
            {
              inlineData: {
                mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
    })

    const analysis = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || ""

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("Error analizando diseño:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al analizar el diseño. Verifica que GEMINI_API_KEY esté configurada correctamente y que el modelo soporte análisis de imágenes.",
      },
      { status: 500 }
    )
  }
}
