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
  size: z.number().min(8).max(14).default(11),
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
    size: 11,
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
