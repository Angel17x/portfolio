"use client"

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore"
import type {
  AboutData,
  ContactData,
  EducationData,
  ExperienceData,
  HeroData,
  ProjectData,
  SkillGroupData,
} from "@/types/portfolio"
import { getFirebaseDb } from "./firebase"

async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  const db = getFirebaseDb()
  if (!db) return null
  const snapshot = await getDoc(doc(db, collectionName, docId))
  if (!snapshot.exists()) return null
  return snapshot.data() as T
}

async function getCollection<T>(
  collectionName: string,
  orderByField = "order"
): Promise<T[]> {
  const db = getFirebaseDb()
  if (!db) return []
  const ref = collection(db, collectionName)
  const q = query(ref, orderBy(orderByField))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => {
    const { order, ...rest } = d.data()
    return rest as T
  })
}

export async function fetchHero(): Promise<HeroData | null> {
  return getDocument<HeroData>("portfolio", "hero")
}

export async function fetchAbout(): Promise<AboutData | null> {
  return getDocument<AboutData>("portfolio", "about")
}

export async function fetchExperiences(): Promise<ExperienceData[]> {
  return getCollection<ExperienceData>("experiences")
}

export async function fetchProjects(): Promise<ProjectData[]> {
  return getCollection<ProjectData>("projects")
}

export async function fetchSkillGroups(): Promise<SkillGroupData[]> {
  return getCollection<SkillGroupData>("skillGroups")
}

export async function fetchEducation(): Promise<EducationData[]> {
  return getCollection<EducationData>("education")
}

export async function fetchContact(): Promise<ContactData | null> {
  return getDocument<ContactData>("portfolio", "contact")
}
