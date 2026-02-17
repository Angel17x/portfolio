import { getAdminDb } from "./firebase-admin"
import type { Visit } from "./validations/analytics-schemas"

export async function logVisit(visit: Visit) {
  try {
    const db = getAdminDb()
    if (!db) {
      console.warn("Firebase Admin no está configurado, no se puede registrar visita")
      return
    }

    await db.collection("visits").add({
      ...visit,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Error registrando visita:", error)
  }
}

export async function getVisits(limit: number = 100) {
  try {
    const db = getAdminDb()
    if (!db) {
      return []
    }

    const snapshot = await db
      .collection("visits")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get()

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error obteniendo visitas:", error)
    return []
  }
}

export async function getAnalyticsStats(days: number = 30) {
  try {
    const db = getAdminDb()
    if (!db) {
      return null
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffTimestamp = cutoffDate.getTime()

    const snapshot = await db
      .collection("visits")
      .where("timestamp", ">=", cutoffTimestamp)
      .get()

    const visits = snapshot.docs.map((doc) => doc.data() as Visit)

    // Calcular estadísticas
    const uniqueVisitors = new Set(visits.map((v) => v.sessionId).filter(Boolean)).size
    const visitsByPath: Record<string, number> = {}
    const visitsBySection: Record<string, number> = {}
    const visitsByDevice: Record<string, number> = {}
    const visitsByCountry: Record<string, number> = {}
    const visitsByDate: Record<string, number> = {}

    visits.forEach((visit) => {
      // Por path
      visitsByPath[visit.path] = (visitsByPath[visit.path] || 0) + 1

      // Por sección
      if (visit.section) {
        visitsBySection[visit.section] = (visitsBySection[visit.section] || 0) + 1
      }

      // Por dispositivo
      if (visit.device) {
        visitsByDevice[visit.device] = (visitsByDevice[visit.device] || 0) + 1
      }

      // Por país
      if (visit.country) {
        visitsByCountry[visit.country] = (visitsByCountry[visit.country] || 0) + 1
      }

      // Por fecha
      const date = new Date(visit.timestamp).toISOString().split("T")[0]
      visitsByDate[date] = (visitsByDate[date] || 0) + 1
    })

    return {
      totalVisits: visits.length,
      uniqueVisitors,
      visitsByPath,
      visitsBySection,
      visitsByDevice,
      visitsByCountry,
      visitsByDate,
    }
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return null
  }
}
