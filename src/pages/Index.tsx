import { useState } from "react";
import Header from "@/components/Header";
import AdBanner from "@/components/AdBanner";
import SearchSection from "@/components/SearchSection";
import RankingSection from "@/components/RankingSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [selected, setSelected] = useState<{ id: string; nome: string } | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <AdBanner />
        <SearchSection
          onSearch={(id, nome) => setSelected({ id, nome })}
        />
        {selected && (
          <RankingSection
            distribuidoraId={selected.id}
            distribuidoraNome={selected.nome}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
