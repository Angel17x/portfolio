"use client"

import { Code2Icon } from "lucide-react"

interface CodeSnippetProps {
  filename: string
  children: React.ReactNode
  className?: string
}

export function CodeSnippet({ filename, children, className = "" }: CodeSnippetProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border/50 bg-card ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-border/50 bg-muted/50 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500/80" />
          <span className="size-2.5 rounded-full bg-yellow-500/80" />
          <span className="size-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Code2Icon className="size-3" />
          {filename}
        </span>
      </div>
      <div className="max-h-32 overflow-hidden p-3 font-mono text-xs leading-relaxed">
        {children}
      </div>
    </div>
  )
}
