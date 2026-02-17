import { z } from "zod"

export const SiteConfigSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  faviconUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  cvUrl: z.string().url("Debe ser una URL válida").or(z.string().startsWith("/")).optional().or(z.literal("")),
})

export type SiteConfig = z.infer<typeof SiteConfigSchema>
