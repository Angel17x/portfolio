"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GithubIcon, LinkedinIcon, MailIcon, PhoneIcon, FileDownIcon } from "lucide-react"
import { motion } from "motion/react"
import { SectionHeader } from "@/components/section-header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { ContactData } from "@/types/portfolio"

interface ContactProps {
  contact: ContactData
}

export function Contact({ contact }: ContactProps) {
  return (
    <section
      id="contacto"
      className="scroll-mt-24 py-24 md:py-32"
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader number="06" title="Contacto" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mx-auto max-w-2xl border-border/50 bg-card/80 shadow-lg">
            <CardHeader>
              <CardTitle>{contact.title}</CardTitle>
              <CardDescription>{contact.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`mailto:${contact.email}`}>
                    <MailIcon className="size-5" />
                    {contact.email}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`tel:${contact.phone.replace(/\s/g, "")}`}>
                    <PhoneIcon className="size-5" />
                    {contact.phone}
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="default" size="lg">
                  <Link
                    href={contact.cvUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileDownIcon className="size-5" />
                    Descargar CV
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link
                    href={contact.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GithubIcon className="size-5" />
                    GitHub
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkedinIcon className="size-5" />
                    LinkedIn
                  </Link>
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Ubicación: {contact.location}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
