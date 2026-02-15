"use client"

import { BriefcaseIcon, SparklesIcon } from "lucide-react"
import { motion } from "motion/react"
import { SectionHeader } from "@/components/section-header"
import type { ExperienceData } from "@/types/portfolio"

interface ExperienceProps {
  experiences: ExperienceData[]
}

export function Experience({ experiences }: ExperienceProps) {
  return (
    <section
      id="experiencia"
      className="scroll-mt-24 py-24 md:py-32"
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader number="02" title="Experiencia laboral" />
        </motion.div>

        <motion.div
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.06, delayChildren: 0.15 },
            },
          }}
        >
          {experiences.map((exp) => (
            <motion.article
              key={`${exp.company}-${exp.period}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
              className={`group relative overflow-hidden rounded-2xl border transition-all hover:shadow-lg ${
                exp.current
                  ? "border-primary/40 bg-card/80 shadow-md"
                  : "border-border/50 bg-card/50 hover:border-primary/20"
              }`}
            >
              {exp.current && (
                <div className="absolute right-0 top-0 h-20 w-20 translate-x-10 -translate-y-10 rounded-full bg-primary/10" />
              )}
              <div className="relative flex gap-4 p-6 md:gap-6 md:p-6">
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                    exp.current ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  <BriefcaseIcon
                    className={`size-6 ${exp.current ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {exp.current && (
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                      <SparklesIcon className="size-3.5" />
                      Trabajo actualmente en
                    </p>
                  )}
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{exp.title}</h3>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{exp.company}</span>
                    {" · "}
                    {exp.period}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {exp.description}
                  </p>
                </div>
              </div>
              {exp.current && (
                <div className="h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent" />
              )}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
