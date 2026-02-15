"use client"

import { motion } from "motion/react"
import { SectionHeader } from "@/components/section-header"
import type { SkillGroupData } from "@/types/portfolio"

interface SkillsProps {
  skillGroups: SkillGroupData[]
}

export function Skills({ skillGroups }: SkillsProps) {
  return (
    <section
      id="habilidades"
      className="scroll-mt-24 py-24 md:py-32"
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader number="04" title="Habilidades" />
        </motion.div>
        <motion.div
          className="grid gap-8 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.12, delayChildren: 0.1 },
            },
          }}
        >
          {skillGroups.map((group) => (
            <motion.div
              key={group.title}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 transition-all hover:border-primary/30 hover:shadow-xl"
            >
              <div className="absolute inset-x-0 top-0 h-1">
                <div
                  className={`h-full bg-gradient-to-r ${group.accent} transition-all group-hover:opacity-100`}
                  style={{ width: `${group.level}%` }}
                />
              </div>

              <div className="pt-2">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-base font-semibold">{group.title}</h3>
                  <span className="text-xs font-medium text-muted-foreground">
                    {group.level}%
                  </span>
                </div>
                <p className="mb-5 text-xs text-muted-foreground">
                  Nivel de dominio
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill, i) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10"
                    >
                      <span
                        className={`size-1.5 shrink-0 rounded-full bg-gradient-to-r ${group.accent}`}
                      />
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
