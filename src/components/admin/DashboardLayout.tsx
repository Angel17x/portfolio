"use client"

import { useState, useMemo } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { AIChatAssistant } from "./AIChatAssistant"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
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
} from "lucide-react"

type Tab = "portfolio" | "experiences" | "projects" | "skills" | "education" | "settings" | "analytics" | "logs"

const TAB_MAP: Record<string, Tab> = {
  portfolio: "portfolio",
  experiences: "experiences",
  projects: "projects",
  skills: "skills",
  education: "education",
  settings: "settings",
  analytics: "analytics",
  logs: "logs",
}

function getActiveTab(pathname: string | null): Tab {
  if (!pathname) return "portfolio"
  if (pathname === "/admin/dashboard" || pathname === "/admin/dashboard/") return "portfolio"
  const match = pathname.match(/\/admin\/dashboard\/([^/]+)/)
  if (match && match[1] && TAB_MAP[match[1]]) return TAB_MAP[match[1]]
  return "portfolio"
}

const MENU_ITEMS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "portfolio", label: "Portfolio", icon: FileText },
  { id: "experiences", label: "Experiencias", icon: Briefcase },
  { id: "projects", label: "Proyectos", icon: Rocket },
  { id: "skills", label: "Habilidades", icon: Zap },
  { id: "education", label: "Educación", icon: GraduationCap },
  { id: "settings", label: "Configuración", icon: Settings },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "logs", label: "Logs", icon: LogsIcon },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiChatOpen, setAiChatOpen] = useState(false)

  const activeTab = useMemo(() => getActiveTab(pathname), [pathname])

  const handleLogout = async () => {
    try {
      await logout()
      await new Promise((r) => setTimeout(r, 300))
      try {
        await fetch("/api/admin/auth/logout", { method: "POST" })
      } catch {
        // ignore
      }
      window.location.href = "/admin/login"
    } catch {
      window.location.href = "/admin/login"
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen border-r bg-card transition-all duration-300 flex flex-col z-50
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-20"}
        `}
      >
        <div className="p-4 border-b flex items-center justify-between shrink-0 h-[73px]">
          {sidebarOpen && <h1 className="text-lg font-bold whitespace-nowrap">Admin Panel</h1>}
          {!sidebarOpen && <div className="w-5 h-5" />}
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-2 hover:bg-accent rounded-md transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon
            const href = `/admin/dashboard/${item.id}`
            const isActive = activeTab === item.id
            return (
              <Link
                key={item.id}
                href={href}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${sidebarOpen ? "justify-start" : "justify-center"}
                  ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"}
                `}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 ${sidebarOpen ? "px-4" : "px-2"}`}
            title={!sidebarOpen ? "Cerrar sesión" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span className="whitespace-nowrap">Cerrar sesión</span>}
          </Button>
        </div>
      </aside>

      <main
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}
      >
        <header className="border-b bg-card px-4 md:px-6 py-4 shrink-0 h-[73px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="md:hidden p-2 hover:bg-accent rounded-md transition-colors shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl md:text-2xl font-semibold truncate">
              {MENU_ITEMS.find((i) => i.id === activeTab)?.label ?? "Dashboard"}
            </h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </main>

      <AIChatAssistant
        open={aiChatOpen}
        onOpenChange={setAiChatOpen}
        onApplySuggestion={(section, content) => {
          console.log("Aplicar sugerencia:", section, content)
        }}
      />
    </div>
  )
}
