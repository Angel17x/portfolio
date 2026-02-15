"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { motion } from "motion/react"
import { SectionHeader } from "@/components/section-header"
import type { AboutData } from "@/types/portfolio"

interface AboutProps {
  about: AboutData
}

export function About({ about }: AboutProps) {
  return (
    <section
      id="sobre-mi"
      className="scroll-mt-24 py-24 md:py-32"
    >
      <div className="section-container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader number="01" title="Sobre mí" />
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">{about.title}</CardTitle>
              <CardDescription>{about.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-muted-foreground">
              {about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <div className="flex flex-wrap gap-2 pt-4">
                {about.languages.map((lang, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {lang.label} — {lang.level}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
