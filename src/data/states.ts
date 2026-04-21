export interface BrazilianState {
  uf: string;
  name: string;
}

export const STATES: BrazilianState[] = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

// Distribuidoras fictícias por estado (placeholder até integração real)
export const DISTRIBUTORS: Record<string, string[]> = {
  SP: ["Enel SP", "EDP São Paulo", "CPFL Paulista", "Elektro"],
  RJ: ["Light", "Enel RJ"],
  MG: ["Cemig", "Energisa MG"],
  RS: ["RGE", "CEEE Equatorial"],
  PR: ["Copel"],
  SC: ["Celesc"],
  BA: ["Coelba"],
  PE: ["Neoenergia Pernambuco"],
  CE: ["Enel CE"],
  DF: ["Neoenergia Brasília"],
  GO: ["Equatorial Goiás"],
  ES: ["EDP Espírito Santo"],
};

export const getDistributors = (uf: string): string[] =>
  DISTRIBUTORS[uf] ?? ["Distribuidora Local"];
