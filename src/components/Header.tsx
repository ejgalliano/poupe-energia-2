import { Lightbulb, Menu } from "lucide-react";
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
  { label: "Ranking", href: "/ranking" },
  { label: "Como Calculamos", href: "/como-calculamos" },
  { label: "Sobre", href: "/sobre" },
];

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-brand-yellow shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <Lightbulb
            className="h-6 w-6 md:h-7 md:w-7 text-brand-blue"
            fill="hsl(var(--brand-blue))"
          />
          <span className="text-base md:text-xl font-extrabold text-brand-blue tracking-tight">
            POUPE ENERGIA
          </span>
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
          <Button className="bg-brand-blue text-white hover:bg-brand-blue/90 rounded-xl font-semibold shadow-sm px-6">
            Entrar
          </Button>
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            size="sm"
            className="bg-brand-blue text-white hover:bg-brand-blue/90 rounded-lg font-semibold shadow-sm h-9 px-4 text-xs"
          >
            Entrar
          </Button>
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
                  <Lightbulb className="h-5 w-5" fill="hsl(var(--brand-yellow))" />
                  POUPE ENERGIA
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
