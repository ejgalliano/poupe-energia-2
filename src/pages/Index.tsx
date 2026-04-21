import { useState } from "react";
import Header from "@/components/Header";
import AdBanner from "@/components/AdBanner";
import SearchSection from "@/components/SearchSection";
import RankingSection from "@/components/RankingSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [showRanking, setShowRanking] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <AdBanner />
        <SearchSection onSearch={() => setShowRanking(true)} />
        {showRanking && <RankingSection />}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
