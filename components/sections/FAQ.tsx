import { Reveal } from '@/components/Reveal';
import { faq } from '@/content/faq';
import { faqJsonLd } from '@/lib/jsonld';

export function FAQ() {
  return (
    <section id="faq" className="ol-section">
      <div className="ol-container max-w-3xl">
        <Reveal>
          <span className="ol-eyebrow">FAQ</span>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="ol-h2 mt-3 text-ink">Questions people actually ask.</h2>
        </Reveal>

        <div className="mt-10">
          {faq.map((item, i) => (
            <Reveal key={item.question} delay={Math.min(i * 30, 240)}>
              <details className="ol-fold">
                <summary>
                  {item.question}
                  <span className="ol-fold-icon" aria-hidden="true" />
                </summary>
                <p className="ol-fold-body">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }}
      />
    </section>
  );
}
