import { Linkedin, Twitter, Mail } from 'lucide-react';

const PRODUCT_LINKS = [
  { href: '/app', label: 'Open the app' },
  { href: '/auto-apply', label: 'Auto Apply' },
  { href: '/interview-prep', label: 'Interview prep' },
  { href: '/changelog', label: 'Changelog' },
];

const PLATFORM_LINKS = [
  { href: '/mobile', label: 'Mobile' },
  { href: '/messaging', label: 'Messaging' },
  { href: '/mcp', label: 'MCP server' },
  { href: '/agents', label: 'For agents' },
];

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/ai-disclosure', label: 'AI disclosure' },
  { href: '/support', label: 'Support' },
];

export function Footer() {
  const year = 2026;

  return (
    <footer className="border-t border-line bg-wash">
      <div className="ol-container ol-section">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="font-display text-xl">RolePilot</span>
            <p className="mt-3 max-w-xs text-sm text-body">
              A free agent that finds, tailors, applies, and tracks — so your job search runs
              while you do everything else.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://linkedin.com"
                aria-label="RolePilot on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-pill border border-line text-ink/70 hover:text-ink"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="https://x.com"
                aria-label="RolePilot on X"
                className="flex h-9 w-9 items-center justify-center rounded-pill border border-line text-ink/70 hover:text-ink"
              >
                <Twitter size={16} />
              </a>
              <a
                href="mailto:hello@rolepilot.com"
                aria-label="Email RolePilot"
                className="flex h-9 w-9 items-center justify-center rounded-pill border border-line text-ink/70 hover:text-ink"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Platforms" links={PLATFORM_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted-2 md:flex-row md:items-center md:justify-between">
          <span>© {year} RolePilot. All rights reserved.</span>
          <span>Free forever. No account, no card, no catch.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="ol-eyebrow">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="text-sm text-body hover:text-ink">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
