import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Capabilities } from '@/components/sections/Capabilities';
import { Workflow } from '@/components/sections/Workflow';
import { ProductMock } from '@/components/sections/ProductMock';
import { InterviewPrep } from '@/components/sections/InterviewPrep';
import { Platforms } from '@/components/sections/Platforms';
import { Comparison } from '@/components/sections/Comparison';
import { FreeNoStrings } from '@/components/sections/FreeNoStrings';
import { FAQ } from '@/components/sections/FAQ';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { ForAgents } from '@/components/sections/ForAgents';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'RolePilot — The free AI agent that applies for you',
  description:
    'RolePilot finds matching jobs, tailors your resume, submits applications, and tracks replies — automatically, for free, with no account required.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <Capabilities />
      <Workflow />
      <ProductMock />
      <InterviewPrep />
      <Platforms />
      <Comparison />
      <FreeNoStrings />
      <FAQ />
      <FinalCTA />
      <ForAgents />
    </>
  );
}
