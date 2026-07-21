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
    <section className="bg-background py-12">
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
                <div className="mb-3 h-12 w-12 rounded-full bg-brand-blue/10 flex items-center justify-center">
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
            <strong>Código Civil Brasileiro</strong> e <strong>Procon</strong>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {/* ANEEL */}
            <img
              src="/aneel.jpeg"
              alt="ANEEL – Agência Nacional de Energia Elétrica"
              className="h-14 w-auto object-contain"
            />
            {/* Brasão oficial do Brasil */}
            <img
              src="/brasao-brasil.svg"
              alt="Brasão da República Federativa do Brasil"
              className="h-16 w-auto object-contain"
            />
            {/* PROCON */}
            <img
              src="/procon.jpeg"
              alt="Procon"
              className="h-16 w-auto object-contain"
            />
            {/* Selo Reclame Aqui */}
            <a
              href="https://www.reclameaqui.com.br/empresa/poupe-energia/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-16 flex items-center gap-2"
              title="Selo RA Verificada"
            >
              <img
                src="https://s3.amazonaws.com/raichu-beta/ra-verified/assets/images/verified.svg"
                alt="Selo RA Verificada"
                className="h-8 w-8"
              />
              <img
                src="https://s3.amazonaws.com/raichu-beta/ra-verified/assets/images/ra-logo.svg"
                alt="Reclame Aqui"
                className="h-5 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CredibilitySection;
