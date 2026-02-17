import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"

export async function GET() {
  try {
    const db = getAdminDb()
    if (!db) {
      // Retornar valores por defecto si Firebase no está configurado
      return NextResponse.json({
        data: {
          title: "Angel Lugo | Desarrollador Full Stack",
          description:
            "Portafolio de Angel Lugo - Desarrollador Full Stack especializado en JavaScript, React, Node.js, Angular, Flutter y microservicios",
          faviconUrl: "",
          cvUrl: "",
        },
      })
    }

    const doc = await db.collection("siteConfig").doc("main").get()

    if (!doc.exists) {
      return NextResponse.json({
        data: {
          title: "Angel Lugo | Desarrollador Full Stack",
          description:
            "Portafolio de Angel Lugo - Desarrollador Full Stack especializado en JavaScript, React, Node.js, Angular, Flutter y microservicios",
          faviconUrl: "",
          cvUrl: "",
        },
      })
    }

    return NextResponse.json({ data: doc.data() })
  } catch (error) {
    console.error("Error obteniendo configuración del sitio:", error)
    // Retornar valores por defecto en caso de error
    return NextResponse.json({
      data: {
        title: "Angel Lugo | Desarrollador Full Stack",
        description:
          "Portafolio de Angel Lugo - Desarrollador Full Stack especializado en JavaScript, React, Node.js, Angular, Flutter y microservicios",
        faviconUrl: "",
      },
    })
  }
}
