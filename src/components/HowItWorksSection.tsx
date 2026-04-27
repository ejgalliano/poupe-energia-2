import { ArrowRight, ArrowDown, Shield, Leaf, Zap, CheckCircle2, Star, User, BarChart3, Calculator } from "lucide-react";

const StepNumber = ({ n }: { n: number }) => (
  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-brand-blue text-white font-extrabold flex items-center justify-center shadow-md ring-4 ring-white">
    {n}
  </div>
);

/* ------- Illustrations (inline SVG, semantic-ish) ------- */
const Illu1 = () => (
  <svg viewBox="0 0 160 110" className="w-32 h-24 mx-auto" xmlns="http://www.w3.org/2000/svg">
    {/* notebook */}
    <rect x="20" y="15" width="120" height="75" rx="6" fill="#E5EDF6" stroke="#1E3A5F" strokeWidth="2"/>
    <rect x="28" y="22" width="104" height="61" rx="3" fill="#fff"/>
    {/* base */}
    <rect x="10" y="90" width="140" height="8" rx="3" fill="#1E3A5F"/>
    {/* bars */}
    <rect x="40" y="55" width="10" height="20" fill="#1E3A5F"/>
    <rect x="55" y="45" width="10" height="30" fill="#1E3A5F"/>
    <rect x="70" y="35" width="10" height="40" fill="#1E3A5F"/>
    <rect x="85" y="50" width="10" height="25" fill="#1E3A5F"/>
    {/* bolt */}
    <path d="M115 30 L108 50 L115 50 L110 70 L122 46 L115 46 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1"/>
  </svg>
);

const Illu2 = () => (
  <svg viewBox="0 0 160 120" className="w-32 h-24 mx-auto" xmlns="http://www.w3.org/2000/svg">
    {/* clipboard */}
    <rect x="30" y="15" width="100" height="95" rx="6" fill="#fff" stroke="#1E3A5F" strokeWidth="2"/>
    <rect x="60" y="8" width="40" height="14" rx="3" fill="#1E3A5F"/>
    {/* lines + icons */}
    <circle cx="45" cy="38" r="5" fill="#3B82F6"/>
    <text x="55" y="42" fontSize="9" fill="#1E3A5F" fontWeight="bold">Descontos</text>
    <circle cx="45" cy="58" r="5" fill="#22C55E"/>
    <text x="55" y="62" fontSize="9" fill="#1E3A5F" fontWeight="bold">Segurança</text>
    <circle cx="45" cy="78" r="5" fill="#FACC15"/>
    <text x="55" y="82" fontSize="9" fill="#1E3A5F" fontWeight="bold">Reputação</text>
    <circle cx="45" cy="98" r="5" fill="#3B82F6"/>
    <text x="55" y="102" fontSize="9" fill="#1E3A5F" fontWeight="bold">Acessível</text>
    {/* check badge */}
    <circle cx="125" cy="105" r="11" fill="#22C55E"/>
    <path d="M120 105 L124 109 L131 101" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Illu3 = () => (
  <svg viewBox="0 0 160 120" className="w-32 h-24 mx-auto" xmlns="http://www.w3.org/2000/svg">
    {/* calculator */}
    <rect x="35" y="15" width="90" height="95" rx="8" fill="#1E3A5F"/>
    <rect x="42" y="22" width="76" height="22" rx="3" fill="#E5F8EC"/>
    <text x="80" y="38" fontSize="11" fill="#15803D" fontWeight="bold" textAnchor="middle">R$ 12.345,67</text>
    {/* buttons */}
    {[0,1,2].map(r => [0,1,2].map(c => (
      <rect key={`${r}-${c}`} x={45 + c*22} y={50 + r*18} width="16" height="14" rx="2" fill="#fff"/>
    )))}
    {/* coins */}
    <circle cx="20" cy="95" r="8" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5"/>
    <circle cx="30" cy="105" r="6" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5"/>
    <circle cx="140" cy="100" r="7" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5"/>
  </svg>
);

const Illu4 = () => (
  <svg viewBox="0 0 160 130" className="w-32 h-24 mx-auto" xmlns="http://www.w3.org/2000/svg">
    {/* phone */}
    <rect x="50" y="10" width="60" height="110" rx="10" fill="#1E3A5F"/>
    <rect x="55" y="18" width="50" height="94" rx="4" fill="#22C55E"/>
    {/* check circle */}
    <circle cx="80" cy="55" r="14" fill="#fff"/>
    <path d="M73 55 L78 60 L88 50" stroke="#22C55E" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    {/* texts */}
    <text x="80" y="85" fontSize="6" fill="#fff" fontWeight="bold" textAnchor="middle">Adesão concluída!</text>
    <rect x="62" y="92" width="36" height="12" rx="6" fill="#fff"/>
    <text x="80" y="101" fontSize="6" fill="#15803D" fontWeight="bold" textAnchor="middle">Começar agora</text>
  </svg>
);

interface Step {
  n: number;
  illu: React.ReactNode;
  title: string;
  text: string;
}

const steps: Step[] = [
  { n: 1, illu: <Illu1 />, title: "Veja o ranking", text: "Acesse o ranking atualizado das melhores comercializadoras de energia do mercado." },
  { n: 2, illu: <Illu2 />, title: "Compare as empresas", text: "Analise descontos, Segurança jurídica, Reputação da empresa e Acessibilidade para fazer a escolha certa." },
  { n: 3, illu: <Illu3 />, title: "Simule sua economia", text: "Descubra quanto você pode economizar com o plano ideal para o seu consumo." },
  { n: 4, illu: <Illu4 />, title: "Aderir ao plano", text: "Adesão 100% digital e sem burocracia. Comece a economizar agora!" },
];

const HowItWorksSection = () => {
  return (
    <section className="container mx-auto px-4 py-10 md:py-14">
      <div className="bg-white rounded-2xl shadow-md border border-border/60 py-12 px-6 md:px-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="flex justify-center mb-3">
            <Zap className="h-10 w-10 text-brand-yellow fill-brand-yellow" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
            Encontre a melhor energia
          </h2>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
            e <span className="text-green-600">economize</span> em poucos passos
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            Compare, simule e escolha o plano de energia ideal para sua empresa ou negócio.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-3">
          {steps.map((s, idx) => (
            <div key={s.n} className="flex flex-col md:flex-row items-center gap-6 md:gap-3 md:flex-1">
              <div className="relative bg-white rounded-xl shadow-md border border-border/60 p-6 pt-8 text-center w-full md:flex-1 min-h-[260px] flex flex-col">
                <StepNumber n={s.n} />
                <div className="flex items-center justify-center mb-3 mt-2 h-24">
                  {s.illu}
                </div>
                <h3 className="text-lg font-bold text-brand-blue mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
              {idx < steps.length - 1 && (
                <>
                  <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground/50 shrink-0" />
                  <ArrowDown className="md:hidden h-6 w-6 text-muted-foreground/50 shrink-0" />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer badges */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 mt-10 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 bg-brand-blue text-white rounded-xl px-5 py-4 flex-1">
            <Shield className="h-6 w-6 shrink-0" />
            <span className="text-sm font-medium">
              Processo seguro, transparente e sem custo para você.
            </span>
          </div>
          <div className="flex items-center gap-3 bg-green-50 text-green-700 rounded-xl px-5 py-4 flex-1 border border-green-200">
            <Leaf className="h-6 w-6 shrink-0" />
            <span className="text-sm font-medium">
              Mais economia. Mais eficiência. Mais sustentabilidade.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
