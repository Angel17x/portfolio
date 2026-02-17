"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { AIChatAssistant } from "./AIChatAssistant"
import { getIdToken } from "@/lib/auth"
import { Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

const STORAGE_KEY = "admin-ai-button-corner"
const PADDING = 24
const BTN_SIZE = 56

type Corner = "tl" | "tr" | "bl" | "br"

function getNearestCorner(centerX: number, centerY: number): Corner {
  const w = window.innerWidth
  const h = window.innerHeight
  const cx = centerX
  const cy = centerY

  const corners: { corner: Corner; x: number; y: number }[] = [
    { corner: "tl", x: PADDING + BTN_SIZE / 2, y: PADDING + BTN_SIZE / 2 },
    { corner: "tr", x: w - PADDING - BTN_SIZE / 2, y: PADDING + BTN_SIZE / 2 },
    { corner: "bl", x: PADDING + BTN_SIZE / 2, y: h - PADDING - BTN_SIZE / 2 },
    { corner: "br", x: w - PADDING - BTN_SIZE / 2, y: h - PADDING - BTN_SIZE / 2 },
  ]

  let best: Corner = "br"
  let bestDist = Infinity
  for (const { corner, x, y } of corners) {
    const d = (cx - x) ** 2 + (cy - y) ** 2
    if (d < bestDist) {
      bestDist = d
      best = corner
    }
  }
  return best
}

export function FloatingAIChatButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)

  const [corner, setCorner] = useState<Corner | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null)
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null)
  const hasMovedRef = useRef(false)

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)
      if (stored && ["tl", "tr", "bl", "br"].includes(stored)) {
        setCorner(stored as Corner)
      }
    } catch {
      // ignorar
    }
  }, [])

  const saveCorner = useCallback((c: Corner) => {
    try {
      localStorage.setItem(STORAGE_KEY, c)
    } catch {
      // ignorar
    }
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
      const start = dragStartRef.current
      if (!start) return

      const deltaX = Math.abs(clientX - start.x)
      const deltaY = Math.abs(clientY - start.y)
      
      // Solo marcar como "movido" si el movimiento es significativo (> 5px)
      if (deltaX > 5 || deltaY > 5) {
        hasMovedRef.current = true
      }

      const newX = start.posX + (clientX - start.x)
      const newY = start.posY + (clientY - start.y)

      const maxX = window.innerWidth - BTN_SIZE - PADDING
      const maxY = window.innerHeight - BTN_SIZE - PADDING

      setDragPosition({
        x: Math.max(PADDING, Math.min(newX, maxX)),
        y: Math.max(PADDING, Math.min(newY, maxY)),
      })
    }

    const onUp = () => {
      const start = dragStartRef.current
      if (start && dragPosition) {
        const centerX = dragPosition.x + BTN_SIZE / 2
        const centerY = dragPosition.y + BTN_SIZE / 2
        const next = getNearestCorner(centerX, centerY)
        setCorner(next)
        saveCorner(next)
      }
      setDragPosition(null)
      setIsDragging(false)
      dragStartRef.current = null
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mouseup", onUp)
    window.addEventListener("touchmove", onMove, { passive: true })
    window.addEventListener("touchend", onUp)

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", onUp)
    }
  }, [isDragging, dragPosition, saveCorner])

  const currentCorner = corner ?? "br"

  function getCornerPixelPosition(c: Corner): { x: number; y: number } {
    const w = window.innerWidth
    const h = window.innerHeight
    switch (c) {
      case "tl":
        return { x: PADDING, y: PADDING }
      case "tr":
        return { x: w - PADDING - BTN_SIZE, y: PADDING }
      case "bl":
        return { x: PADDING, y: h - PADDING - BTN_SIZE }
      case "br":
        return { x: w - PADDING - BTN_SIZE, y: h - PADDING - BTN_SIZE }
    }
  }

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    const { x: posX, y: posY } = getCornerPixelPosition(currentCorner)

    hasMovedRef.current = false
    dragStartRef.current = { x: clientX, y: clientY, posX, posY }
    setIsDragging(true)
    setDragPosition({ x: posX, y: posY })
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Solo abrir si no hubo movimiento significativo (más de 5px)
    if (!hasMovedRef.current) {
      setChatOpen(true)
    }
  }

  useEffect(() => {
    // Verificar si el usuario está autenticado como admin
    const checkAuth = async () => {
      try {
        const token = await getIdToken()
        if (!token) {
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }

        const response = await fetch("/api/admin/auth/session", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
    const interval = setInterval(checkAuth, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading || !isAuthenticated) {
    return null
  }

  const pixelPos = isDragging && dragPosition
    ? dragPosition
    : getCornerPixelPosition(currentCorner)

  return (
    <>
      <AnimatePresence>
        {!chatOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              left: pixelPos.x,
              top: pixelPos.y,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              scale: { type: "spring", stiffness: 260, damping: 20 },
              opacity: { type: "spring", stiffness: 260, damping: 20 },
              left: isDragging
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 28 },
              top: isDragging
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 28 },
            }}
            className="fixed z-50 cursor-grab active:cursor-grabbing"
            style={{ position: "fixed", zIndex: 50 }}
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
          >
            <motion.div
              whileHover={{ scale: isDragging ? 1 : 1.1 }}
              whileTap={{ scale: isDragging ? 1 : 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                type="button"
                onClick={handleClick}
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl select-none touch-none"
                aria-label="Abrir asistente de IA"
              >
                <motion.div
                  animate={isDragging ? {} : { rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="w-6 h-6 pointer-events-none" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIChatAssistant
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </>
  )
}
