"use client"

import { BotIcon, GlobeIcon, SmartphoneIcon, ShieldIcon, type LucideIcon } from "lucide-react"
import { motion } from "motion/react"
import { SectionHeader } from "@/components/section-header"
import type { ProjectData, ProjectIcon } from "@/types/portfolio"

const iconMap: Record<ProjectIcon, LucideIcon> = {
  bot: BotIcon,
  globe: GlobeIcon,
  smartphone: SmartphoneIcon,
  shield: ShieldIcon,
}

interface ProjectsProps {
  projects: ProjectData[]
}

export function Projects({ projects }: ProjectsProps) {
  return (
    <section
      id="proyectos"
      className="scroll-mt-24 py-24 md:py-32"
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader number="03" title="Proyectos destacados" />
        </motion.div>
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.08, delayChildren: 0.1 },
            },
          }}
        >
          {projects.map((project) => {
            const iconKey = ["bot", "globe", "smartphone", "shield"].includes(project.icon)
              ? project.icon
              : "globe"
            const Icon = iconMap[iconKey as ProjectIcon] ?? GlobeIcon
            return (
              <motion.article
                key={project.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-lg"
              >
                <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10 transition-transform group-hover:scale-150" />
                <div className="relative">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold leading-tight">
                    {project.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
