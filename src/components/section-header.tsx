interface SectionHeaderProps {
  number: string
  title: string
  className?: string
}

export function SectionHeader({ number, title, className = "" }: SectionHeaderProps) {
  return (
    <div className={`mb-12 md:mb-16 ${className}`}>
      <span className="mb-2 block text-sm font-medium text-primary">
        {number}
      </span>
      <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
        {title}
      </h2>
    </div>
  )
}
