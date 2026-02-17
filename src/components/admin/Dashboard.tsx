"use client"

import { useState, useEffect } from "react"
import { PortfolioEditor } from "./PortfolioEditor"
import { ExperiencesEditor } from "./ExperiencesEditor"
import { ProjectsEditor } from "./ProjectsEditor"
import { SkillGroupsEditor } from "./SkillGroupsEditor"
import { EducationEditor } from "./EducationEditor"
import { ActivityLogs } from "./ActivityLogs"
import { SettingsEditor } from "./SettingsEditor"
import { AnalyticsDashboard } from "./AnalyticsDashboard"
import { AIChatAssistant } from "./AIChatAssistant"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import {
  FileText,
  Briefcase,
  Rocket,
  Zap,
  GraduationCap,
  Settings,
  FileText as LogsIcon,
  Menu,
  X,
  LogOut,
  BarChart3,
  Sparkles,
} from "lucide-react"

type Tab = "portfolio" | "experiences" | "projects" | "skills" | "education" | "settings" | "analytics" | "logs"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("portfolio")
  const [sidebarOpen, setSidebarOpen] = useState(true) // Abierto por defecto
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const router = useRouter()

  // Cerrar sidebar cuando se cambia de tab en móvil
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    // Cerrar sidebar en móvil después de seleccionar
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Cerrar sesión en Firebase Auth
      await logout()
      
      // Esperar un momento para que Firebase procese el logout
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Llamar al endpoint de logout del servidor
      try {
        await fetch("/api/admin/auth/logout", { method: "POST" })
      } catch (err) {
        // Continuar aunque falle el endpoint del servidor
        console.warn("Error al llamar endpoint de logout:", err)
      }
      
      // Usar window.location para forzar una recarga completa
      window.location.href = "/admin/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      // Aún así, redirigir al login
      window.location.href = "/admin/login"
    }
  }

  const menuItems = [
    { id: "portfolio" as Tab, label: "Portfolio", icon: FileText },
    { id: "experiences" as Tab, label: "Experiencias", icon: Briefcase },
    { id: "projects" as Tab, label: "Proyectos", icon: Rocket },
    { id: "skills" as Tab, label: "Habilidades", icon: Zap },
    { id: "education" as Tab, label: "Educación", icon: GraduationCap },
    { id: "settings" as Tab, label: "Configuración", icon: Settings },
    { id: "analytics" as Tab, label: "Analytics", icon: BarChart3 },
    { id: "logs" as Tab, label: "Logs", icon: LogsIcon },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed y siempre visible en desktop, drawer en móvil */}
      <aside
        className={`
          fixed left-0 top-0 h-screen border-r bg-card transition-all duration-300 flex flex-col z-50
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-20"}
        `}
      >
        {/* Header del Sidebar */}
        <div className="p-4 border-b flex items-center justify-between shrink-0 h-[73px]">
          {sidebarOpen && (
            <h1 className="text-lg font-bold whitespace-nowrap">Admin Panel</h1>
          )}
          {!sidebarOpen && <div className="w-5 h-5" />}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-md transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Menu Items - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${sidebarOpen ? "justify-start" : "justify-center"}
                  ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  }
                `}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer del Sidebar - Siempre visible en la parte inferior */}
        <div className="p-4 border-t shrink-0">
          <Button
            variant="outline"
            onClick={handleLogout}
            className={`
              w-full flex items-center justify-center gap-2
              ${sidebarOpen ? "px-4" : "px-2"}
            `}
            title={!sidebarOpen ? "Cerrar sesión" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span className="whitespace-nowrap">Cerrar sesión</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content - Con margen izquierdo para el sidebar */}
      <main
        className={`
          flex-1 flex flex-col overflow-hidden transition-all duration-300
          ${sidebarOpen ? "md:ml-64" : "md:ml-20"}
        `}
      >
        {/* Top Bar - Alineado con el header del sidebar */}
        <header className="border-b bg-card px-4 md:px-6 py-4 shrink-0 h-[73px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-accent rounded-md transition-colors shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl md:text-2xl font-semibold truncate">
              {menuItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
            </h2>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === "portfolio" && <PortfolioEditor />}
          {activeTab === "experiences" && <ExperiencesEditor />}
          {activeTab === "projects" && <ProjectsEditor />}
          {activeTab === "skills" && <SkillGroupsEditor />}
          {activeTab === "education" && <EducationEditor />}
          {activeTab === "settings" && <SettingsEditor />}
          {activeTab === "analytics" && <AnalyticsDashboard />}
          {activeTab === "logs" && <ActivityLogs />}
        </div>
      </main>

      {/* Chat Asistente de IA */}
      <AIChatAssistant
        open={aiChatOpen}
        onOpenChange={setAiChatOpen}
        onApplySuggestion={(section, content) => {
          // Aquí puedes manejar la aplicación de sugerencias
          console.log("Aplicar sugerencia:", section, content)
          // Podrías abrir el editor correspondiente o aplicar directamente
        }}
      />
    </div>
  )
}
