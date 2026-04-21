import Header from "@/components/Header";
import Hero from "@/components/Hero";
import RankingSection from "@/components/RankingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <RankingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
