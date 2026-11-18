import type { Metadata } from 'next';
import { LanderTemplate } from '@/components/landers/LanderTemplate';
import { landers } from '@/content/landers';
import { buildMetadata } from '@/lib/seo';

const lander = landers['auto-apply'];

export const metadata: Metadata = buildMetadata({
  title: lander.title,
  description: lander.intro,
  path: '/auto-apply',
});

export default function AutoApplyPage() {
  return <LanderTemplate lander={lander} />;
}
