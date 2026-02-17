import { getAdminDb } from "./firebase-admin"

export interface ActivityLog {
  id?: string
  userId: string
  userEmail: string
  action: "login" | "logout" | "create" | "update" | "delete"
  collection: string
  documentId?: string
  documentData?: Record<string, unknown>
  timestamp: Date
  ipAddress?: string
  userAgent?: string
}

export async function logActivity(log: Omit<ActivityLog, "id" | "timestamp">) {
  try {
    const db = getAdminDb()
    if (!db) {
      console.error("Firebase Admin no está configurado, no se puede registrar log")
      return
    }

    const activityLog: ActivityLog = {
      ...log,
      timestamp: new Date(),
    }

    await db.collection("activityLogs").add(activityLog)
  } catch (error) {
    console.error("Error registrando actividad:", error)
  }
}

export async function getActivityLogs(limit = 100) {
  try {
    const db = getAdminDb()
    if (!db) {
      return []
    }

    const snapshot = await db
      .collection("activityLogs")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get()

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    })) as ActivityLog[]
  } catch (error) {
    console.error("Error obteniendo logs:", error)
    return []
  }
}
