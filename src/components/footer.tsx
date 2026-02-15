import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-background/50 py-12">
      <div className="section-container flex flex-col items-center justify-between gap-6 py-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Angel Lugo. Todos los derechos reservados.
        </p>
        <div className="flex gap-6">
          <Link
            href="https://github.com/Angel17x"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            GitHub
          </Link>
          <Link
            href="https://www.linkedin.com/in/angel-lugo-fullstack-developer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            LinkedIn
          </Link>
        </div>
      </div>
    </footer>
  )
}
