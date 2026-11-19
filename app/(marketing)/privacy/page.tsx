import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy policy — RolePilot',
  description: 'How RolePilot handles your data.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <section className="ol-section pt-32">
      <div className="ol-container ol-prose max-w-2xl">
        <h1 className="ol-h1 text-ink">Privacy policy</h1>
        <p className="mt-4 text-sm text-muted-2">Last updated November 17, 2026</p>

        <h2>No account, minimal data</h2>
        <p>
          RolePilot does not require you to create an account. Your resume, job preferences, and
          application history are stored locally in your browser rather than in a central
          per-user database. We do not sell personal data.
        </p>

        <h2>What we do collect</h2>
        <p>
          When RolePilot submits an application on your behalf, the information in that
          application (your resume and your answers to screening questions) is sent to the
          relevant employer's applicant tracking system, exactly as it would be if you submitted
          it yourself. We also collect basic, aggregated usage analytics (such as page views and
          feature usage) to improve the product — this is not tied to an account because none
          exists.
        </p>

        <h2>Clearing your data</h2>
        <p>
          Because your resume and history live in your browser, clearing your browser's local
          storage for this site — or using the "Clear local data" option in the app — removes it
          entirely from our visibility.
        </p>

        <h2>Third parties</h2>
        <p>
          RolePilot submits applications through employers' own applicant tracking systems
          (Greenhouse, Lever, Workday, and others). Those systems have their own privacy
          practices once your application is submitted.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If this policy changes, we'll update the "last updated" date above. Material changes
          will be reflected on the changelog.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent to{' '}
          <a href="mailto:privacy@rolepilot.com">privacy@rolepilot.com</a>.
        </p>
      </div>
    </section>
  );
}
