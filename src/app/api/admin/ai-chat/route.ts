import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth-server"
import { getPortfolioData } from "@/lib/portfolio-server"
import { getAdminDb } from "@/lib/firebase-admin"
import { GoogleGenAI } from "@google/genai"
import { checkRateLimit, sanitizeString } from "@/lib/security-helpers"
import { PromptConfigSchema } from "@/lib/validations/prompt-schemas"

export async function POST(request: NextRequest) {
  try {
    // Validación de autenticación estricta
    const user = await getAuthUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: "No autenticado. Por favor inicia sesión." },
        { status: 401 }
      )
    }

    // Validar que el usuario tenga email (requisito para admin)
    if (!user.email) {
      return NextResponse.json(
        { error: "Usuario no válido" },
        { status: 403 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no configurada" },
        { status: 500 }
      )
    }

    // Rate limiting por usuario
    if (!checkRateLimit(user.uid, 20, 60000)) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor espera un momento." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { message, conversationHistory, context } = body

    // Validar y sanitizar mensaje
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 })
    }

    let sanitizedMessage: string
    try {
      sanitizedMessage = sanitizeString(message, 5000)
      // Validar longitud mínima
      if (sanitizedMessage.trim().length < 1) {
        return NextResponse.json(
          { error: "El mensaje no puede estar vacío" },
          { status: 400 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Mensaje inválido" },
        { status: 400 }
      )
    }

    // Obtener todos los datos del portfolio para dar contexto a la IA
    const portfolioData = await getPortfolioData()

    // Intentar obtener CV parseado si existe
    let parsedCVText: string | null = null
    try {
      const db = getAdminDb()
      if (db) {
        const cvDoc = await db.collection("cvParsed").doc("latest").get()
        if (cvDoc.exists) {
          const cvData = cvDoc.data()
          parsedCVText = cvData?.extractedText || null
        }
      }
    } catch (error) {
      console.error("Error obteniendo CV parseado:", error)
      // Continuar sin el CV parseado
    }

    const genAI = new GoogleGenAI({ apiKey })

    // Obtener configuración de prompts desde Firestore
    let promptConfig
    try {
      const db = getAdminDb()
      if (db) {
        const promptDoc = await db.collection("promptConfig").doc("main").get()
        if (promptDoc.exists) {
          promptConfig = PromptConfigSchema.parse(promptDoc.data())
        } else {
          // Usar valores por defecto
          promptConfig = PromptConfigSchema.parse({})
        }
      } else {
        promptConfig = PromptConfigSchema.parse({})
      }
    } catch (error) {
      console.error("Error obteniendo configuración de prompts, usando defaults:", error)
      promptConfig = PromptConfigSchema.parse({})
    }

    // Obtener respuestas que el usuario ha marcado como "me gusta" para adaptar el estilo
    let likedContext = ""
    try {
      const db = getAdminDb()
      if (db) {
        const likesSnapshot = await db
          .collection("aiChatLikes")
          .where("userId", "==", user.uid)
          .orderBy("createdAt", "desc")
          .limit(10)
          .get()
        if (!likesSnapshot.empty) {
          const snippets = likesSnapshot.docs.map((d) => d.data().contentSnippet).filter(Boolean)
          if (snippets.length > 0) {
            likedContext = `

PREFERENCIAS DEL USUARIO (respuestas que ha marcado como "me gusta" - prioriza este estilo y formato):
${snippets.map((s, i) => `--- Ejemplo ${i + 1} ---\n${s}`).join("\n\n")}`
          }
        }
      }
    } catch (err: any) {
      if (err?.code !== 9 && !err?.message?.includes("index")) {
        console.error("Error obteniendo likes para contexto:", err)
      }
    }

    // Construir el contexto completo para la IA usando el prompt configurable
    const systemContext = `${promptConfig.systemPrompt}
${likedContext}

INFORMACIÓN DEL USUARIO:

INFORMACIÓN DEL USUARIO:
- Nombre: ${portfolioData.hero.name}
- Subtítulo: ${portfolioData.hero.subtitle}
- Tagline: ${portfolioData.hero.tagline}
- GitHub: ${portfolioData.hero.githubUrl}
- LinkedIn: ${portfolioData.hero.linkedinUrl}

SOBRE MÍ:
${portfolioData.about.paragraphs.join("\n\n")}

EXPERIENCIAS LABORALES:
${portfolioData.experiences.map((exp, idx) => `
${idx + 1}. ${exp.title} en ${exp.company}
   Período: ${exp.period} ${exp.current ? "(Actual)" : ""}
   Descripción: ${exp.description}
`).join("\n")}

PROYECTOS:
${portfolioData.projects.map((proj, idx) => `
${idx + 1}. ${proj.title}
   Stack: ${proj.stack.join(", ")}
   Descripción: ${proj.description}
`).join("\n")}

HABILIDADES:
${portfolioData.skillGroups.map((sg) => `
- ${sg.title} (${sg.level}%): ${sg.skills.join(", ")}
`).join("\n")}

EDUCACIÓN:
${portfolioData.education.map((edu) => `
- ${edu.degree} en ${edu.institution} (${edu.period})
`).join("\n")}

CONTACTO:
- Email: ${portfolioData.contact.email}
- Teléfono: ${portfolioData.contact.phone}
- Ubicación: ${portfolioData.contact.location}

${parsedCVText ? `CV SUBIDO MANUALMENTE (TEXTO EXTRAÍDO):
${parsedCVText}

NOTA: El usuario tiene un CV subido manualmente. Puedes comparar este CV con los datos del portafolio y sugerir mejoras específicas basadas en ambos.` : ""}

${promptConfig.improvementInstructions}

Responde de manera conversacional, útil y profesional. 

IMPORTANTE: Estructura tus respuestas usando markdown:
- Usa ## para títulos principales
- Usa ### para subtítulos
- Usa **negrita** para resaltar información importante
- Usa listas con viñetas (-) para enumerar puntos
- Divide la información en secciones claras y bien organizadas
- Evita respuestas largas sin estructura - siempre organiza el contenido

Cuando proporciones mejoras, incluye el texto mejorado en el formato especificado para que pueda aplicarse directamente.`

    const history = conversationHistory || []
    
    // Construir el prompt con contexto completo
    let conversationPrompt = `${systemContext}

${context ? `\nCONTEXTO ADICIONAL:\n${context}\n` : ""}

HISTORIAL DE CONVERSACIÓN:
${history.length > 0 
  ? history.map((msg: { role: string; content: string }) => 
      `${msg.role === "user" ? "Usuario" : "Asistente"}: ${msg.content}`
    ).join("\n\n")
  : "Nueva conversación"
}

Usuario: ${sanitizedMessage}

Asistente:`

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversationPrompt,
    })

    const reply = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    // Extraer texto mejorado si existe (buscar múltiples formatos)
    let improvedText: string | undefined = undefined
    
    // Formato 1: TEXTO_MEJORADO: [texto]
    const improvedTextMatch1 = reply.match(/TEXTO_MEJORADO:\s*([\s\S]*?)(?=\n\n|$|EXPLICACIÓN|Sugerencia|Recomendación)/i)
    if (improvedTextMatch1) {
      improvedText = improvedTextMatch1[1].trim()
    }
    
    // Formato 2: Si no se encontró, buscar texto entre marcadores
    if (!improvedText) {
      const improvedTextMatch2 = reply.match(/```[\s\S]*?TEXTO_MEJORADO:\s*([\s\S]*?)```/i)
      if (improvedTextMatch2) {
        improvedText = improvedTextMatch2[1].trim()
      }
    }
    
    // Formato 3: Si el usuario pidió específicamente mejorar algo, intentar extraer el texto mejorado del final
    if (!improvedText && (message.toLowerCase().includes("mejora") || message.toLowerCase().includes("optimiza"))) {
      // Buscar el último párrafo sustancial que podría ser el texto mejorado
      const paragraphs = reply.split("\n\n").filter(p => p.trim().length > 50)
      if (paragraphs.length > 0) {
        const lastParagraph = paragraphs[paragraphs.length - 1]
        // Si el último párrafo no parece ser una explicación, podría ser el texto mejorado
        if (!lastParagraph.toLowerCase().includes("sugerencia") && 
            !lastParagraph.toLowerCase().includes("recomendación") &&
            !lastParagraph.toLowerCase().includes("por qué")) {
          improvedText = lastParagraph.trim()
        }
      }
    }

    // Detectar sugerencias específicas para secciones
    const sectionMatches = {
      experience: reply.match(/EXPERIENCIA[:\s]+([\s\S]*?)(?=\n\n|PROYECTO|HABILIDAD|EDUCACIÓN|CV|$)/i),
      project: reply.match(/PROYECTO[:\s]+([\s\S]*?)(?=\n\n|EXPERIENCIA|HABILIDAD|EDUCACIÓN|CV|$)/i),
      skill: reply.match(/HABILIDAD[:\s]+([\s\S]*?)(?=\n\n|EXPERIENCIA|PROYECTO|EDUCACIÓN|CV|$)/i),
      education: reply.match(/EDUCACIÓN[:\s]+([\s\S]*?)(?=\n\n|EXPERIENCIA|PROYECTO|HABILIDAD|CV|$)/i),
      cv: reply.match(/CV[:\s]+([\s\S]*?)(?=\n\n|EXPERIENCIA|PROYECTO|HABILIDAD|EDUCACIÓN|$)/i),
    }

    const updatedHistory = [
      ...history,
      { role: "user", content: sanitizedMessage },
      { role: "assistant", content: reply },
    ]

    // Guardar mensajes en Firestore para persistencia
    let savedConversationId: string | null = null
    try {
      const db = getAdminDb()
      if (db) {
        // Usar conversationId existente o crear uno nuevo
        savedConversationId = body.conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Guardar mensaje del usuario (usar mensaje sanitizado)
        await db.collection("aiChatHistory").add({
          userId: user.uid,
          conversationId: savedConversationId,
          role: "user",
          content: sanitizedMessage,
          createdAt: new Date(),
          metadata: {
            hasImprovedText: false,
          },
        })

        // Guardar respuesta del asistente
        await db.collection("aiChatHistory").add({
          userId: user.uid,
          conversationId: savedConversationId,
          role: "assistant",
          content: reply,
          improvedText: improvedText || null,
          suggestions: {
            experience: sectionMatches.experience?.[1]?.trim() || null,
            project: sectionMatches.project?.[1]?.trim() || null,
            skill: sectionMatches.skill?.[1]?.trim() || null,
            education: sectionMatches.education?.[1]?.trim() || null,
            cv: sectionMatches.cv?.[1]?.trim() || null,
          },
          createdAt: new Date(),
          metadata: {
            hasImprovedText: !!improvedText,
            hasSuggestions: !!(sectionMatches.experience || sectionMatches.project || sectionMatches.skill || sectionMatches.education || sectionMatches.cv),
          },
        })
      }
    } catch (saveError) {
      console.error("Error guardando historial (no crítico):", saveError)
      // No fallar la respuesta si hay error guardando historial
    }

    return NextResponse.json({
      reply,
      improvedText,
      conversationId: savedConversationId || body.conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      suggestions: {
        experience: sectionMatches.experience?.[1]?.trim(),
        project: sectionMatches.project?.[1]?.trim(),
        skill: sectionMatches.skill?.[1]?.trim(),
        education: sectionMatches.education?.[1]?.trim(),
        cv: sectionMatches.cv?.[1]?.trim(),
      },
      conversationHistory: updatedHistory,
    })
  } catch (error) {
    console.error("Error en chat con IA:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error al procesar el mensaje. Verifica que GEMINI_API_KEY esté configurada correctamente.",
      },
      { status: 500 }
    )
  }
}
