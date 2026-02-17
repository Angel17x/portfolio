"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { getIdToken } from "@/lib/auth"
import { BarChart3, Users, Eye, Globe, Smartphone, Monitor, Tablet, Calendar, TrendingUp } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { ChartConfig } from "@/components/ui/chart"

interface AnalyticsStats {
  totalVisits: number
  uniqueVisitors: number
  visitsByPath: Record<string, number>
  visitsBySection: Record<string, number>
  visitsByDevice: Record<string, number>
  visitsByCountry: Record<string, number>
  visitsByDate: Record<string, number>
}

interface Visit {
  id: string
  timestamp: number
  path: string
  section?: string
  device?: string
  country?: string
  browser?: string
  os?: string
}

export function AnalyticsDashboard() {
  const { theme, resolvedTheme } = useTheme()
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)
  const [error, setError] = useState("")

  useEffect(() => {
    loadAnalytics()
  }, [days])

  const loadAnalytics = async () => {
    try {
      const token = await getIdToken()
      if (!token) throw new Error("No autenticado")

      const response = await fetch(`/api/admin/analytics?days=${days}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Error al cargar analytics")
      }

      const data = await response.json()
      setStats(data.stats)
      setVisits(data.visits)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar analytics")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatChartDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
  }

  const getDeviceIcon = (device?: string) => {
    switch (device) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />
      case "tablet":
        return <Tablet className="w-4 h-4" />
      case "desktop":
        return <Monitor className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando analytics...</div>
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive">
        {error}
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-8">No hay datos disponibles</div>
  }

  // Preparar datos para gráficos
  const visitsByDateData = Object.entries(stats.visitsByDate)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, count]) => ({
      date: formatChartDate(date),
      visitas: count,
    }))

  const topSectionsData = Object.entries(stats.visitsBySection)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([section, count]) => ({
      name: section.charAt(0).toUpperCase() + section.slice(1),
      visitas: count,
    }))

  // Colores para dispositivos - usando valores directos
  const deviceColors: Record<string, { light: string; dark: string }> = {
    mobile: {
      light: "oklch(0.52 0.15 165)",
      dark: "oklch(0.65 0.17 165)",
    },
    desktop: {
      light: "oklch(0.65 0.17 165)",
      dark: "oklch(0.7 0.15 165)",
    },
    tablet: {
      light: "oklch(0.45 0.1 165)",
      dark: "oklch(0.6 0.12 165)",
    },
  }

  // Determinar el color según el tema actual
  const isDark = resolvedTheme === "dark"
  const primaryColor = isDark ? "oklch(0.65 0.17 165)" : "oklch(0.52 0.15 165)"
  
  const getDeviceColor = (device: string) => {
    const colorConfig = deviceColors[device] || deviceColors.mobile
    return isDark ? colorConfig.dark : colorConfig.light
  }

  const devicesData = Object.entries(stats.visitsByDevice)
    .map(([device, count]) => ({
      name: device.charAt(0).toUpperCase() + device.slice(1),
      value: count,
      device: device,
      fill: getDeviceColor(device),
    }))

  const topPathsData = Object.entries(stats.visitsByPath)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([path, count]) => ({
      name: path.length > 20 ? path.substring(0, 20) + "..." : path,
      visitas: count,
    }))

  // Colores para los gráficos usando el sistema de temas de shadcn
  const visitsChartConfig: ChartConfig = {
    visitas: {
      label: "Visitas",
      theme: {
        light: "oklch(0.52 0.15 165)",
        dark: "oklch(0.65 0.17 165)",
      },
    },
  }

  const sectionsChartConfig: ChartConfig = {
    visitas: {
      label: "Visitas",
      theme: {
        light: "oklch(0.52 0.15 165)",
        dark: "oklch(0.65 0.17 165)",
      },
    },
  }

  // Crear config dinámico para dispositivos
  const devicesChartConfig: ChartConfig = Object.entries(stats.visitsByDevice).reduce(
    (acc, [device]) => {
      const colorConfig = deviceColors[device] || deviceColors.mobile
      acc[device] = {
        label: device.charAt(0).toUpperCase() + device.slice(1),
        theme: colorConfig,
      }
      return acc
    },
    {} as ChartConfig
  )

  // Ordenar dispositivos por visitas
  const topDevices = Object.entries(stats.visitsByDevice)
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={days === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setDays(7)}
            className="text-xs sm:text-sm"
          >
            7 días
          </Button>
          <Button
            variant={days === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setDays(30)}
            className="text-xs sm:text-sm"
          >
            30 días
          </Button>
          <Button
            variant={days === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setDays(90)}
            className="text-xs sm:text-sm"
          >
            90 días
          </Button>
        </div>
        <Button variant="outline" onClick={loadAnalytics} size="sm" className="w-full sm:w-auto">
          Actualizar
        </Button>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="p-4 md:p-6 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 md:w-8 md:h-8 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Total de Visitas</p>
              <p className="text-xl md:text-2xl font-bold">{stats.totalVisits}</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Visitantes Únicos</p>
              <p className="text-xl md:text-2xl font-bold">{stats.uniqueVisitors}</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border rounded-lg bg-card sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Promedio por Día</p>
              <p className="text-xl md:text-2xl font-bold">
                {Math.round(stats.totalVisits / days)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de visitas por fecha */}
      {visitsByDateData.length > 0 && (
        <div className="border rounded-lg p-4 md:p-6 bg-card">
          <h3 className="text-base md:text-lg font-semibold mb-4">Visitas por Fecha</h3>
          <ChartContainer config={visitsChartConfig} className="h-[300px] w-full">
            <LineChart data={visitsByDateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="visitas"
                stroke={primaryColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: primaryColor }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      )}

      {/* Gráficos en grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Gráfico de secciones más visitadas */}
        {topSectionsData.length > 0 && (
          <div className="border rounded-lg p-4 md:p-6 bg-card">
            <h3 className="text-base md:text-lg font-semibold mb-4">Secciones Más Visitadas</h3>
            <ChartContainer config={sectionsChartConfig} className="h-[250px] w-full">
              <BarChart data={topSectionsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="visitas" 
                fill={primaryColor}
                radius={[8, 8, 0, 0]}
              />
              </BarChart>
            </ChartContainer>
          </div>
        )}

        {/* Gráfico de dispositivos (Pie Chart) */}
        {devicesData.length > 0 && (
          <div className="border rounded-lg p-4 md:p-6 bg-card">
            <h3 className="text-base md:text-lg font-semibold mb-4">Dispositivos</h3>
            <ChartContainer config={devicesChartConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={devicesData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {devicesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2"
                />
              </PieChart>
            </ChartContainer>
          </div>
        )}
      </div>

      {/* Gráfico de rutas más visitadas */}
      {topPathsData.length > 0 && (
        <div className="border rounded-lg p-4 md:p-6 bg-card">
          <h3 className="text-base md:text-lg font-semibold mb-4">Rutas Más Visitadas</h3>
          <ChartContainer config={sectionsChartConfig} className="h-[250px] w-full">
            <BarChart data={topPathsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={100}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="visitas" 
                fill={primaryColor}
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      )}

      {/* Dispositivos - Cards */}
      {topDevices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {topDevices.map(([device, count]) => (
            <div key={device} className="border rounded-lg p-3 md:p-4 bg-card">
              <div className="flex items-center gap-3">
                {getDeviceIcon(device)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-muted-foreground capitalize truncate">{device}</p>
                  <p className="text-lg md:text-xl font-bold">{count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visitas recientes */}
      <div className="border rounded-lg p-4 md:p-6 bg-card">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Visitas Recientes</h3>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-xs md:text-sm">Fecha</th>
                  <th className="text-left p-2 text-xs md:text-sm hidden sm:table-cell">Ruta</th>
                  <th className="text-left p-2 text-xs md:text-sm">Sección</th>
                  <th className="text-left p-2 text-xs md:text-sm hidden md:table-cell">Dispositivo</th>
                  <th className="text-left p-2 text-xs md:text-sm hidden lg:table-cell">Navegador</th>
                </tr>
              </thead>
              <tbody>
                {visits.slice(0, 20).map((visit) => (
                  <tr key={visit.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 text-xs md:text-sm whitespace-nowrap">{formatDate(visit.timestamp)}</td>
                    <td className="p-2 text-xs md:text-sm font-mono hidden sm:table-cell truncate max-w-[200px]">{visit.path}</td>
                    <td className="p-2 text-xs md:text-sm capitalize">{visit.section || "-"}</td>
                    <td className="p-2 text-xs md:text-sm capitalize hidden md:table-cell">{visit.device || "-"}</td>
                    <td className="p-2 text-xs md:text-sm hidden lg:table-cell truncate max-w-[100px]">{visit.browser || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
