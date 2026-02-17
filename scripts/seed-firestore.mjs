/**
 * Script para poblar Firestore con los datos del portafolio.
 * Ejecutar con: npm run seed:firebase
 *
 * Requiere: Firebase Admin SDK y las credenciales en FIREBASE_SERVICE_ACCOUNT
 * o GOOGLE_APPLICATION_CREDENTIALS apuntando al JSON de la cuenta de servicio.
 *
 * Índices: Las consultas compuestas (p. ej. historial del chat IA) necesitan índices.
 * Una vez configurado Firebase CLI (firebase login + firebase use <project-id>), ejecuta:
 *   npm run firestore:indexes
 * O crea el índice desde el enlace que muestra Firestore en el error.
 * El archivo firestore.indexes.json ya está en el proyecto.
 */
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

// Cargar variables de entorno desde .env.local manualmente
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, "..", ".env.local")

try {
  const envFile = readFileSync(envPath, "utf-8")
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim()
      // Remover comillas si existen
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
} catch (error) {
  console.warn("No se pudo cargar .env.local, usando variables de entorno del sistema")
}

let firebaseConfig

// Intentar cargar desde FIREBASE_SERVICE_ACCOUNT (string JSON)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  } catch (e) {
    console.error("Error parseando FIREBASE_SERVICE_ACCOUNT:", e.message)
  }
}

if (!firebaseConfig?.project_id) {
  console.error(
    "Configura GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT con las credenciales de Firebase Admin"
  )
  process.exit(1)
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(firebaseConfig) })
}

const db = getFirestore()

const portfolio = {
  hero: {
    subtitle: "Desarrollador Full Stack",
    name: "Angel Lugo",
    tagline:
      "Creo soluciones web y móviles con JavaScript, React, Node.js y más. Interfaces intuitivas y arquitecturas escalables.",
    cvUrl: "/Angel-Lugo-CV.pdf",
    githubUrl: "https://github.com/Angel17x",
    linkedinUrl: "https://www.linkedin.com/in/angel-lugo-fullstack-developer",
  },
  about: {
    title: "Estudiante de Ingeniería Informática",
    subtitle: "Un poco de mi trayectoria",
    paragraphs: [
      "Soy estudiante de Ingeniería Informática, apasionado por el desarrollo web y móvil. Tengo sólida experiencia en el diseño y desarrollo de soluciones full stack con tecnologías como JavaScript, Node.js, React, Angular, Flutter, Spring Boot, Next.js y Quarkus.",
      "Me especializo en la creación de interfaces intuitivas, así como en la implementación y optimización de microservicios y arquitecturas escalables con bases de datos SQL y NoSQL (Oracle, PostgreSQL, SQL Server, MySQL, MongoDB).",
    ],
    languages: [
      { label: "Español", level: "Nativo" },
      { label: "Inglés", level: "Lectura" },
    ],
  },
  contact: {
    title: "¿Tienes un proyecto en mente?",
    description:
      "Estoy disponible para nuevas oportunidades. No dudes en contactarme.",
    email: "angel26078613@gmail.com",
    phone: "+58 414 237 4668",
    cvUrl: "/Angel-Lugo-CV.pdf",
    githubUrl: "https://github.com/Angel17x",
    linkedinUrl: "https://www.linkedin.com/in/angel-lugo-fullstack-developer",
    location: "Venezuela",
  },
}

const experiences = [
  {
    order: 0,
    title: "Desarrollador Backend",
    company: "Global Resource",
    period: "Abril 2025 - Actualidad",
    current: true,
    description:
      "Diseño de soluciones empresariales robustas con microservicios en Quarkus, Oracle y PostgreSQL. Implementación de arquitecturas en capas para escalabilidad óptima. Proyectos destacados para clientes como Telefónica.",
  },
  {
    order: 1,
    title: "Desarrollador Fullstack",
    company: "Inteligencia Artificial",
    period: "Oct 2025 - Actualidad",
    current: true,
    description:
      "Aplicación web y móvil con IA: chatbot conversacional y prompts dinámicos. Backend con Node.js y Drizzle, frontend con Next.js para una experiencia fluida.",
  },
  {
    order: 2,
    title: "Desarrollador Fullstack",
    company: "Atenea Mercantil",
    period: "Agosto 2023 - Actualidad",
    current: false,
    description:
      "Angular, React, Next.js, Spring Boot y SQL Server en Azure. Intranet con SharePoint y SPFX. Backend del sitio web del Banco Mercantil con microservicios Spring Boot e integración WordPress + Next.js.",
  },
  {
    order: 3,
    title: "Desarrollador Fullstack",
    company: "Paguetodo",
    period: "Octubre 2021 - Mayo 2023",
    current: false,
    description:
      "Proyectos en Angular y Flutter. Pinpagos: app de pagos con Bluetooth, lectura de tarjetas. Servicepay Pos: pagos de servicios. Proyecto Mercantil Seguros con Angular y Spring Boot para gestión de pólizas.",
  },
  {
    order: 4,
    title: "Técnico en computación y redes",
    company: "Laser Print Soluciones",
    period: "Enero 2020 - Mayo 2020",
    current: false,
    description:
      "Instalación y configuración de redes, cableado estructurado, equipos fiscales y de redes.",
  },
  {
    order: 5,
    title: "Consultor y técnico en redes",
    company: "Sistemas y Tecnologías DMX",
    period: "Julio 2019 - Enero 2020",
    current: false,
    description:
      "Consultor en sistema Saint: instalación, configuración, resolución de fallas en bases de datos y eliminación de software malicioso.",
  },
]

const projects = [
  {
    order: 0,
    title: "App con IA - Chatbot Salomón",
    stack: ["Next.js", "Node.js", "Flutter", "Drizzle", "IA"],
    description:
      "Aplicación web y móvil centrada en IA con chatbot conversacional y sistema de prompts dinámicos para respuestas precisas y personalizadas.",
    icon: "bot",
  },
  {
    order: 1,
    title: "Sitio web Banco Mercantil",
    stack: ["Next.js", "Spring Boot", "WordPress"],
    description:
      "Desarrollo backend con microservicios en Java Spring Boot e integración con WordPress. Frontend con Next.js para el sitio público del banco.",
    icon: "globe",
  },
  {
    order: 2,
    title: "Pinpagos - App de pagos",
    stack: ["Flutter", "Bluetooth"],
    description:
      "App móvil para realizar pagos. Diseño completo, navegación, conexión Bluetooth, lectura de tarjetas y procesos de pago.",
    icon: "smartphone",
  },
  {
    order: 3,
    title: "Servicepay Pos",
    stack: ["Flutter"],
    description:
      "Aplicación para pagos de servicios. Diseño completo, navegación y validación de formularios.",
    icon: "smartphone",
  },
  {
    order: 4,
    title: "Mercantil Seguros - Portal corporativo",
    stack: ["Angular", "Spring Boot"],
    description:
      "Interfaz para entes jurídicos y clientes corporativos. Consulta de pólizas, siniestros con gráficos y tablas interactivas.",
    icon: "shield",
  },
]

const skillGroups = [
  {
    order: 0,
    title: "Avanzado",
    level: 90,
    accent: "from-primary to-primary/70",
    skills: ["Node.js", "JavaScript"],
  },
  {
    order: 1,
    title: "Intermedio",
    level: 65,
    accent: "from-primary/70 to-primary/40",
    skills: [
      "React",
      "Next.js",
      "Angular",
      "Flutter",
      "Dart",
      "Spring Boot",
      "Quarkus",
      "Docker",
      "SQL (MySQL, SQL Server, PostgreSQL)",
    ],
  },
  {
    order: 2,
    title: "Básico",
    level: 40,
    accent: "from-primary/40 to-primary/20",
    skills: ["React Native", "NoSQL (Redis, MongoDB)"],
  },
]

const education = [
  { order: 0, degree: "Ingeniero Informático", institution: "CULTCA", period: "Actualmente, 2023" },
  { order: 1, degree: "TSU Informática", institution: "CULTCA", period: "2022" },
  { order: 2, degree: "Bachiller en ciencias", institution: "UEP Colegio la Colina", period: "2016" },
]

async function seed() {
  console.log("Iniciando seed de Firestore...")
  
  try {
    // Usar múltiples batches si hay muchos documentos (límite de 500 por batch)
    const allDocs = []
    
    // Documentos en collection "portfolio"
    allDocs.push({ collection: "portfolio", doc: "hero", data: portfolio.hero })
    allDocs.push({ collection: "portfolio", doc: "about", data: portfolio.about })
    allDocs.push({ collection: "portfolio", doc: "contact", data: portfolio.contact })

    // Colecciones - Experiences
    experiences.forEach((exp, i) => {
      allDocs.push({ collection: "experiences", doc: `exp-${i}`, data: exp })
    })
    
    // Colecciones - Projects
    projects.forEach((proj, i) => {
      allDocs.push({ collection: "projects", doc: `proj-${i}`, data: proj })
    })
    
    // Colecciones - Skill Groups
    skillGroups.forEach((sg, i) => {
      allDocs.push({ collection: "skillGroups", doc: `sg-${i}`, data: sg })
    })
    
    // Colecciones - Education
    education.forEach((edu, i) => {
      allDocs.push({ collection: "education", doc: `edu-${i}`, data: edu })
    })

    // Procesar en batches de 500 (límite de Firestore)
    const batchSize = 500
    for (let i = 0; i < allDocs.length; i += batchSize) {
      const batch = db.batch()
      const batchDocs = allDocs.slice(i, i + batchSize)
      
      batchDocs.forEach(({ collection, doc, data }) => {
        const ref = db.collection(collection).doc(doc)
        batch.set(ref, data)
      })
      
      await batch.commit()
      console.log(`✓ Batch ${Math.floor(i / batchSize) + 1} procesado (${batchDocs.length} documentos)`)
    }

    console.log("\n✅ Firestore poblado correctamente!")
    console.log(`   - Portfolio: 3 documentos (hero, about, contact)`)
    console.log(`   - Experiences: ${experiences.length} documentos`)
    console.log(`   - Projects: ${projects.length} documentos`)
    console.log(`   - Skill Groups: ${skillGroups.length} documentos`)
    console.log(`   - Education: ${education.length} documentos`)
    console.log(`   Total: ${allDocs.length} documentos creados`)
  } catch (error) {
    console.error("❌ Error al poblar Firestore:", error)
    throw error
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
