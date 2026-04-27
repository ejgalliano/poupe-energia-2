import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CredibilitySection from "@/components/CredibilitySection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Poupe Energia — Compare comercializadoras de energia e economize na conta de luz"
        description="O primeiro comparador independente de comercializadoras de energia do Brasil. Ranking transparente, cashback de 10% e economia real."
      />
      <Header />
      <main className="flex-1">
        <SearchSection />
        <HowItWorksSection />
        <CredibilitySection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
