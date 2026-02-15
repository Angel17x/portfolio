import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/sections/hero"
import { About } from "@/components/sections/about"
import { Experience } from "@/components/sections/experience"
import { Projects } from "@/components/sections/projects"
import { Skills } from "@/components/sections/skills"
import { Education } from "@/components/sections/education"
import { Contact } from "@/components/sections/contact"
import { getPortfolioData } from "@/lib/portfolio-server"

export default async function Home() {
  const data = await getPortfolioData()

  return (
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
  )
}
