import { Menu, User } from "lucide-react";

const LOGO_URL = "/logo-dark.png";
const LOGO_WHITE_URL = "/logo-white.png";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const navLinks = [
  { label: "Ranking Pe", href: "/ranking" },
  { label: "Como Calculamos", href: "/como-calculamos" },
  { label: "Sobre", href: "/sobre" },
];

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center" aria-label="Poupe Energia">
          <img
            src={LOGO_URL}
            alt="Poupe Energia"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="text-sm font-bold text-brand-blue hover:opacity-70 transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex">
          <Link
            to="/ativar-cashback"
            className="flex items-center gap-2 border border-brand-blue rounded-lg px-4 py-2 text-sm font-bold text-brand-blue hover:bg-brand-blue/5 transition"
          >
            <User className="h-4 w-4" />
            <div className="text-left leading-tight">
              <div>Entrar</div>
              <div className="text-[10px] font-normal text-brand-blue/70">Ativar Cashback</div>
            </div>
          </Link>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menu"
                className="text-brand-blue hover:bg-brand-blue/10 h-9 w-9"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-brand-blue text-white border-0">
              <SheetHeader>
                <SheetTitle className="text-brand-yellow text-left flex items-center gap-2">
                  <img src={LOGO_WHITE_URL} alt="Poupe Energia" className="h-8 w-auto object-contain" />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
                {navLinks.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <Link
                      to={l.href}
                      className="px-3 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                    >
                      {l.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
