import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              É hora de economizar na{" "}
              <span className="text-brand-yellow">CashBack</span>
            </h1>
            <p className="text-lg md:text-2xl text-white/90 mb-8 font-medium">
              Poupe energia com 10%
            </p>
            <div className="flex flex-wrap gap-3">
              {["Comparar", "Economizar", "Aderir"].map((label) => (
                <Button
                  key={label}
                  size="lg"
                  className="bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90 font-bold rounded-xl px-8 shadow-lg"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-yellow/30 blur-3xl rounded-full" />
              <Lightbulb
                className="relative h-48 w-48 lg:h-64 lg:w-64 text-brand-yellow"
                fill="hsl(var(--brand-yellow))"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
