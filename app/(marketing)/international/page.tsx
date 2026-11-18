import type { Metadata } from 'next';
import { LanderTemplate } from '@/components/landers/LanderTemplate';
import { landers } from '@/content/landers';
import { buildMetadata } from '@/lib/seo';

const lander = landers['international'];

export const metadata: Metadata = buildMetadata({
  title: lander.title,
  description: lander.intro,
  path: '/international',
});

export default function InternationalPage() {
  return <LanderTemplate lander={lander} />;
}
