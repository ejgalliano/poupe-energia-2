import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "Energia 100% Renovável com até 20% de desconto",
    subtitle: "Parceiro oficial • Solar Brasil",
    gradient: "from-brand-blue to-brand-blue-medium",
  },
  {
    title: "Migre para o Mercado Livre e economize todo mês",
    subtitle: "Patrocinado • Ambar Energia",
    gradient: "from-brand-blue-medium to-brand-blue",
  },
  {
    title: "Cashback exclusivo na adesão — Ganhe 10% de volta",
    subtitle: "Promoção • Pret Energy",
    gradient: "from-brand-blue to-brand-blue-medium",
  },
];

const AdBanner = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((p) => (p + 1) % slides.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const prev = () => setActive((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setActive((p) => (p + 1) % slides.length);

  return (
    <section className="relative w-full h-[160px] md:h-[280px] overflow-hidden">
      <span className="absolute top-3 left-3 z-20 text-[10px] font-semibold uppercase tracking-wider bg-black/40 text-white px-2 py-1 rounded">
        Publicidade
      </span>

      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-gradient-to-r ${s.gradient} flex flex-col items-center justify-center text-center px-6 transition-opacity duration-700 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== active}
        >
          <p className="text-xs md:text-sm text-brand-yellow font-semibold mb-2 uppercase tracking-wider">
            {s.subtitle}
          </p>
          <h3 className="text-lg md:text-3xl font-extrabold text-white max-w-3xl leading-tight">
            {s.title}
          </h3>
        </div>
      ))}

      <button
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 md:h-10 md:w-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Próximo slide"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 md:h-10 md:w-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Ir para slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-6 bg-brand-yellow" : "w-2 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default AdBanner;
