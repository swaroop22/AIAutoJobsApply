const LINKS = [
  { href: '/agents.md', label: '/agents.md' },
  { href: '/llms.txt', label: '/llms.txt' },
  { href: '/openapi.json', label: '/openapi.json' },
];

export function ForAgents() {
  return (
    <section className="border-t border-line bg-wash py-8">
      <div className="ol-container flex flex-col items-center gap-3 text-center font-mono text-xs text-muted-2 sm:flex-row sm:justify-center sm:gap-6">
        <span>Building an agent that applies on someone's behalf? Start here —</span>
        <div className="flex gap-4">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-ink underline underline-offset-4">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
