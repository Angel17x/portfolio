import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.projectId) return null
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0] as FirebaseApp
  }
  return app
}

export function getFirebaseDb() {
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) return null
  return getFirestore(firebaseApp)
}

export function getFirebaseAuth() {
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) return null
  return getAuth(firebaseApp)
}

export function getFirebaseStorage() {
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) return null
  return getStorage(firebaseApp)
}
