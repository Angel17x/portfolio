import { z } from "zod"

export const ProjectIconSchema = z.enum([
  "bot",
  "globe",
  "smartphone",
  "shield",
  "code",
  "database",
  "cloud",
  "server",
  "laptop",
  "monitor",
  "palette",
  "rocket",
  "zap",
  "lock",
  "key",
  "wifi",
  "cpu",
  "box",
  "package",
  "layers",
  "git-branch",
  "settings",
  "wand-2",
  "sparkles",
])

export const HeroSchema = z.object({
  subtitle: z.string().min(1, "El subtítulo es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  tagline: z.string().min(1, "El tagline es requerido"),
  githubUrl: z.string().url("Debe ser una URL válida"),
  linkedinUrl: z.string().url("Debe ser una URL válida"),
})

export const AboutSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  subtitle: z.string().min(1, "El subtítulo es requerido"),
  paragraphs: z.array(z.string().min(1, "El párrafo no puede estar vacío")).min(1, "Debe tener al menos un párrafo"),
  languages: z.array(
    z.object({
      label: z.string().min(1, "La etiqueta del idioma es requerida"),
      level: z.string().min(1, "El nivel es requerido"),
    })
  ),
})

export const ExperienceSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  company: z.string().min(1, "La empresa es requerida"),
  period: z.string().min(1, "El período es requerido"),
  current: z.boolean(),
  description: z.string().min(1, "La descripción es requerida"),
  order: z.number().optional(),
})

export const ProjectSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  stack: z.array(z.string().min(1, "El stack no puede estar vacío")).min(1, "Debe tener al menos un elemento"),
  description: z.string().min(1, "La descripción es requerida"),
  icon: ProjectIconSchema,
  order: z.number().optional(),
})

export const SkillGroupSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  level: z.number().min(0).max(100, "El nivel debe estar entre 0 y 100"),
  accent: z.string().min(1, "El accent es requerido"),
  skills: z.array(z.string().min(1, "La skill no puede estar vacía")).min(1, "Debe tener al menos una skill"),
  order: z.number().optional(),
})

export const EducationSchema = z.object({
  degree: z.string().min(1, "El título es requerido"),
  institution: z.string().min(1, "La institución es requerida"),
  period: z.string().min(1, "El período es requerido"),
  order: z.number().optional(),
})

export const ContactSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  email: z.string().email("Debe ser un email válido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  githubUrl: z.string().url("Debe ser una URL válida"),
  linkedinUrl: z.string().url("Debe ser una URL válida"),
  location: z.string().min(1, "La ubicación es requerida"),
})
