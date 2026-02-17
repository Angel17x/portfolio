import type {
  AboutData,
  ContactData,
  EducationData,
  ExperienceData,
  HeroData,
  ProjectData,
  SkillGroupData,
} from "@/types/portfolio"

export const defaultHero: HeroData = {
  subtitle: "Desarrollador Full Stack",
  name: "Angel Lugo",
  tagline:
    "Creo soluciones web y móviles con JavaScript, React, Node.js y más. Interfaces intuitivas y arquitecturas escalables.",
  githubUrl: "https://github.com/Angel17x",
  linkedinUrl: "https://www.linkedin.com/in/angel-lugo-fullstack-developer",
}

export const defaultAbout: AboutData = {
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
}

export const defaultExperiences: ExperienceData[] = [
  {
    title: "Desarrollador Backend",
    company: "Global Resource",
    period: "Abril 2025 - Actualidad",
    current: true,
    description:
      "Diseño de soluciones empresariales robustas con microservicios en Quarkus, Oracle y PostgreSQL. Implementación de arquitecturas en capas para escalabilidad óptima. Proyectos destacados para clientes como Telefónica.",
  },
  {
    title: "Desarrollador Fullstack",
    company: "Inteligencia Artificial",
    period: "Oct 2025 - Actualidad",
    current: true,
    description:
      "Aplicación web y móvil con IA: chatbot conversacional y prompts dinámicos. Backend con Node.js y Drizzle, frontend con Next.js para una experiencia fluida.",
  },
  {
    title: "Desarrollador Fullstack",
    company: "Atenea Mercantil",
    period: "Agosto 2023 - Actualidad",
    current: false,
    description:
      "Angular, React, Next.js, Spring Boot y SQL Server en Azure. Intranet con SharePoint y SPFX. Backend del sitio web del Banco Mercantil con microservicios Spring Boot e integración WordPress + Next.js.",
  },
  {
    title: "Desarrollador Fullstack",
    company: "Paguetodo",
    period: "Octubre 2021 - Mayo 2023",
    current: false,
    description:
      "Proyectos en Angular y Flutter. Pinpagos: app de pagos con Bluetooth, lectura de tarjetas. Servicepay Pos: pagos de servicios. Proyecto Mercantil Seguros con Angular y Spring Boot para gestión de pólizas.",
  },
  {
    title: "Técnico en computación y redes",
    company: "Laser Print Soluciones",
    period: "Enero 2020 - Mayo 2020",
    current: false,
    description:
      "Instalación y configuración de redes, cableado estructurado, equipos fiscales y de redes.",
  },
  {
    title: "Consultor y técnico en redes",
    company: "Sistemas y Tecnologías DMX",
    period: "Julio 2019 - Enero 2020",
    current: false,
    description:
      "Consultor en sistema Saint: instalación, configuración, resolución de fallas en bases de datos y eliminación de software malicioso.",
  },
]

export const defaultProjects: ProjectData[] = [
  {
    title: "App con IA - Chatbot Salomón",
    stack: ["Next.js", "Node.js", "Flutter", "Drizzle", "IA"],
    description:
      "Aplicación web y móvil centrada en IA con chatbot conversacional y sistema de prompts dinámicos para respuestas precisas y personalizadas.",
    icon: "bot",
  },
  {
    title: "Sitio web Banco Mercantil",
    stack: ["Next.js", "Spring Boot", "WordPress"],
    description:
      "Desarrollo backend con microservicios en Java Spring Boot e integración con WordPress. Frontend con Next.js para el sitio público del banco.",
    icon: "globe",
  },
  {
    title: "Pinpagos - App de pagos",
    stack: ["Flutter", "Bluetooth"],
    description:
      "App móvil para realizar pagos. Diseño completo, navegación, conexión Bluetooth, lectura de tarjetas y procesos de pago.",
    icon: "smartphone",
  },
  {
    title: "Servicepay Pos",
    stack: ["Flutter"],
    description:
      "Aplicación para pagos de servicios. Diseño completo, navegación y validación de formularios.",
    icon: "smartphone",
  },
  {
    title: "Mercantil Seguros - Portal corporativo",
    stack: ["Angular", "Spring Boot"],
    description:
      "Interfaz para entes jurídicos y clientes corporativos. Consulta de pólizas, siniestros con gráficos y tablas interactivas.",
    icon: "shield",
  },
]

export const defaultSkillGroups: SkillGroupData[] = [
  {
    title: "Avanzado",
    level: 90,
    accent: "from-primary to-primary/70",
    skills: ["Node.js", "JavaScript"],
  },
  {
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
    title: "Básico",
    level: 40,
    accent: "from-primary/40 to-primary/20",
    skills: ["React Native", "NoSQL (Redis, MongoDB)"],
  },
]

export const defaultEducation: EducationData[] = [
  { degree: "Ingeniero Informático", institution: "CULTCA", period: "Actualmente, 2023" },
  { degree: "TSU Informática", institution: "CULTCA", period: "2022" },
  { degree: "Bachiller en ciencias", institution: "UEP Colegio la Colina", period: "2016" },
]

export const defaultContact: ContactData = {
  title: "¿Tienes un proyecto en mente?",
  description:
    "Estoy disponible para nuevas oportunidades. No dudes en contactarme.",
  email: "angel26078613@gmail.com",
  phone: "+58 414 237 4668",
  githubUrl: "https://github.com/Angel17x",
  linkedinUrl: "https://www.linkedin.com/in/angel-lugo-fullstack-developer",
  location: "Venezuela",
}
