"use server"

import { verifyIdToken } from "@/lib/auth-server"
import { getPortfolioData } from "@/lib/portfolio-server"
import type {
  HeroData,
  AboutData,
  ContactData,
  ExperienceData,
  ProjectData,
  SkillGroupData,
  EducationData,
} from "@/types/portfolio"

/** Verifica que el token sea válido. Usar desde el cliente pasando el token. */
export async function verifyAdminSession(idToken: string | null): Promise<{ ok: boolean }> {
  if (!idToken || idToken.length < 20) {
    return { ok: false }
  }
  try {
    await verifyIdToken(idToken)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

/** Devuelve todos los datos del portafolio. Requiere token válido. */
export async function getAdminPortfolioData(idToken: string | null) {
  if (!idToken || idToken.length < 20) {
    throw new Error("No autenticado")
  }
  await verifyIdToken(idToken)
  return getPortfolioData()
}

/** Datos solo para el editor de Portfolio (hero, about, contact). */
export async function getAdminPortfolioEditorData(idToken: string | null): Promise<{
  hero: HeroData
  about: AboutData
  contact: ContactData
}> {
  const data = await getAdminPortfolioData(idToken)
  return {
    hero: data.hero,
    about: data.about,
    contact: data.contact,
  }
}

/** Experiencias para el editor. */
export async function getAdminExperiences(idToken: string | null): Promise<ExperienceData[]> {
  const data = await getAdminPortfolioData(idToken)
  return data.experiences
}

/** Proyectos para el editor. */
export async function getAdminProjects(idToken: string | null): Promise<ProjectData[]> {
  const data = await getAdminPortfolioData(idToken)
  return data.projects
}

/** Grupos de habilidades para el editor. */
export async function getAdminSkillGroups(idToken: string | null): Promise<SkillGroupData[]> {
  const data = await getAdminPortfolioData(idToken)
  return data.skillGroups
}

/** Educación para el editor. */
export async function getAdminEducation(idToken: string | null): Promise<EducationData[]> {
  const data = await getAdminPortfolioData(idToken)
  return data.education
}
