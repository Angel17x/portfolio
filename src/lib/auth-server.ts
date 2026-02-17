import { getAuth } from "firebase-admin/auth"
import { getFirebaseAdmin } from "./firebase-admin"

export async function verifyIdToken(idToken: string) {
  const adminApp = getFirebaseAdmin()
  if (!adminApp) {
    const error = new Error("Firebase Admin no está configurado. Verifica que FIREBASE_SERVICE_ACCOUNT esté configurado en .env.local")
    console.error(error.message)
    throw error
  }
  
  const auth = getAuth(adminApp)
  try {
    const decodedToken = await auth.verifyIdToken(idToken)
    return decodedToken
  } catch (error: any) {
    console.error("Error verificando token:", error?.code || error?.message || error)
    throw new Error(`Token inválido: ${error?.code || error?.message || "Error desconocido"}`)
  }
}

export async function getAuthUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  
  const idToken = authHeader.substring(7)
  
  // Validaciones básicas de seguridad
  if (!idToken || idToken.length < 20) {
    console.warn("Token inválido: demasiado corto")
    return null
  }
  
  try {
    const decodedToken = await verifyIdToken(idToken)
    
    // Validar que el token tenga los campos necesarios
    if (!decodedToken.uid || !decodedToken.email) {
      console.warn("Token inválido: falta información requerida")
      return null
    }
    
    return decodedToken
  } catch (error) {
    // No exponer detalles del error al cliente
    console.error("Error verificando token:", error)
    return null
  }
}

// Función helper para validar que el usuario es admin
// Puedes extender esto para verificar roles específicos si los implementas
export async function requireAdminAuth(request: Request) {
  const user = await getAuthUserFromRequest(request)
  if (!user) {
    throw new Error("No autenticado")
  }
  return user
}
