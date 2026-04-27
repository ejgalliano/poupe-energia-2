import { ReactNode } from "react";
import { LucideIcon, Flame, ArrowRight, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";

export interface ProductSection {
  icon?: "fire" | "point";
  title: string;
  body?: ReactNode;
  bullets?: string[];
  cards?: string[];
  cardsCols?: 2 | 3;
}

interface ProductPageLayoutProps {
  title: string;
  subtitle: string;
  heroIcon: LucideIcon;
  highlights?: string[];
  sections: ProductSection[];
  finalQuote: string;
  seoTitle?: string;
  seoDescription?: string;
}

const WHATSAPP = "https://wa.me/5543996796546";

const SectionIcon = ({ kind }: { kind?: "fire" | "point" }) => {
  if (kind === "fire") return <span className="text-2xl">🔥</span>;
  if (kind === "point") return <span className="text-2xl">👉</span>;
  return null;
};

const ProductPageLayout = ({
  title,
  subtitle,
  heroIcon: HeroIcon,
  highlights,
  sections,
  finalQuote,
  seoTitle,
  seoDescription,
}: ProductPageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title={seoTitle ?? `${title} | Poupe Energia`} description={seoDescription ?? subtitle} />
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div className="text-white max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
                {title}
              </h1>
              <p className="text-lg md:text-2xl text-white/90 mb-6 font-medium">
                {subtitle}
              </p>
              {highlights && highlights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {highlights.map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center gap-2 bg-brand-yellow text-brand-blue font-bold px-4 py-2 rounded-full text-sm shadow"
                    >
                      <Check className="h-4 w-4" /> {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-yellow/30 blur-3xl rounded-full" />
                <HeroIcon
                  className="relative h-40 w-40 lg:h-56 lg:w-56 text-brand-yellow"
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 md:py-16 space-y-12 md:space-y-16">
          {sections.map((s, idx) => (
            <section key={idx}>
              <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue mb-6 flex items-center gap-3">
                <SectionIcon kind={s.icon} />
                <span>{s.title}</span>
              </h2>

              {s.body && (
                <div className="text-base md:text-lg text-foreground/80 leading-relaxed mb-6 max-w-4xl">
                  {s.body}
                </div>
              )}

              {s.cards && s.cards.length > 0 && (
                <div
                  className={`grid gap-4 ${
                    s.cardsCols === 3
                      ? "sm:grid-cols-2 lg:grid-cols-3"
                      : "sm:grid-cols-2"
                  }`}
                >
                  {s.cards.map((c, i) => (
                    <Card
                      key={i}
                      className="p-5 border-l-4 border-l-brand-yellow hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-blue text-brand-yellow font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-foreground font-medium leading-snug">{c}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {s.bullets && s.bullets.length > 0 && (
                <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-6">
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-foreground">
                        <Check className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}

          {/* Final quote + CTA */}
          <section className="bg-gradient-to-br from-brand-blue to-brand-blue/90 text-white rounded-2xl p-8 md:p-12 text-center shadow-xl">
            <Flame className="h-10 w-10 text-brand-yellow mx-auto mb-4" />
            <p className="text-xl md:text-2xl font-bold italic max-w-3xl mx-auto mb-8">
              “{finalQuote}”
            </p>
            <Button
              asChild
              size="lg"
              className="bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90 font-bold rounded-xl px-8 shadow-lg"
            >
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                Falar com um especialista <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductPageLayout;
