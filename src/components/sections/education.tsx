"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GraduationCapIcon } from "lucide-react"
import { motion } from "motion/react"
import { SectionHeader } from "@/components/section-header"
import type { EducationData } from "@/types/portfolio"

interface EducationProps {
  education: EducationData[]
}

export function Education({ education }: EducationProps) {
  return (
    <section
      id="formacion"
      className="scroll-mt-24 py-24 md:py-32"
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader number="05" title="Formación académica" />
        </motion.div>
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
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
          {education.map((edu) => (
            <motion.div
              key={`${edu.institution}-${edu.period}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
            >
              <Card className="border-border/50 bg-card/80 transition-all hover:border-primary/30">
                <CardHeader>
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCapIcon className="size-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{edu.degree}</CardTitle>
                      <CardDescription>
                        {edu.institution} · {edu.period}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
