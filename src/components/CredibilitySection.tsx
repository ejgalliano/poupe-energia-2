import { MapPin, Users, TrendingUp, Map } from "lucide-react";

const stats = [
  {
    icon: MapPin,
    number: "4.021",
    label: "cidades com presença consolidada",
  },
  {
    icon: Users,
    number: "5 milhões",
    label: "de clientes economizando na conta de luz",
  },
  {
    icon: TrendingUp,
    number: "R$ 7,3 bilhões",
    label: "de economia aos consumidores",
  },
  {
    icon: Map,
    number: "23 estados + DF",
    label: "cobertura em todo território nacional",
  },
];

const CredibilitySection = () => {
  return (
    <section className="bg-[#FFFBEB] py-12">
      <div className="container mx-auto px-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-sm border border-black/5 flex flex-col items-center"
              >
                <div className="mb-3 h-12 w-12 rounded-full bg-[#FFFBEB] flex items-center justify-center">
                  <Icon className="h-6 w-6 text-[#1E3A5F]" />
                </div>
                <div className="text-2xl md:text-4xl font-extrabold text-[#1E3A5F] leading-tight mb-2">
                  {stat.number}
                </div>
                <p className="text-sm text-muted-foreground leading-snug">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selos card */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-black/5 text-center">
          <p className="text-sm md:text-base text-foreground/80 mb-6 leading-relaxed">
            Critérios baseados nas diretrizes da{" "}
            <strong>Agência Nacional de Energia Elétrica</strong>,{" "}
            <strong>Procon</strong> e <strong>Código Civil Brasileiro</strong>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {/* ANEEL */}
            <div className="flex items-center gap-1 font-bold text-[#1E3A5F] text-lg">
              <span className="text-2xl">E</span>
              <span className="text-xl">→</span>
              <span className="tracking-wide">ANEEL</span>
            </div>
            {/* PROCON */}
            <div className="border-2 border-[#1E3A5F] rounded px-3 py-1.5 font-bold text-[#1E3A5F] text-sm tracking-wider">
              PRO<span className="text-primary">CON</span>
            </div>
            {/* Bandeira */}
            <div className="flex items-center gap-2">
              <span className="text-3xl" role="img" aria-label="Brasil">
                🇧🇷
              </span>
              <span className="font-semibold text-[#1E3A5F] text-sm">
                Brasil
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CredibilitySection;
