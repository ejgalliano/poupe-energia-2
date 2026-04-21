import { Facebook, Instagram, Linkedin, Youtube, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

const col1 = [
  { label: "Energia por Assinatura", href: "#" },
  { label: "Mercado Livre", href: "#" },
  { label: "Rankings de Energia", href: "/ranking" },
  { label: "Cashback e Benefícios", href: "#" },
  { label: "Dúvidas Frequentes", href: "#" },
];

const col2 = [
  { label: "Sobre o Poupe Energia", href: "#" },
  { label: "Como Calculamos os Rankings", href: "/como-calculamos" },
  { label: "Política de Privacidade", href: "#" },
  { label: "Termos de Uso", href: "#" },
  { label: "Fale Conosco", href: "#" },
];

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-3 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-6 w-6 text-brand-yellow" fill="hsl(var(--brand-yellow))" />
              <span className="text-lg font-extrabold">POUPE ENERGIA</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-5 max-w-xs">
              Comparou? Economizou. Aderiu? Ganhou 10% de cashback. Isso é
              Poupe Energia.
            </p>
            <div className="flex gap-3">
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
              {col2.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-white/80 hover:text-brand-yellow text-sm transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center text-xs text-white/60">
          <p>CNPJ: 64.498.960/0001-06</p>
          <a href="mailto:contato.poupeenergia@hotmail.com" className="hover:text-brand-yellow">
            contato.poupeenergia@hotmail.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
