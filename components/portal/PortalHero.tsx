import { cn } from "@/lib/utils";

export function PortalHero({
  eyebrow,
  title,
  description,
  imageSrc,
  right,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  imageSrc: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden rounded-2xl border", "glass", className)}>
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {eyebrow ? <p className="text-xs font-medium text-muted-foreground">{eyebrow}</p> : null}
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {right ? <div className="flex shrink-0 flex-wrap gap-2">{right}</div> : null}
        </div>
      </div>
    </section>
  );
}

