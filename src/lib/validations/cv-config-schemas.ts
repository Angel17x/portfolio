import { z } from "zod"

export const CVTemplateSchema = z.enum(["harvard", "modern", "classic"])

export const CVSectionVisibilitySchema = z.object({
  hero: z.boolean().default(true),
  about: z.boolean().default(true),
  experiences: z.boolean().default(true),
  projects: z.boolean().default(true),
  skills: z.boolean().default(true),
  education: z.boolean().default(true),
  contact: z.boolean().default(true),
})

export const CVColorSchema = z.object({
  primary: z.string().default("#000000"),
  secondary: z.string().default("#666666"),
  accent: z.string().default("#0066cc"),
})

export const CVFontSchema = z.object({
  heading: z.string().default("Times New Roman"),
  body: z.string().default("Times New Roman"),
  titleSize: z.number().min(8).max(72).default(28), // Título principal (nombre)
  sectionTitleSize: z.number().min(8).max(72).default(12), // Títulos de sección
  subtitleSize: z.number().min(8).max(72).default(11), // Subtítulos (empresas, instituciones)
  bodySize: z.number().min(8).max(72).default(10), // Texto del cuerpo
})

export const CVConfigSchema = z.object({
  template: CVTemplateSchema.default("harvard"),
  colors: CVColorSchema.default({
    primary: "#000000",
    secondary: "#666666",
    accent: "#0066cc",
  }),
  fonts: CVFontSchema.default({
    heading: "Times New Roman",
    body: "Times New Roman",
    titleSize: 28,
    sectionTitleSize: 12,
    subtitleSize: 11,
    bodySize: 10,
  }),
  sectionVisibility: CVSectionVisibilitySchema.default({
    hero: true,
    about: true,
    experiences: true,
    projects: true,
    skills: true,
    education: true,
    contact: true,
  }),
  sectionOrder: z.array(z.string()).default([
    "hero",
    "about",
    "experiences",
    "projects",
    "skills",
    "education",
    "contact",
  ]),
})

export type CVTemplate = z.infer<typeof CVTemplateSchema>
export type CVSectionVisibility = z.infer<typeof CVSectionVisibilitySchema>
export type CVColor = z.infer<typeof CVColorSchema>
export type CVFont = z.infer<typeof CVFontSchema>
export type CVConfig = z.infer<typeof CVConfigSchema>
