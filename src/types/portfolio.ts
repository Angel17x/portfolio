export type ProjectIcon = "bot" | "globe" | "smartphone" | "shield"

export interface HeroData {
  subtitle: string
  name: string
  tagline: string
  cvUrl: string
  githubUrl: string
  linkedinUrl: string
}

export interface AboutData {
  title: string
  subtitle: string
  paragraphs: string[]
  languages: { label: string; level: string }[]
}

export interface ExperienceData {
  title: string
  company: string
  period: string
  current: boolean
  description: string
}

export interface ProjectData {
  title: string
  stack: string[]
  description: string
  icon: ProjectIcon
}

export interface SkillGroupData {
  title: string
  level: number
  accent: string
  skills: string[]
}

export interface EducationData {
  degree: string
  institution: string
  period: string
}

export interface ContactData {
  title: string
  description: string
  email: string
  phone: string
  cvUrl: string
  githubUrl: string
  linkedinUrl: string
  location: string
}
