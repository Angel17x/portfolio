import { getPortfolioData } from "@/lib/portfolio-server"
import type { HeroData, AboutData, ExperienceData, ProjectData, EducationData } from "@/types/portfolio"

export async function StructuredData() {
  const data = await getPortfolioData()

  // Person Schema (JSON-LD)
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.hero.name,
    jobTitle: data.hero.subtitle,
    description: data.about.paragraphs?.[0] || "",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://tudominio.com",
    sameAs: [
      data.hero.githubUrl,
      data.hero.linkedinUrl,
    ].filter(Boolean),
    email: data.contact.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: data.contact.location || "VE",
    },
  }

  // Professional Service Schema
  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${data.hero.name} - ${data.hero.subtitle}`,
    description: data.about.paragraphs?.join(" ") || "",
    provider: {
      "@type": "Person",
      name: data.hero.name,
    },
    areaServed: "Worldwide",
    serviceType: "Software Development",
  }

  // Work Experience Schema
  const workExperienceSchema = data.experiences.map((exp: ExperienceData) => ({
    "@context": "https://schema.org",
    "@type": "OrganizationRole",
    roleName: exp.title,
    startDate: exp.period.split(" - ")[0],
    endDate: exp.current ? undefined : exp.period.split(" - ")[1],
    worksFor: {
      "@type": "Organization",
      name: exp.company,
    },
    description: exp.description,
  }))

  // Education Schema
  const educationSchema = data.education.map((edu: EducationData) => ({
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "degree",
    educationalLevel: edu.degree,
    recognizedBy: {
      "@type": "Organization",
      name: edu.institution,
    },
    dateCreated: edu.period,
  }))

  // Project Schema
  const projectSchema = data.projects.map((project: ProjectData) => ({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    keywords: project.stack.join(", "),
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
      />
      {workExperienceSchema.map((schema, index) => (
        <script
          key={`work-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {educationSchema.map((schema, index) => (
        <script
          key={`edu-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {projectSchema.map((schema, index) => (
        <script
          key={`project-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
