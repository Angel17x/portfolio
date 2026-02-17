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
    marginBottom: 24,
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
    marginBottom: 22,
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

  // Mapear fuentes
  // Columna izquierda: Sans-serif (Helvetica)
  // Columna derecha: Serif (Times-Roman)
  const leftColumnFont = "Helvetica" // Sans-serif para izquierda
  const rightColumnFont = "Times-Roman" // Serif para derecha
  const headingFont = fontMap[config.fonts.heading] || "Helvetica"

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

  // Crear estilos dinámicos con los colores de la configuración
  const dynamicStyles = StyleSheet.create({
    page: {
      ...baseStyles.page,
    },
    // Columna izquierda con fuente sans-serif
    leftColumn: {
      ...baseStyles.leftColumn,
      fontFamily: leftColumnFont,
      fontSize: 10,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
    },
    // Columna derecha con fuente serif
    rightColumn: {
      ...baseStyles.rightColumn,
      backgroundColor: `rgb(${secondaryColor.r}, ${secondaryColor.g}, ${secondaryColor.b})`,
      fontFamily: rightColumnFont,
      fontSize: 10,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
    },
    headerBox: {
      ...baseStyles.headerBox,
      backgroundColor: `rgb(${secondaryColor.r}, ${secondaryColor.g}, ${secondaryColor.b})`,
    },
    name: {
      ...baseStyles.name,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
    },
    subtitle: {
      ...baseStyles.subtitle,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
    },
    contactItem: {
      ...baseStyles.contactItem,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
    },
    contactIcon: {
      ...baseStyles.contactIcon,
      backgroundColor: `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`,
    },
    sectionTitle: {
      ...baseStyles.sectionTitle,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      borderBottom: `2px solid rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`,
      fontFamily: leftColumnFont,
    },
    experienceCompanyRole: {
      ...baseStyles.experienceCompanyRole,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
    },
    experiencePeriod: {
      ...baseStyles.experiencePeriod,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
    },
    experienceBullet: {
      ...baseStyles.experienceBullet,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
    },
    linkItem: {
      ...baseStyles.linkItem,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: leftColumnFont,
    },
    rightSectionTitle: {
      ...baseStyles.rightSectionTitle,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: rightColumnFont,
    },
    rightSectionTitleUnderlined: {
      ...baseStyles.rightSectionTitleUnderlined,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      borderBottom: `2px solid rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`,
      fontFamily: rightColumnFont,
    },
    summaryText: {
      ...baseStyles.summaryText,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: rightColumnFont,
    },
    educationInstitution: {
      ...baseStyles.educationInstitution,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: rightColumnFont,
    },
    educationDate: {
      ...baseStyles.educationDate,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: rightColumnFont,
    },
    educationDegree: {
      ...baseStyles.educationDegree,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: rightColumnFont,
    },
    skillItem: {
      ...baseStyles.skillItem,
      color: `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`,
      fontFamily: rightColumnFont,
    },
    currentBadge: {
      ...baseStyles.currentBadge,
      color: `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`,
      fontFamily: leftColumnFont,
    },
  })

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
          <View style={dynamicStyles.headerBox}>
            <Text style={dynamicStyles.name}>{hero.name.toUpperCase()}</Text>
            {hero.subtitle && (
              <Text style={dynamicStyles.subtitle}>{hero.subtitle.toUpperCase()}</Text>
            )}
            <View style={baseStyles.contactInfo}>
              {contact.email && (
                <View style={dynamicStyles.contactItem}>
                  <View style={dynamicStyles.contactIcon} />
                  <Text>{contact.email}</Text>
                </View>
              )}
              {contact.phone && (
                <View style={dynamicStyles.contactItem}>
                  <View style={dynamicStyles.contactIcon} />
                  <Text>{contact.phone}</Text>
                </View>
              )}
              {contact.location && (
                <View style={dynamicStyles.contactItem}>
                  <View style={dynamicStyles.contactIcon} />
                  <Text>{contact.location}</Text>
                </View>
              )}
            </View>
          </View>

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
                      {exp.description
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
          {(contact.linkedinUrl || contact.githubUrl || hero.githubUrl || hero.linkedinUrl) && (
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
                  {paragraph}
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
