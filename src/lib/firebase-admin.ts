import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

let app: App | null = null

function getServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT
  if (json) {
    try {
      return JSON.parse(json) as Record<string, string>
    } catch {
      return null
    }
  }
  return null
}

export function getFirebaseAdmin() {
  if (app) return app
  const serviceAccount = getServiceAccount()
  if (!serviceAccount?.project_id) return null
  if (getApps().length > 0) {
    app = getApps()[0] as App
    return app
  }
  app = initializeApp({ credential: cert(serviceAccount) })
  return app
}

export function getAdminDb() {
  const adminApp = getFirebaseAdmin()
  if (!adminApp) return null
  return getFirestore(adminApp)
}

export function getAdminStorage() {
  const adminApp = getFirebaseAdmin()
  if (!adminApp) return null
  return getStorage(adminApp)
}
