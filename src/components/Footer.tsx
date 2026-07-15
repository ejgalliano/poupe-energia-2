import { useEffect } from "react";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const col1 = [
  { label: "GD Livre - Empresas", href: "/gd-livre-empresas" },
  { label: "Energia por Assinatura", href: "/energia-por-assinatura" },
  { label: "Mercado Livre de Energia", href: "/mercado-livre-de-energia" },
  { label: "Usinas de Investimento", href: "/usinas-de-investimento" },
  { label: "Cogeração", href: "/cogeracao" },
  { label: "Bess – Armazenamento de energia em Baterias", href: "/bess" },
  { label: "Eletropostos – Carregadores de carros Elétricos", href: "/eletropostos" },
  { label: "Placas Solares – Venda e Instalação", href: "/placas-solares" },
];

const col2 = [
  { label: "Sobre a Poupe Energia", href: "/sobre" },
  { label: "Como Calculamos os Rankings", href: "/como-calculamos" },
  { label: "Dúvidas Frequentes", href: "/duvidas-frequentes" },
  { label: "Política de Privacidade", href: "/politica-de-privacidade" },
  { label: "Termos de Uso", href: "/termos-de-uso" },
  { label: "Cashback – Termos e Condições", href: "/termos-cashback" },
  { label: "Contestação e Revisão Técnica", href: "/contestacao" },
  { label: "Diretrizes Metodológicas", href: "/diretrizes-metodologicas" },
  { label: "Seja um Embaixador", href: "/seja-um-embaixador" },
];

const Footer = () => {
  useEffect(() => {
    const container = document.getElementById("ra-verified-seal");
    if (!container || container.querySelector("script")) return;
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "ra-embed-verified-seal";
    script.src = "https://s3.amazonaws.com/raichu-beta/ra-verified/bundle.js";
    script.dataset.id = "TTE0V3ZHTXNHOTZxS3FRZTpwb3VwZS1lbmVyZ2lh";
    script.dataset.target = "ra-verified-seal";
    script.dataset.model = "horizontal_1";
    container.appendChild(script);
  }, []);

  return (
    <footer className="bg-brand-blue text-white">
      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-3 mb-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <img
                src="/logo-white.png"
                alt="Poupe Energia"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-5 max-w-xs">
              Comparou? Economizou. Aderiu? Ganhou Cashback. Isso é
              Poupe Energia.
            </p>
            <div className="flex gap-3 mb-5">
              {[Facebook, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand-yellow hover:text-brand-blue transition"
                  aria-label="Rede social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            {/* Selo Reclame Aqui */}
            <div id="ra-verified-seal" />
          </div>

          {/* Col 1 */}
          <div>
            <h4 className="font-bold mb-4 text-brand-yellow">Produtos</h4>
            <ul className="space-y-2.5">
              {col1.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-white/80 hover:text-brand-yellow text-sm transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold mb-4 text-brand-yellow">Institucional</h4>
            <ul className="space-y-2.5">
              {col2.map((l) =>
                "external" in l && l.external ? (
                  <li key={l.label}>
                    <a href={l.href} className="text-white/80 hover:text-brand-yellow text-sm transition">
                      {l.label}
                    </a>
                  </li>
                ) : (
                  <li key={l.label}>
                    <Link to={l.href} className="text-white/80 hover:text-brand-yellow text-sm transition">
                      {l.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-xs text-white/60 space-y-1">
          <p>Poupe Energia Intermediação e Plataforma Digital Ltda.</p>
          <p>CNPJ 64.498.960/0001-06</p>
          <p>© 2026 Poupe Energia. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
