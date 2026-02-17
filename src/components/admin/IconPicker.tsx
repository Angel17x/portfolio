"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  BotIcon,
  GlobeIcon,
  SmartphoneIcon,
  ShieldIcon,
  CodeIcon,
  DatabaseIcon,
  CloudIcon,
  ServerIcon,
  LaptopIcon,
  MonitorIcon,
  PaletteIcon,
  RocketIcon,
  ZapIcon,
  LockIcon,
  KeyIcon,
  WifiIcon,
  CpuIcon,
  BoxIcon,
  PackageIcon,
  LayersIcon,
  GitBranchIcon,
  SettingsIcon,
  Wand2Icon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react"
import type { ProjectIcon } from "@/types/portfolio"

interface IconOption {
  value: ProjectIcon
  label: string
  icon: LucideIcon
}

const iconOptions: IconOption[] = [
  { value: "bot", label: "Bot", icon: BotIcon },
  { value: "globe", label: "Globe", icon: GlobeIcon },
  { value: "smartphone", label: "Smartphone", icon: SmartphoneIcon },
  { value: "shield", label: "Shield", icon: ShieldIcon },
  { value: "code", label: "Code", icon: CodeIcon },
  { value: "database", label: "Database", icon: DatabaseIcon },
  { value: "cloud", label: "Cloud", icon: CloudIcon },
  { value: "server", label: "Server", icon: ServerIcon },
  { value: "laptop", label: "Laptop", icon: LaptopIcon },
  { value: "monitor", label: "Monitor", icon: MonitorIcon },
  { value: "palette", label: "Palette", icon: PaletteIcon },
  { value: "rocket", label: "Rocket", icon: RocketIcon },
  { value: "zap", label: "Zap", icon: ZapIcon },
  { value: "lock", label: "Lock", icon: LockIcon },
  { value: "key", label: "Key", icon: KeyIcon },
  { value: "wifi", label: "WiFi", icon: WifiIcon },
  { value: "cpu", label: "CPU", icon: CpuIcon },
  { value: "box", label: "Box", icon: BoxIcon },
  { value: "package", label: "Package", icon: PackageIcon },
  { value: "layers", label: "Layers", icon: LayersIcon },
  { value: "git-branch", label: "Git Branch", icon: GitBranchIcon },
  { value: "settings", label: "Settings", icon: SettingsIcon },
  { value: "wand-2", label: "Wand", icon: Wand2Icon },
  { value: "sparkles", label: "Sparkles", icon: SparklesIcon },
]

interface IconPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIcon: ProjectIcon
  onSelect: (icon: ProjectIcon) => void
}

export function IconPicker({ open, onOpenChange, selectedIcon, onSelect }: IconPickerProps) {
  const handleSelect = (icon: ProjectIcon) => {
    onSelect(icon)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar Icono</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 py-4">
          {iconOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selectedIcon === option.value
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all
                  hover:bg-accent hover:border-primary
                  ${
                    isSelected
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border bg-card"
                  }
                `}
                title={option.label}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs text-center">{option.label}</span>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
