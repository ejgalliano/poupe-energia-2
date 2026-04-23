import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Mail, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  pageName: string;
  lastUpdate?: string;
  seoDescription: string;
  children: React.ReactNode;
}

const LegalPageLayout = ({ title, pageName, lastUpdate, seoDescription, children }: Props) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO title={`${title} | Poupe Energia`} description={seoDescription} />
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-brand-blue font-semibold">
              Início
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-brand-blue font-semibold">{pageName}</span>
          </nav>

          {/* Title */}
          <header className="mb-8 border-b-2 border-brand-blue/20 pb-5">
            <h1 className="text-2xl md:text-4xl font-extrabold text-brand-blue leading-tight">
              {title}
            </h1>
            {lastUpdate && (
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Última atualização:</strong> {lastUpdate}
              </p>
            )}
          </header>

          {/* Content */}
          <article className="legal-content text-brand-blue space-y-8">
            {children}
          </article>

          {/* Contact card */}
          <div className="mt-12 bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-6">
            <h3 className="text-lg font-extrabold text-brand-blue mb-3">Contato</h3>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:contato.poupeenergia@hotmail.com"
                className="flex items-start gap-2 text-brand-blue hover:underline"
              >
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="font-semibold">contato.poupeenergia@hotmail.com</span>
              </a>
              <div className="flex items-start gap-2 text-brand-blue">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Av. Paraná, 427 Sala 201 Ed. Metrópole – Londrina/PR</span>
              </div>
            </div>
          </div>

          {/* Back to start */}
          <div className="mt-10 text-center">
            <Button
              asChild
              size="lg"
              className="bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90 font-extrabold rounded-xl px-8 h-12 shadow-md"
            >
              <Link to="/">
                Voltar ao início <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

interface SectionProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

export const LegalSection = ({ number, title, children }: SectionProps) => (
  <section>
    <h2 className="text-xl md:text-2xl font-extrabold text-brand-blue border-b border-brand-blue/20 pb-2 mb-4">
      {number}. {title}
    </h2>
    <div className="space-y-3 text-[15px] leading-relaxed text-brand-blue/90">
      {children}
    </div>
  </section>
);

export const LegalSubtitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-bold text-brand-blue mt-4 mb-1">{children}</h3>
);

export const LegalList = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc pl-6 space-y-2 marker:text-brand-blue">{children}</ul>
);

export default LegalPageLayout;
