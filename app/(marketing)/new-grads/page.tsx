import type { Metadata } from 'next';
import { LanderTemplate } from '@/components/landers/LanderTemplate';
import { landers } from '@/content/landers';
import { buildMetadata } from '@/lib/seo';

const lander = landers['new-grads'];

export const metadata: Metadata = buildMetadata({
  title: lander.title,
  description: lander.intro,
  path: '/new-grads',
});

export default function NewGradsPage() {
  return <LanderTemplate lander={lander} />;
}
