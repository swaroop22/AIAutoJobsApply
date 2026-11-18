import { Reveal } from '@/components/Reveal';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content">
        <section className="ol-section flex min-h-[70vh] items-center pt-32">
          <div className="ol-container max-w-xl text-center">
            <Reveal>
              <span className="ol-eyebrow">404</span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="ol-h1 mt-3 text-ink">This page didn't get an interview.</h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-5 text-body">
                The page you're looking for doesn't exist, or moved. Let's get you back on track.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <a href="/" className="ol-btn-solid mt-8 inline-flex">
                Back to home
              </a>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
