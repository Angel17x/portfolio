import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"
import type {
  HeroData,
  AboutData,
  ExperienceData,
  ProjectData,
  SkillGroupData,
  EducationData,
  ContactData,
} from "@/types/portfolio"
import type { CVConfig } from "@/lib/validations/cv-config-schemas"

interface PortfolioData {
  hero: HeroData
  about: AboutData
  experiences: ExperienceData[]
  projects: ProjectData[]
  skillGroups: SkillGroupData[]
  education: EducationData[]
  contact: ContactData
}

interface ModernCVTemplateProps {
  portfolioData: PortfolioData
  config: CVConfig
}

// Mapeo de fuentes
const fontMap: Record<string, string> = {
  "Times New Roman": "Times-Roman",
  "Arial": "Helvetica",
  "Helvetica": "Helvetica",
  "Georgia": "Times-Roman",
  "Calibri": "Helvetica",
}

// Estilos base (los colores se aplicarán dinámicamente)
const baseStyles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 0,
    margin: 0,
    paddingTop: 20, // Margen superior para todas las páginas
    paddingBottom: 20, // Margen inferior para todas las páginas
  },
  // Columna izquierda (~65% según diseño)
  leftColumn: {
    width: "65%",
    backgroundColor: "#FFFFFF",
    padding: 30,
    paddingTop: 30,
    paddingRight: 25,
  },
  // Columna derecha (~35% según diseño)
  rightColumn: {
    width: "35%",
    padding: 25,
    paddingTop: 30,
    paddingLeft: 20,
  },
  // Header en la columna izquierda
  headerBox: {
    padding: 20,
    marginBottom: 30,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 14,
    fontWeight: "normal",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    lineHeight: 1.3,
  },
  contactInfo: {
    marginTop: 12,
  },
  contactItem: {
    fontSize: 9.5,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    lineHeight: 1.4,
  },
  contactIcon: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 8,
    marginTop: 1,
  },
  // Secciones de la columna izquierda
  leftSection: {
    marginBottom: 28, // Más espacio entre secciones para evitar que se vea pegado
    marginTop: 8, // Espacio superior para separar de la sección anterior
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingBottom: 5,
    lineHeight: 1.3,
  },
  // Experiencia
  experienceItem: {
    marginBottom: 18,
  },
  experienceHeader: {
    marginBottom: 6,
  },
  experienceCompanyRole: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
    lineHeight: 1.4,
  },
  experiencePeriod: {
    fontSize: 9,
    marginBottom: 8,
    lineHeight: 1.3,
    opacity: 0.85,
  },
  experienceBullet: {
    fontSize: 9,
    marginBottom: 4,
    marginLeft: 12,
    paddingLeft: 6,
    lineHeight: 1.5,
  },
  // Links
  linkItem: {
    fontSize: 9,
    marginBottom: 4,
    marginLeft: 12,
    paddingLeft: 6,
    lineHeight: 1.4,
  },
  // Secciones de la columna derecha
  rightSection: {
    marginBottom: 26, // Más espacio entre secciones
    marginTop: 8, // Espacio superior
  },
  rightSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    lineHeight: 1.3,
  },
  rightSectionTitleUnderlined: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingBottom: 5,
    lineHeight: 1.3,
  },
  // Resumen Profesional
  summaryText: {
    fontSize: 9.5,
    lineHeight: 1.6,
    textAlign: "justify",
    marginBottom: 8,
  },
  // Educación
  educationItem: {
    marginBottom: 14,
  },
  educationInstitution: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
    lineHeight: 1.4,
  },
  educationDate: {
    fontSize: 9,
    marginBottom: 3,
    lineHeight: 1.3,
  },
  educationDegree: {
    fontSize: 9,
    fontStyle: "italic",
    lineHeight: 1.4,
  },
  // Habilidades
  skillItem: {
    fontSize: 9,
    marginBottom: 4,
    marginLeft: 12,
    paddingLeft: 6,
    lineHeight: 1.4,
  },
  currentBadge: {
    fontSize: 8,
    fontWeight: "bold",
    marginLeft: 6,
  },
})

export function ModernCVTemplate({
  portfolioData,
  config,
}: ModernCVTemplateProps) {
  const { hero, about, experiences, projects, skillGroups, education, contact } =
    portfolioData

  // Mapear fuentes según la configuración del usuario
  // Usar la fuente de body para todo el texto del cuerpo
  // Usar la fuente de heading para títulos
  const bodyFont = fontMap[config.fonts.body] || "Helvetica"
  const headingFont = fontMap[config.fonts.heading] || "Helvetica"
  
  // Para el CV moderno, usar la misma fuente en ambas columnas para consistencia
  const leftColumnFont = bodyFont // Fuente del cuerpo para columna izquierda
  const rightColumnFont = bodyFont // Misma fuente para columna derecha (consistencia)

  // Función para convertir color hex a RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 44, g: 62, b: 80 }
  }

  const primaryColor = hexToRgb(config.colors.primary)
  const accentColor = hexToRgb(config.colors.accent)
  const secondaryColor = hexToRgb(config.colors.secondary)

  const titleSize = config.fonts.titleSize || 28
  const sectionTitleSize = config.fonts.sectionTitleSize || 12
  const subtitleSize = config.fonts.subtitleSize || 11
  const bodySize = config.fonts.bodySize || 10

  // Crear estilos dinámicos con los colores de la configuración
  const dynamicStyles = StyleSheet.create({
    page: {
      ...baseStyles.page,
    },
    // Columna izquierda con fuente sans-serif
    leftColumn: {
      ...baseStyles.leftColumn,
      fontFamily: leftColumnFont,
      fontSize: bodySize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
    },
    // Columna derecha con la misma fuente que la izquierda
    rightColumn: {
      ...baseStyles.rightColumn,
      backgroundColor: `rgb(${secondaryColor.r}, ${secondaryColor.g}, ${secondaryColor.b})`,
      fontFamily: leftColumnFont, // Misma fuente que la columna izquierda
      fontSize: bodySize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
    },
    headerBox: {
      ...baseStyles.headerBox,
      backgroundColor: `rgb(${secondaryColor.r}, ${secondaryColor.g}, ${secondaryColor.b})`,
      marginBottom: 25, // Más espacio antes de la primera sección
    },
    name: {
      ...baseStyles.name,
      fontSize: titleSize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
      fontWeight: "bold", // Asegurar peso bold explícitamente
    },
    subtitle: {
      ...baseStyles.subtitle,
      fontSize: subtitleSize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
      fontWeight: "normal", // Asegurar peso normal explícitamente
    },
    contactItem: {
      ...baseStyles.contactItem,
      fontSize: bodySize * 0.95,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
      fontWeight: "normal", // Asegurar peso normal explícitamente
    },
    contactIcon: {
      ...baseStyles.contactIcon,
      backgroundColor: `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`,
    },
    sectionTitle: {
      ...baseStyles.sectionTitle,
      fontSize: sectionTitleSize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      borderBottom: `2px solid rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`,
      fontFamily: leftColumnFont,
      fontWeight: "bold", // Asegurar peso bold explícitamente
      marginBottom: 14, // Más espacio después del título de sección
    },
    experienceCompanyRole: {
      ...baseStyles.experienceCompanyRole,
      fontSize: subtitleSize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
      fontWeight: "bold", // Asegurar peso bold explícitamente
    },
    experiencePeriod: {
      ...baseStyles.experiencePeriod,
      fontSize: bodySize * 0.9, // Ligeramente más pequeño que el cuerpo
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
      fontWeight: "normal", // Asegurar peso normal explícitamente
    },
    experienceBullet: {
      ...baseStyles.experienceBullet,
      fontSize: bodySize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
      fontWeight: "normal", // Asegurar peso normal explícitamente
    },
    linkItem: {
      ...baseStyles.linkItem,
      fontSize: bodySize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
      fontWeight: "normal", // Asegurar peso normal explícitamente
    },
    rightSectionTitle: {
      ...baseStyles.rightSectionTitle,
      fontSize: sectionTitleSize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont, // Misma fuente que el resto
      fontWeight: "bold", // Asegurar peso bold explícitamente
      marginBottom: 14,
    },
    rightSectionTitleUnderlined: {
      ...baseStyles.rightSectionTitleUnderlined,
      fontSize: sectionTitleSize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      borderBottom: `2px solid rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`,
      fontFamily: leftColumnFont, // Misma fuente que el resto
      fontWeight: "bold", // Asegurar peso bold explícitamente
      marginBottom: 14,
    },
    summaryText: {
      ...baseStyles.summaryText,
      fontSize: bodySize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont, // Misma fuente que el resto
      fontWeight: "normal", // Asegurar peso normal explícitamente
    },
    educationInstitution: {
      ...baseStyles.educationInstitution,
      fontSize: subtitleSize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont, // Misma fuente que el resto
      fontWeight: "bold", // Asegurar peso bold explícitamente
    },
    educationDate: {
      ...baseStyles.educationDate,
      fontSize: bodySize * 0.9,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont, // Misma fuente que el resto
      fontWeight: "normal", // Asegurar peso normal explícitamente
    },
    educationDegree: {
      ...baseStyles.educationDegree,
      fontSize: bodySize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont, // Misma fuente que el resto
      fontStyle: "italic", // Asegurar estilo italic explícitamente
      fontWeight: "normal", // Asegurar peso normal explícitamente
    },
    skillItem: {
      ...baseStyles.skillItem,
      fontSize: bodySize,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont, // Misma fuente que el resto
      fontWeight: "normal", // Asegurar peso normal explícitamente
    },
    currentBadge: {
      ...baseStyles.currentBadge,
      fontSize: bodySize * 0.9,
      color: `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`,
      fontFamily: leftColumnFont,
    },
  })

  // Función para limpiar markdown del texto (remover **, ##, etc.)
  const cleanMarkdown = (text: string): string => {
    if (!text) return ""
    return text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remover **texto** y dejar solo el texto
      .replace(/\*(?![*\s])(.*?)(?<!\*)\*/g, "$1") // Remover *texto* (pero no **) y dejar solo el texto
      .replace(/##+\s*/g, "") // Remover ##, ###, ####, etc.
      .replace(/`(.*?)`/g, "$1") // Remover `código` y dejar solo el código
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remover [texto](url) y dejar solo el texto
      .replace(/~~(.*?)~~/g, "$1") // Remover ~~texto~~ y dejar solo el texto
      .replace(/^\s*[-•*]\s+/gm, "") // Remover viñetas markdown al inicio de línea
      .replace(/\n{3,}/g, "\n\n") // Limpiar múltiples saltos de línea
      .trim()
  }

  // Combinar todas las habilidades en una sola lista
  const allSkills: string[] = []
  skillGroups.forEach((group) => {
    group.skills.forEach((skill) => {
      if (!allSkills.includes(skill)) {
        allSkills.push(skill)
      }
    })
  })

  // Formatear fecha a MM/YYYY
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return ""
    // Intentar parsear diferentes formatos
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      // Si no se puede parsear, intentar formato manual
      const parts = dateStr.split(/[-/]/)
      if (parts.length >= 2) {
        const month = parts[0].padStart(2, "0")
        const year = parts[parts.length - 1]
        return `${month}/${year}`
      }
      return dateStr
    }
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${month}/${year}`
  }

  // Formatear período de experiencia
  const formatPeriod = (period: string, current?: boolean): string => {
    if (!period) return ""
    const parts = period.split(" - ")
    if (parts.length === 2) {
      const start = formatDate(parts[0])
      const end = current ? "Presente" : formatDate(parts[1])
      return `${start} - ${end}`
    }
    return period
  }

  return (
    <Document>
      <Page size="A4" style={dynamicStyles.page}>
        {/* Columna izquierda (más ancha, sans-serif) */}
        <View style={dynamicStyles.leftColumn}>
          {/* Header con nombre, título y contacto */}
          {config.sectionVisibility.hero && (
            <View style={dynamicStyles.headerBox}>
              <Text style={dynamicStyles.name}>{hero.name.toUpperCase()}</Text>
              {hero.subtitle && (
                <Text style={dynamicStyles.subtitle}>{hero.subtitle.toUpperCase()}</Text>
              )}
              {config.sectionVisibility.contact && (
                <View style={baseStyles.contactInfo}>
                  {contact.email && (
                    <View style={dynamicStyles.contactItem}>
                      <View style={dynamicStyles.contactIcon} />
                      <Text style={{ fontFamily: leftColumnFont, fontSize: bodySize * 0.95 }}>
                        {contact.email}
                      </Text>
                    </View>
                  )}
                  {contact.phone && (
                    <View style={dynamicStyles.contactItem}>
                      <View style={dynamicStyles.contactIcon} />
                      <Text style={{ fontFamily: leftColumnFont, fontSize: bodySize * 0.95 }}>
                        {contact.phone}
                      </Text>
                    </View>
                  )}
                  {contact.location && (
                    <View style={dynamicStyles.contactItem}>
                      <View style={dynamicStyles.contactIcon} />
                      <Text style={{ fontFamily: leftColumnFont, fontSize: bodySize * 0.95 }}>
                        {contact.location}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Experiencia */}
          {config.sectionVisibility.experiences && experiences.length > 0 && (
            <View style={baseStyles.leftSection}>
              <Text style={dynamicStyles.sectionTitle}>Experiencia</Text>
              {experiences.map((exp, idx) => (
                <View key={idx} style={baseStyles.experienceItem}>
                  <View style={baseStyles.experienceHeader}>
                    <Text style={dynamicStyles.experienceCompanyRole}>
                      {exp.company} - {exp.title}
                      {exp.current && (
                        <Text style={dynamicStyles.currentBadge}> • Actual</Text>
                      )}
                    </Text>
                    <Text style={dynamicStyles.experiencePeriod}>
                      {formatPeriod(exp.period, exp.current)}
                    </Text>
                  </View>
                  {exp.description && (
                    <View>
                      {cleanMarkdown(exp.description)
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((line, lineIdx) => (
                          <Text key={lineIdx} style={dynamicStyles.experienceBullet}>
                            • {line.trim()}
                          </Text>
                        ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Proyectos */}
          {config.sectionVisibility.projects && projects.length > 0 && (
            <View style={baseStyles.leftSection}>
              <Text style={dynamicStyles.sectionTitle}>Proyectos</Text>
              {projects.map((proj, idx) => (
                <View key={idx} style={baseStyles.experienceItem}>
                  <View style={baseStyles.experienceHeader}>
                    <Text style={dynamicStyles.experienceCompanyRole}>
                      {proj.title}
                    </Text>
                    {proj.stack && proj.stack.length > 0 && (
                      <Text style={dynamicStyles.experiencePeriod}>
                        {proj.stack.join(", ")}
                      </Text>
                    )}
                  </View>
                  {proj.description && (
                    <View>
                      {cleanMarkdown(proj.description)
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((line, lineIdx) => (
                          <Text key={lineIdx} style={dynamicStyles.experienceBullet}>
                            • {line.trim()}
                          </Text>
                        ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Sitio Web, Portafolio y Perfiles */}
          {config.sectionVisibility.contact && 
           (contact.linkedinUrl || contact.githubUrl || hero.githubUrl || hero.linkedinUrl) && (
            <View style={baseStyles.leftSection}>
              <Text style={dynamicStyles.sectionTitle}>
                Sitio Web, Portafolio y Perfiles
              </Text>
              {contact.linkedinUrl && (
                <Text style={dynamicStyles.linkItem}>
                  • {contact.linkedinUrl.replace("https://", "").replace("www.", "")}
                </Text>
              )}
              {contact.githubUrl && (
                <Text style={dynamicStyles.linkItem}>
                  • {contact.githubUrl.replace("https://", "").replace("www.", "")}
                </Text>
              )}
              {hero.linkedinUrl && !contact.linkedinUrl && (
                <Text style={dynamicStyles.linkItem}>
                  • {hero.linkedinUrl.replace("https://", "").replace("www.", "")}
                </Text>
              )}
              {hero.githubUrl && !contact.githubUrl && (
                <Text style={dynamicStyles.linkItem}>
                  • {hero.githubUrl.replace("https://", "").replace("www.", "")}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Columna derecha (más estrecha) */}
        <View style={dynamicStyles.rightColumn}>
          {/* Resumen Profesional */}
          {config.sectionVisibility.about && about.paragraphs.length > 0 && (
            <View style={baseStyles.rightSection}>
              <Text style={dynamicStyles.rightSectionTitle}>Resumen Profesional</Text>
              {about.paragraphs.map((paragraph, idx) => (
                <Text key={idx} style={dynamicStyles.summaryText}>
                  {cleanMarkdown(paragraph)}
                </Text>
              ))}
            </View>
          )}

          {/* Educación */}
          {config.sectionVisibility.education && education.length > 0 && (
            <View style={baseStyles.rightSection}>
              <Text style={dynamicStyles.rightSectionTitleUnderlined}>Educación</Text>
              {education.map((edu, idx) => (
                <View key={idx} style={baseStyles.educationItem}>
                  <Text style={dynamicStyles.educationInstitution}>
                    {edu.institution}
                  </Text>
                  <Text style={dynamicStyles.educationDate}>
                    {formatDate(edu.period)}
                  </Text>
                  <Text style={dynamicStyles.educationDegree}>
                    {edu.degree}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Habilidades */}
          {config.sectionVisibility.skills && allSkills.length > 0 && (
            <View style={baseStyles.rightSection}>
              <Text style={dynamicStyles.rightSectionTitleUnderlined}>Habilidades</Text>
              {allSkills.map((skill, idx) => (
                <Text key={idx} style={dynamicStyles.skillItem}>
                  • {skill}
                </Text>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}
