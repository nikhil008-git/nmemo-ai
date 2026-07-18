import Link from "next/link";

const nav = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/playground", label: "Playground" },
  { href: "/docs/sdk", label: "SDK" },
  { href: "/docs/connectors", label: "Connectors" },
  { href: "/docs/api", label: "HTTP API" },
] as const;

export function DocsShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <header className="space-y-2 border-b border-border pb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Documentation
        </p>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <nav className="flex flex-wrap gap-4 pt-1 text-sm font-medium text-muted-foreground">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <article className="prose-docs max-w-none space-y-5 text-sm leading-relaxed text-foreground/90">
        {children}
      </article>
    </div>
  );
}

export function DocH2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold tracking-tight">{children}</h2>;
}

export function DocP({ children }: { children: React.ReactNode }) {
  return <p className="font-light text-muted-foreground">{children}</p>;
}

export function DocCode({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto border border-border bg-input/50 p-4 text-xs leading-relaxed text-foreground">
      <code>{children}</code>
    </pre>
  );
}

export function DocTable({
  rows,
}: {
  rows: { label: string; value: React.ReactNode }[];
}) {
  return (
    <ul className="divide-y divide-border border border-border">
      {rows.map((r) => (
        <li
          key={r.label}
          className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-6"
        >
          <span className="w-40 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {r.label}
          </span>
          <span className="min-w-0 break-words">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}
