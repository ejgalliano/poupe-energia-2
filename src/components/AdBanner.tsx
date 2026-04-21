import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  promo: string;
  discount: string;
  partner: string;
  initial: string;
  logoColor: string;
  gradient: string;
};

const slides: Slide[] = [
  {
    promo: "Ganhe 10% de cashback na primeira adesão",
    discount: "15% OFF",
    partner: "Pret Energy",
    initial: "P",
    logoColor: "bg-blue-500",
    gradient: "from-blue-900 to-blue-600",
  },
  {
    promo: "Energia 100% renovável com economia garantida",
    discount: "12% OFF",
    partner: "Ambar Energia",
    initial: "A",
    logoColor: "bg-green-500",
    gradient: "from-green-900 to-green-600",
  },
  {
    promo: "Migre para o Mercado Livre e economize todo mês",
    discount: "20% OFF",
    partner: "Balt Energia",
    initial: "B",
    logoColor: "bg-purple-500",
    gradient: "from-purple-900 to-purple-600",
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
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-gradient-to-r ${s.gradient} transition-opacity duration-700 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== active}
        >
          {/* Publicidade tag */}
          <span className="absolute top-3 left-3 z-20 text-[10px] font-semibold uppercase tracking-wider bg-white/80 text-gray-700 px-2 py-1 rounded">
            Publicidade
          </span>

          {/* Content row */}
          <div className="h-full w-full flex items-center justify-between px-6 md:px-16 gap-4 md:gap-8">
            {/* Partner logo */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={`${s.logoColor} h-12 w-12 md:h-20 md:w-20 rounded-full flex items-center justify-center text-white font-extrabold text-xl md:text-3xl shadow-lg ring-2 ring-white/30`}
              >
                {s.initial}
              </div>
              <span className="text-[10px] md:text-xs text-white/90 font-medium hidden md:block">
                {s.partner}
              </span>
            </div>

            {/* Promo text */}
            <h3 className="flex-1 text-center text-base md:text-3xl font-extrabold text-white leading-tight max-w-2xl">
              {s.promo}
            </h3>

            {/* Discount badge */}
            <div className="shrink-0 bg-brand-yellow text-brand-blue rounded-xl px-3 py-2 md:px-6 md:py-4 shadow-lg rotate-[-4deg]">
              <span className="block text-lg md:text-3xl font-extrabold leading-none">
                {s.discount}
              </span>
            </div>
          </div>
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
