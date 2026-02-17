"use client"

import { signInWithEmailAndPassword, signOut, type User } from "firebase/auth"
import { getFirebaseAuth } from "./firebase"

export async function login(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error("Firebase Auth no está configurado")
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

export async function logout(): Promise<void> {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error("Firebase Auth no está configurado")
  
  await signOut(auth)
}

export async function getCurrentUser(): Promise<User | null> {
  const auth = getFirebaseAuth()
  if (!auth) return null
  
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const auth = getFirebaseAuth()
  if (!auth) return null
  
  // Esperar a que el usuario esté disponible
  const user = await new Promise<User | null>((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser)
    } else {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe()
        resolve(user)
      })
    }
  })
  
  if (!user) return null
  
  return user.getIdToken(forceRefresh)
}
