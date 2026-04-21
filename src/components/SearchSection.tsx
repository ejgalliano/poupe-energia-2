import { useMemo, useState } from "react";
import { ArrowRight, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATES, getDistributors } from "@/data/states";

interface Props {
  onSearch: () => void;
}

type Profile = "home" | "business";

const SearchSection = ({ onSearch }: Props) => {
  const [profile, setProfile] = useState<Profile>("home");
  const [state, setState] = useState<string>("");
  const [distributor, setDistributor] = useState<string>("");
  const [accepted, setAccepted] = useState(false);

  const distributors = useMemo(
    () => (state ? getDistributors(state) : []),
    [state],
  );

  const canSubmit = state && distributor && accepted;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSearch();
    setTimeout(() => {
      document
        .getElementById("ranking")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <section className="container mx-auto px-4 py-10 md:py-14">
      <header className="max-w-3xl mx-auto text-center mb-8">
        <h1 className="text-2xl md:text-4xl font-extrabold text-brand-blue leading-tight">
          Compare empresas de energia e descubra quanto você pode economizar na
          sua conta de luz!
        </h1>
      </header>

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-border/60 p-6 md:p-8">
        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => {
              setProfile("home");
              setDistributor("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 pb-3 text-sm md:text-base font-bold transition relative ${
              profile === "home"
                ? "text-brand-blue"
                : "text-muted-foreground hover:text-brand-blue"
            }`}
          >
            <Home className="h-4 w-4" />
            Para minha Casa
            {profile === "home" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => {
              setProfile("business");
              setDistributor("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 pb-3 text-sm md:text-base font-bold transition relative ${
              profile === "business"
                ? "text-brand-blue"
                : "text-muted-foreground hover:text-brand-blue"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Para minha Empresa
            {profile === "business" && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-t-full" />
            )}
          </button>
        </div>

        {/* Dropdowns */}
        <div className="grid md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-bold text-brand-blue mb-2">
              Seu Estado:
            </label>
            <Select
              value={state}
              onValueChange={(v) => {
                setState(v);
                setDistributor("");
              }}
            >
              <SelectTrigger className="rounded-xl h-12 bg-background border-border">
                <SelectValue placeholder="Selecione seu estado" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {STATES.map((s) => (
                  <SelectItem key={s.uf} value={s.uf}>
                    {s.uf} — {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-blue mb-2">
              Sua Distribuidora:
            </label>
            <Select
              value={distributor}
              onValueChange={setDistributor}
              disabled={!state}
            >
              <SelectTrigger className="rounded-xl h-12 bg-background border-border disabled:opacity-60">
                <SelectValue
                  placeholder={
                    state ? "Selecione a distribuidora" : "Escolha um estado primeiro"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {distributors.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <Checkbox
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm text-brand-blue/80 leading-relaxed">
            Concordo com a{" "}
            <a href="#" className="font-semibold text-brand-blue underline">
              Política de Privacidade
            </a>{" "}
            e com o uso dos meus dados.
          </span>
        </label>

        {/* CTA */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full h-12 bg-brand-blue text-white hover:bg-brand-blue/90 rounded-xl font-bold text-base shadow-md disabled:opacity-50"
        >
          Buscar economia <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Botão secundário */}
      <div className="flex justify-center mt-5">
        <Button
          variant="outline"
          className="rounded-xl border-2 border-brand-blue/30 text-brand-blue font-semibold hover:bg-brand-blue/5"
        >
          Comparar Propostas para minha Empresa <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export default SearchSection;
