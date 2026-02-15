"use client"

import { GithubIcon, LinkedinIcon, ArrowDownIcon, FileDownIcon } from "lucide-react"
import Link from "next/link"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import type { HeroData } from "@/types/portfolio"

interface HeroProps {
  hero: HeroData
}

export function Hero({ hero }: HeroProps) {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center overflow-hidden px-4 py-24"
    >
      {/* Gradiente decorativo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10" />
      <div className="pointer-events-none absolute -top-1/2 right-1/4 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />

      <div className="section-container relative z-10 flex w-full max-w-[1200px] flex-col items-center gap-16 pt-12 md:pt-0">
        <motion.div
          className="flex flex-col items-center gap-8 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.p
            className="text-sm font-medium uppercase tracking-[0.2em] text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {hero.subtitle}
          </motion.p>
          <h1 className="max-w-4xl text-5xl font-bold leading-[1.1] sm:text-6xl md:text-7xl lg:text-8xl">
            Hola, soy{" "}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {hero.name}
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {hero.tagline}
          </p>
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="#contacto">Contactar</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
              <Link href={hero.cvUrl} download target="_blank" rel="noopener noreferrer">
                <FileDownIcon className="size-5" />
                Descargar CV
              </Link>
            </Button>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="icon" className="h-12 w-12">
                <Link
                  href={hero.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <GithubIcon className="size-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="icon" className="h-12 w-12">
                <Link
                  href={hero.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="size-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>

        <motion.a
          href="#sobre-mi"
          className="flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-xs font-medium uppercase tracking-widest">
            Descubre más
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDownIcon className="size-5" />
          </motion.div>
        </motion.a>
      </div>
    </section>
  )
}
