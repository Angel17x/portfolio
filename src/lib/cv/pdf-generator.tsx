import React from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { HarvardCVTemplate } from "@/components/cv/templates/HarvardCVTemplate"
import { ModernCVTemplate } from "@/components/cv/templates/ModernCVTemplate"
import type { CVConfig } from "@/lib/validations/cv-config-schemas"
import type {
  HeroData,
  AboutData,
  ExperienceData,
  ProjectData,
  SkillGroupData,
  EducationData,
  ContactData,
} from "@/types/portfolio"

interface PortfolioData {
  hero: HeroData
  about: AboutData
  experiences: ExperienceData[]
  projects: ProjectData[]
  skillGroups: SkillGroupData[]
  education: EducationData[]
  contact: ContactData
}

export async function generateCVPDF(
  portfolioData: PortfolioData,
  config: CVConfig
): Promise<Buffer> {
  let pdfDoc: React.ReactElement

  switch (config.template) {
    case "harvard":
      pdfDoc = React.createElement(HarvardCVTemplate, {
        portfolioData,
        config,
      })
      break
    case "modern":
      pdfDoc = React.createElement(ModernCVTemplate, {
        portfolioData,
        config,
      })
      break
    case "classic":
      // TODO: Implementar plantilla clásica
      pdfDoc = React.createElement(HarvardCVTemplate, {
        portfolioData,
        config,
      })
      break
    default:
      pdfDoc = React.createElement(HarvardCVTemplate, {
        portfolioData,
        config,
      })
  }

  return await renderToBuffer(pdfDoc)
}
