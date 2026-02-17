/**
 * Helpers de seguridad para validar y sanitizar datos
 */

// Rate limiting simple (en producción usar Redis o similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minuto
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

// Limpiar registros antiguos periódicamente
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000) // Cada 5 minutos

// Validar y sanitizar strings
export function sanitizeString(input: string, maxLength: number = 10000): string {
  if (typeof input !== "string") {
    throw new Error("Input debe ser un string")
  }

  if (input.length > maxLength) {
    throw new Error(`Input demasiado largo (máximo ${maxLength} caracteres)`)
  }

  // Remover caracteres de control excepto saltos de línea y tabs
  return input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "")
}

// Validar URLs
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Solo permitir HTTP/HTTPS
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

// Validar emails
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Validar que un archivo es del tipo esperado
export function isValidFileType(
  fileName: string,
  allowedTypes: string[]
): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}

// Validar tamaño de archivo
export function isValidFileSize(size: number, maxSizeBytes: number): boolean {
  return size > 0 && size <= maxSizeBytes
}
