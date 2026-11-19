export type Platform = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: 'globe' | 'apple' | 'smartphone' | 'message-circle' | 'puzzle' | 'terminal-square';
  comingSoon?: boolean;
};

export const platforms: Platform[] = [
  {
    id: 'web',
    name: 'Web app',
    description: 'The full dashboard — find, tailor, apply, and track from any browser.',
    href: '/app',
    icon: 'globe',
  },
  {
    id: 'ios',
    name: 'iOS',
    description: 'Review matches and approve applications from your pocket.',
    href: '/mobile',
    icon: 'apple',
    comingSoon: true,
  },
  {
    id: 'android',
    name: 'Android',
    description: 'The same agent, tuned for Android notifications and widgets.',
    href: '/mobile',
    icon: 'smartphone',
    comingSoon: true,
  },
  {
    id: 'messaging',
    name: 'iMessage & WhatsApp',
    description: 'Get match alerts and approve applications without opening an app.',
    href: '/messaging',
    icon: 'message-circle',
  },
  {
    id: 'extension',
    name: 'Chrome extension',
    description: 'Tailor and submit from any job posting you happen to land on.',
    href: '/auto-apply',
    icon: 'puzzle',
    comingSoon: true,
  },
  {
    id: 'mcp',
    name: 'MCP server',
    description: 'Plug RolePilot into Claude, Cursor, or your own agent stack.',
    href: '/mcp',
    icon: 'terminal-square',
  },
];
