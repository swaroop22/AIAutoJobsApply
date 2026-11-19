import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of service — RolePilot',
  description: 'The terms for using RolePilot.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <section className="ol-section pt-32">
      <div className="ol-container ol-prose max-w-2xl">
        <h1 className="ol-h1 text-ink">Terms of service</h1>
        <p className="mt-4 text-sm text-muted-2">Last updated November 17, 2026</p>

        <h2>Using RolePilot</h2>
        <p>
          RolePilot is a free tool that helps you find, tailor, and submit job applications, and
          track replies. No account or payment is required to use it. By using RolePilot you
          agree to these terms.
        </p>

        <h2>Accuracy of your information</h2>
        <p>
          You're responsible for the accuracy of the resume and information you provide. RolePilot
          tailors and reorders your existing experience for each listing but does not invent
          skills, employers, or credentials on your behalf — you should review tailored resumes
          before relying on them, especially in Auto Apply mode.
        </p>

        <h2>Fair use</h2>
        <p>
          To keep the system reliable for everyone, fully automated submissions are subject to a
          daily fair-use cap, listed in the app. We may adjust this limit as needed.
        </p>

        <h2>No guarantees of outcome</h2>
        <p>
          RolePilot helps you apply faster and more consistently, but it does not guarantee
          interviews, offers, or employer responses of any kind.
        </p>

        <h2>Changes to the service</h2>
        <p>
          RolePilot is under active development and features may change, be added, or be removed.
          We'll reflect meaningful changes on the changelog.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to{' '}
          <a href="mailto:legal@rolepilot.com">legal@rolepilot.com</a>.
        </p>
      </div>
    </section>
  );
}
