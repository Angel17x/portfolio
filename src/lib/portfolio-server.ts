import type { Firestore } from "firebase-admin/firestore"
import type {
  AboutData,
  ContactData,
  EducationData,
  ExperienceData,
  HeroData,
  ProjectData,
  SkillGroupData,
} from "@/types/portfolio"
import {
  defaultAbout,
  defaultContact,
  defaultEducation,
  defaultExperiences,
  defaultHero,
  defaultProjects,
  defaultSkillGroups,
} from "./portfolio-defaults"
import { getAdminDb } from "./firebase-admin"

function or<T>(from: T | null, fallback: T): T {
  if (from === null || (Array.isArray(from) && from.length === 0)) return fallback
  return from
}

async function getDocument<T>(db: Firestore, collectionName: string, docId: string): Promise<T | null> {
  const snap = await db.collection(collectionName).doc(docId).get()
  if (!snap.exists) return null
  return snap.data() as T
}

async function getCollection<T>(db: Firestore, collectionName: string): Promise<T[]> {
  const snap = await db.collection(collectionName).orderBy("order").get()
  return snap.docs.map((d) => {
    const { order: _, ...rest } = d.data()
    return rest as T
  })
}

export async function getPortfolioData() {
  const db = getAdminDb()
  if (!db) {
    return {
      hero: defaultHero,
      about: defaultAbout,
      experiences: defaultExperiences,
      projects: defaultProjects,
      skillGroups: defaultSkillGroups,
      education: defaultEducation,
      contact: defaultContact,
    }
  }
  const [hero, about, experiences, projects, skillGroups, education, contact] =
    await Promise.all([
      getDocument<HeroData>(db, "portfolio", "hero"),
      getDocument<AboutData>(db, "portfolio", "about"),
      getCollection<ExperienceData>(db, "experiences"),
      getCollection<ProjectData>(db, "projects"),
      getCollection<SkillGroupData>(db, "skillGroups"),
      getCollection<EducationData>(db, "education"),
      getDocument<ContactData>(db, "portfolio", "contact"),
    ])

  return {
    hero: or(hero, defaultHero),
    about: or(about, defaultAbout),
    experiences: experiences.length > 0 ? experiences : defaultExperiences,
    projects: projects.length > 0 ? projects : defaultProjects,
    skillGroups: skillGroups.length > 0 ? skillGroups : defaultSkillGroups,
    education: education.length > 0 ? education : defaultEducation,
    contact: or(contact, defaultContact),
  }
}
