import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Banner = {
  id: string;
  imagem_url: string;
  link_url: string | null;
  ordem: number;
  ativo: boolean;
};

const AdBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [active, setActive] = useState(0);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from("banners")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true });
    setBanners(data ?? []);
    setActive(0);
  };

  useEffect(() => {
    fetchBanners();
    const channel = supabase
      .channel("banners-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "banners" },
        () => fetchBanners()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setActive((p) => (p + 1) % banners.length);
    }, 4000);
    return () => clearInterval(id);
  }, [banners.length]);

  const prev = () =>
    setActive((p) => (p - 1 + banners.length) % banners.length);
  const next = () => setActive((p) => (p + 1) % banners.length);

  // Fallback default banner
  if (banners.length === 0) {
    return (
      <section className="relative w-full h-[160px] md:h-[280px] overflow-hidden bg-brand-blue">
        <span className="absolute top-3 left-3 z-20 text-[10px] font-semibold uppercase tracking-wider bg-white/80 text-gray-700 px-2 py-1 rounded">
          Publicidade
        </span>
        <div className="h-full w-full flex flex-col items-center justify-center text-center px-6">
          <h3 className="text-xl md:text-3xl font-extrabold text-white mb-2">
            Anuncie aqui
          </h3>
          <a
            href="mailto:contato.poupeenergia@hotmail.com"
            className="text-sm md:text-base text-brand-yellow font-bold hover:underline"
          >
            contato.poupeenergia@hotmail.com
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[160px] md:h-[280px] overflow-hidden bg-brand-blue">
      {banners.map((b, i) => {
        const img = (
          <img
            src={b.imagem_url}
            alt="Banner publicitário"
            className="h-full w-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        );
        return (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === active ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            aria-hidden={i !== active}
          >
            {b.link_url ? (
              <a
                href={b.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full w-full"
              >
                {img}
              </a>
            ) : (
              img
            )}
          </div>
        );
      })}

      <span className="absolute top-3 left-3 z-20 text-[10px] font-semibold uppercase tracking-wider bg-white/80 text-gray-700 px-2 py-1 rounded">
        Publicidade
      </span>

      {banners.length > 1 && (
        <>
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
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Ir para slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === active
                    ? "w-6 bg-brand-yellow"
                    : "w-2 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default AdBanner;
