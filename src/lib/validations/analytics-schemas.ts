import { z } from "zod"

export const VisitSchema = z.object({
  timestamp: z.number(),
  path: z.string(),
  section: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  ip: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  device: z.string().optional(), // mobile, desktop, tablet
  browser: z.string().optional(),
  os: z.string().optional(),
  sessionId: z.string().optional(),
})

export type Visit = z.infer<typeof VisitSchema>

export const AnalyticsStatsSchema = z.object({
  totalVisits: z.number(),
  uniqueVisitors: z.number(),
  visitsByPath: z.record(z.string(), z.number()),
  visitsBySection: z.record(z.string(), z.number()),
  visitsByDevice: z.record(z.string(), z.number()),
  visitsByCountry: z.record(z.string(), z.number()),
  visitsByDate: z.record(z.string(), z.number()),
})

export type AnalyticsStats = z.infer<typeof AnalyticsStatsSchema>
