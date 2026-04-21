import { Lightbulb, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navItems = [
  "Categorias",
  "Energia por Assinatura - Baixa Tensão",
  "Mercado Livre - Alta Tensão",
  "Ranking por distribuidora",
  "Ranking de Energia",
];

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-brand-yellow shadow-md">
      {/* Linha 1 */}
      <div className="container mx-auto flex items-center gap-4 px-4 py-3">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <Lightbulb className="h-7 w-7 text-brand-blue" fill="hsl(var(--brand-blue))" />
          <span className="text-lg md:text-xl font-extrabold text-brand-blue tracking-tight">
            POUPE ENERGIA
          </span>
        </a>

        {/* Busca */}
        <div className="relative flex-1 max-w-2xl mx-auto hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquise no Poupe Energia"
            className="pl-9 bg-white border-0 rounded-xl h-10 focus-visible:ring-2 focus-visible:ring-brand-blue"
          />
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          <button className="hidden sm:flex items-center gap-1 text-brand-blue font-semibold hover:opacity-80 transition">
            <Bell className="h-5 w-5" />
            <span className="hidden lg:inline text-sm">Alertas</span>
          </button>
          <Button
            variant="ghost"
            className="text-brand-blue font-semibold hover:bg-white/30 rounded-xl"
          >
            Entrar
          </Button>
          <Button className="bg-brand-blue text-white hover:bg-brand-blue/90 rounded-xl font-semibold shadow-sm">
            Ativar Cashback
          </Button>
        </div>
      </div>

      {/* Linha 2 - Navegação */}
      <nav className="border-t border-brand-blue/10">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1 md:gap-2 overflow-x-auto py-2 scrollbar-hide">
            {navItems.map((item, idx) => (
              <li key={item} className="flex items-center gap-1 md:gap-2 shrink-0">
                <a
                  href="#"
                  className="px-2 md:px-3 py-1.5 text-xs md:text-sm font-bold text-brand-blue hover:bg-white/30 rounded-lg transition whitespace-nowrap"
                >
                  {item}
                </a>
                {idx < navItems.length - 1 && (
                  <span className="text-brand-blue/40">|</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
