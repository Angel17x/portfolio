import { z } from "zod"

// Schema para un color en formato oklch
const oklchColorSchema = z.string().regex(
  /^oklch\([\d.]+ [\d.]+ [\d.]+\)$/,
  "Debe ser un color válido en formato oklch, ej: oklch(0.52 0.15 165)"
)

// Schema para los colores del tema light
const lightThemeSchema = z.object({
  background: oklchColorSchema,
  foreground: oklchColorSchema,
  card: oklchColorSchema,
  cardForeground: oklchColorSchema,
  popover: oklchColorSchema,
  popoverForeground: oklchColorSchema,
  primary: oklchColorSchema,
  primaryForeground: oklchColorSchema,
  secondary: oklchColorSchema,
  secondaryForeground: oklchColorSchema,
  muted: oklchColorSchema,
  mutedForeground: oklchColorSchema,
  accent: oklchColorSchema,
  accentForeground: oklchColorSchema,
  destructive: oklchColorSchema,
  border: oklchColorSchema,
  input: oklchColorSchema,
  ring: oklchColorSchema,
  sidebar: oklchColorSchema,
  sidebarForeground: oklchColorSchema,
  sidebarPrimary: oklchColorSchema,
  sidebarPrimaryForeground: oklchColorSchema,
  sidebarAccent: oklchColorSchema,
  sidebarAccentForeground: oklchColorSchema,
  sidebarBorder: oklchColorSchema,
  sidebarRing: oklchColorSchema,
})

// Schema para los colores del tema dark
const darkThemeSchema = lightThemeSchema

// Schema completo del tema
export const ThemeColorsSchema = z.object({
  light: lightThemeSchema,
  dark: darkThemeSchema,
})

export type ThemeColors = z.infer<typeof ThemeColorsSchema>
