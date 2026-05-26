import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Ranking from "./pages/Ranking.tsx";
import Empresa from "./pages/Empresa.tsx";
import ComoCalculamos from "./pages/ComoCalculamos.tsx";
import Sobre from "./pages/Sobre.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Empresas from "./pages/admin/Empresas";
import Notas from "./pages/admin/Notas";
import Distribuidoras from "./pages/admin/Distribuidoras";

import UsuariosAdmin from "./pages/admin/UsuariosAdmin";
import Parceiros from "./pages/admin/Parceiros";
import LeadsEmpresariais from "./pages/admin/LeadsEmpresariais";
import PoliticaDePrivacidade from "./pages/PoliticaDePrivacidade.tsx";
import TermosDeUso from "./pages/TermosDeUso.tsx";
import TermosCashback from "./pages/TermosCashback.tsx";
import AtivarCashback from "./pages/AtivarCashback.tsx";
import RankingNacional from "./pages/RankingNacional.tsx";
import PoupeFacilEmpresas from "./pages/PoupeFacilEmpresas.tsx";
import EnergiaPorAssinatura from "./pages/EnergiaPorAssinatura.tsx";
import MercadoLivreDeEnergia from "./pages/MercadoLivreDeEnergia.tsx";
import UsinasDeInvestimento from "./pages/UsinasDeInvestimento.tsx";
import Cogeracao from "./pages/Cogeracao.tsx";
import Bess from "./pages/Bess.tsx";
import Eletropostos from "./pages/Eletropostos.tsx";
import DuvidasFrequentes from "./pages/DuvidasFrequentes.tsx";
import Embaixadores from "./pages/admin/Embaixadores";
import CashbackCadastros from "./pages/admin/CashbackCadastros";
import WhatsAppFloat from "./components/WhatsAppFloat";
import EmbCapture from "./components/EmbCapture";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <WhatsAppFloat />
        <EmbCapture />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/ranking-nacional" element={<RankingNacional />} />
          <Route path="/empresa/:slug" element={<Empresa />} />
          <Route path="/como-calculamos" element={<ComoCalculamos />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          <Route path="/termos-cashback" element={<TermosCashback />} />
          <Route path="/ativar-cashback" element={<AtivarCashback />} />
          <Route path="/duvidas-frequentes" element={<DuvidasFrequentes />} />
          <Route path="/poupe-facil-empresas" element={<PoupeFacilEmpresas />} />
          <Route path="/energia-por-assinatura" element={<EnergiaPorAssinatura />} />
          <Route path="/mercado-livre-de-energia" element={<MercadoLivreDeEnergia />} />
          <Route path="/usinas-de-investimento" element={<UsinasDeInvestimento />} />
          <Route path="/cogeracao" element={<Cogeracao />} />
          <Route path="/bess" element={<Bess />} />
          <Route path="/eletropostos" element={<Eletropostos />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="empresas" element={<Empresas />} />
            <Route path="notas" element={<Notas />} />
            <Route path="distribuidoras" element={<Distribuidoras />} />
            
            <Route path="usuarios" element={<UsuariosAdmin />} />
            <Route path="parceiros" element={<Parceiros />} />
            <Route path="leads-empresariais" element={<LeadsEmpresariais />} />
            <Route path="embaixadores" element={<Embaixadores />} />
            <Route path="cashback" element={<CashbackCadastros />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
