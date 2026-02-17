import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/sections/hero"
import { About } from "@/components/sections/about"
import { Experience } from "@/components/sections/experience"
import { Projects } from "@/components/sections/projects"
import { Skills } from "@/components/sections/skills"
import { Education } from "@/components/sections/education"
import { Contact } from "@/components/sections/contact"
import { StructuredData } from "@/components/StructuredData"
import { getPortfolioData } from "@/lib/portfolio-server"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tudominio.com"

  return {
    title: `${data.hero.name} | ${data.hero.subtitle}`,
    description: data.about.paragraphs?.[0] || data.hero.tagline,
    openGraph: {
      title: `${data.hero.name} | ${data.hero.subtitle}`,
      description: data.about.paragraphs?.[0] || data.hero.tagline,
      url: baseUrl,
      siteName: `${data.hero.name} - Portfolio`,
      images: [
        {
          url: `${baseUrl}/og-image.jpg`, // Crear esta imagen después
          width: 1200,
          height: 630,
          alt: `${data.hero.name} - ${data.hero.subtitle}`,
        },
      ],
      locale: "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.hero.name} | ${data.hero.subtitle}`,
      description: data.about.paragraphs?.[0] || data.hero.tagline,
    },
  }
}

export default async function Home() {
  const data = await getPortfolioData()

  return (
    <>
      <StructuredData />
      <div className="relative min-h-screen bg-grid-pattern">
        <Header heroName={data.hero.name} />
        <main className="pt-20">
          <Hero hero={data.hero} />
          <About about={data.about} />
          <Experience experiences={data.experiences} />
          <Projects projects={data.projects} />
          <Skills skillGroups={data.skillGroups} />
          <Education education={data.education} />
          <Contact contact={data.contact} />
        </main>
        <Footer />
      </div>
    </>
  )
}
