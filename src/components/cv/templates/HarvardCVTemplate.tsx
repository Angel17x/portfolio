import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
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

interface HarvardCVTemplateProps {
  portfolioData: PortfolioData
  config: CVConfig
}

// Mapeo de fuentes a las fuentes por defecto de react-pdf
const fontMap: Record<string, string> = {
  "Times New Roman": "Times-Roman",
  "Arial": "Helvetica",
  "Helvetica": "Helvetica",
  "Georgia": "Times-Roman", // Usar Times-Roman como alternativa
  "Calibri": "Helvetica", // Usar Helvetica como alternativa
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingTop: 30, // Margen superior más generoso
    paddingBottom: 30, // Margen inferior más generoso
    fontSize: 11,
    fontFamily: "Times-Roman",
    lineHeight: 1.6,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 25,
    borderBottom: "3px solid #000",
    paddingBottom: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 4,
    color: "#444",
    fontWeight: "normal",
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    fontSize: 10,
    gap: 12,
  },
  contactItem: {
    marginRight: 15,
    marginBottom: 4,
    color: "#555",
  },
  section: {
    marginBottom: 24, // Más espacio entre secciones
    marginTop: 8, // Espacio superior
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
    borderBottom: "2px solid #000",
    paddingBottom: 4,
    letterSpacing: 0.3,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  experienceTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  experienceCompany: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#444",
  },
  experiencePeriod: {
    fontSize: 10,
    color: "#666",
    fontWeight: "normal",
  },
  experienceDescription: {
    fontSize: 10,
    marginTop: 6,
    textAlign: "justify",
    lineHeight: 1.5,
    color: "#333",
  },
  educationItem: {
    marginBottom: 10,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  educationDegree: {
    fontSize: 11,
    fontWeight: "bold",
  },
  educationInstitution: {
    fontSize: 10,
    fontStyle: "italic",
  },
  educationPeriod: {
    fontSize: 10,
    color: "#666",
  },
  projectItem: {
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  projectStack: {
    fontSize: 9,
    color: "#666",
    marginBottom: 4,
    fontStyle: "italic",
  },
  projectDescription: {
    fontSize: 10,
    textAlign: "justify",
    lineHeight: 1.5,
    color: "#333",
  },
  skillGroup: {
    marginBottom: 8,
  },
  skillGroupTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: 10,
  },
  skillItem: {
    marginRight: 8,
    marginBottom: 3,
  },
  aboutText: {
    fontSize: 10,
    textAlign: "justify",
    marginBottom: 5,
  },
  currentBadge: {
    fontSize: 9,
    color: "#0066cc",
    fontWeight: "bold",
    marginLeft: 5,
  },
})

export function HarvardCVTemplate({
  portfolioData,
  config,
}: HarvardCVTemplateProps) {
  const { hero, about, experiences, projects, skillGroups, education, contact } =
    portfolioData

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

  // Mapear fuentes a las fuentes por defecto de react-pdf
  const bodyFont = fontMap[config.fonts.body] || "Times-Roman"
  const headingFont = fontMap[config.fonts.heading] || "Times-Roman"

  // Función helper para convertir color hex a formato compatible con react-pdf
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  const primaryColor = hexToRgb(config.colors.primary)
  const accentColor = hexToRgb(config.colors.accent)
  const secondaryColor = hexToRgb(config.colors.secondary)

  const titleSize = config.fonts.titleSize || 26
  const sectionTitleSize = config.fonts.sectionTitleSize || 15
  const subtitleSize = config.fonts.subtitleSize || 12
  const bodySize = config.fonts.bodySize || 11

  const dynamicStyles = StyleSheet.create({
    page: {
      ...styles.page,
      fontFamily: bodyFont,
      fontSize: bodySize,
    },
    header: {
      ...styles.header,
      borderBottomColor: config.colors.primary,
      marginBottom: 28, // Más espacio después del header
    },
    name: {
      ...styles.name,
      fontSize: titleSize,
      color: config.colors.primary,
      fontFamily: headingFont,
    },
    sectionTitle: {
      ...styles.sectionTitle,
      fontSize: sectionTitleSize,
      color: config.colors.primary,
      borderBottomColor: config.colors.primary,
      fontFamily: headingFont,
      marginBottom: 14, // Más espacio después del título de sección
    },
    experienceTitle: {
      ...styles.experienceTitle,
      fontSize: subtitleSize,
      color: config.colors.primary,
    },
    projectTitle: {
      ...styles.projectTitle,
      fontSize: subtitleSize,
      color: config.colors.primary,
    },
    currentBadge: {
      ...styles.currentBadge,
      color: config.colors.accent,
    },
  })

  return (
    <Document>
      <Page size="A4" style={dynamicStyles.page}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.name}>{hero.name}</Text>
          {hero.subtitle && (
            <Text style={styles.subtitle}>{hero.subtitle}</Text>
          )}
          <View style={styles.contactInfo}>
            {contact.email && (
              <Text style={styles.contactItem}>Email: {contact.email}</Text>
            )}
            {contact.phone && (
              <Text style={styles.contactItem}>Tel: {contact.phone}</Text>
            )}
            {contact.location && (
              <Text style={styles.contactItem}>{contact.location}</Text>
            )}
            {contact.linkedinUrl && (
              <Text style={styles.contactItem}>
                LinkedIn: {contact.linkedinUrl.replace("https://", "")}
              </Text>
            )}
            {contact.githubUrl && (
              <Text style={styles.contactItem}>
                GitHub: {contact.githubUrl.replace("https://", "")}
              </Text>
            )}
          </View>
        </View>

        {/* About Section */}
        {config.sectionVisibility.about && about.paragraphs.length > 0 && (
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>
              {about.title || "Resumen Profesional"}
            </Text>
            {about.paragraphs.map((paragraph, idx) => (
              <Text key={idx} style={styles.aboutText}>
                {cleanMarkdown(paragraph)}
              </Text>
            ))}
          </View>
        )}

        {/* Experience Section */}
        {config.sectionVisibility.experiences &&
          experiences.length > 0 && (
            <View style={styles.section}>
              <Text style={dynamicStyles.sectionTitle}>Experiencia Laboral</Text>
              {experiences.map((exp, idx) => (
                <View key={idx} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <View>
                      <Text style={dynamicStyles.experienceTitle}>{exp.title}</Text>
                      <Text style={styles.experienceCompany}>
                        {exp.company}
                        {exp.current && (
                          <Text style={dynamicStyles.currentBadge}> • Actual</Text>
                        )}
                      </Text>
                    </View>
                    <Text style={styles.experiencePeriod}>{exp.period}</Text>
                  </View>
                  {exp.description && (
                    <Text style={styles.experienceDescription}>
                      {cleanMarkdown(exp.description)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

        {/* Education Section */}
        {config.sectionVisibility.education && education.length > 0 && (
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Educación</Text>
            {education.map((edu, idx) => (
              <View key={idx} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <View>
                    <Text style={styles.educationDegree}>{edu.degree}</Text>
                    <Text style={styles.educationInstitution}>
                      {edu.institution}
                    </Text>
                  </View>
                  <Text style={styles.educationPeriod}>{edu.period}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Projects Section */}
        {config.sectionVisibility.projects && projects.length > 0 && (
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Proyectos</Text>
            {projects.map((project, idx) => (
              <View key={idx} style={styles.projectItem}>
                <Text style={dynamicStyles.projectTitle}>{project.title}</Text>
                {project.stack.length > 0 && (
                  <Text style={styles.projectStack}>
                    {project.stack.join(" • ")}
                  </Text>
                )}
                {project.description && (
                  <Text style={styles.projectDescription}>
                    {cleanMarkdown(project.description)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills Section */}
        {config.sectionVisibility.skills && skillGroups.length > 0 && (
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Habilidades</Text>
            {skillGroups.map((group, idx) => (
              <View key={idx} style={styles.skillGroup}>
                <Text style={styles.skillGroupTitle}>
                  {group.title} ({group.level}%)
                </Text>
                <View style={styles.skillsList}>
                  {group.skills.map((skill, skillIdx) => (
                    <Text key={skillIdx} style={styles.skillItem}>
                      {skill}
                      {skillIdx < group.skills.length - 1 ? " • " : ""}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}
