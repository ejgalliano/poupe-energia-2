import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-brand-yellow shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-2">
          <Lightbulb className="h-7 w-7 text-brand-blue" fill="hsl(var(--brand-blue))" />
          <span className="text-lg md:text-xl font-extrabold text-brand-blue tracking-tight">
            POUPE ENERGIA
          </span>
        </a>

        <Button className="bg-brand-blue text-white hover:bg-brand-blue/90 rounded-xl font-semibold shadow-sm px-6">
          Entrar
        </Button>
      </div>
    </header>
  );
};

export default Header;
