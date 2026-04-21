import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Ranking from "./pages/Ranking.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Empresas from "./pages/admin/Empresas";
import Notas from "./pages/admin/Notas";
import Distribuidoras from "./pages/admin/Distribuidoras";
import Banners from "./pages/admin/Banners";
import UsuariosAdmin from "./pages/admin/UsuariosAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="empresas" element={<Empresas />} />
            <Route path="notas" element={<Notas />} />
            <Route path="distribuidoras" element={<Distribuidoras />} />
            <Route path="banners" element={<Banners />} />
            <Route path="usuarios" element={<UsuariosAdmin />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
