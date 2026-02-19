export default function DashboardLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[200px] p-4 md:p-6">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm">Cargando...</p>
      </div>
    </div>
  )
}
