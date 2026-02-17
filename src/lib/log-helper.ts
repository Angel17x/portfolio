import { NextRequest } from "next/server"
import { getAuthUserFromRequest } from "./auth-server"
import { logActivity } from "./logs"

export async function logCRUDAction(
  request: NextRequest,
  action: "create" | "update" | "delete",
  collection: string,
  documentId?: string,
  documentData?: Record<string, unknown>
) {
  try {
    const user = await getAuthUserFromRequest(request)
    if (!user) return

    await logActivity({
      userId: user.uid,
      userEmail: user.email || "unknown",
      action,
      collection,
      documentId,
      documentData: documentData ? sanitizeData(documentData) : undefined,
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })
  } catch (error) {
    console.error("Error registrando acción CRUD:", error)
  }
}

// Sanitizar datos para no guardar información sensible o muy grande
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  const maxLength = 500

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" && value.length > maxLength) {
      sanitized[key] = value.substring(0, maxLength) + "..."
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}
