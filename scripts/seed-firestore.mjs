/**
 * Script para poblar Firestore con los datos del portafolio.
 * Ejecutar con: node scripts/seed-firestore.mjs
 *
 * Requiere: Firebase Admin SDK y las credenciales en FIREBASE_SERVICE_ACCOUNT
 * o GOOGLE_APPLICATION_CREDENTIALS apuntando al JSON de la cuenta de servicio.
 */
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

const firebaseConfig = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined

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
  const batch = db.batch()

  // Documentos en collection "portfolio"
  batch.set(db.collection("portfolio").doc("hero"), portfolio.hero)
  batch.set(db.collection("portfolio").doc("about"), portfolio.about)
  batch.set(db.collection("portfolio").doc("contact"), portfolio.contact)

  // Colecciones
  experiences.forEach((exp, i) => {
    const ref = db.collection("experiences").doc(`exp-${i}`)
    batch.set(ref, exp)
  })
  projects.forEach((proj, i) => {
    const ref = db.collection("projects").doc(`proj-${i}`)
    batch.set(ref, proj)
  })
  skillGroups.forEach((sg, i) => {
    const ref = db.collection("skillGroups").doc(`sg-${i}`)
    batch.set(ref, sg)
  })
  education.forEach((edu, i) => {
    const ref = db.collection("education").doc(`edu-${i}`)
    batch.set(ref, edu)
  })

  await batch.commit()
  console.log("✓ Firestore poblado correctamente")
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
