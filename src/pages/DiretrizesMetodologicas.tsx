import { Printer } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const DiretrizesMetodologicas = () => {
  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Diretrizes Metodológicas — Ranking Poupe Energia</title><style>
      body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1a1a2e;line-height:1.7}
      h1{font-size:20px;font-weight:800;border-bottom:2px solid #1a1a2e;padding-bottom:8px;margin-bottom:4px}
      .subtitle{font-size:12px;color:#555;margin-bottom:32px}
      h2{font-size:14px;font-weight:800;color:#1a1a2e;margin-top:28px;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
      h3{font-size:13px;font-weight:700;margin-top:16px;margin-bottom:4px}
      p,li{font-size:12px;margin-bottom:6px}
      ul,ol{padding-left:20px}
      .badge{display:inline-block;background:#fbbf24;color:#1a1a2e;font-weight:700;font-size:11px;padding:2px 8px;border-radius:99px;margin-left:6px}
      .nota{background:#f5f5f5;border-left:3px solid #888;padding:8px 12px;font-size:11px;color:#555;margin-top:8px}
      .footer-doc{margin-top:40px;font-size:10px;color:#888;border-top:1px solid #ddd;padding-top:10px}
      @media print{body{margin:20px}}
    </style></head><body>
    <h1>Diretrizes Metodológicas do Ranking Poupe Energia</h1>
    <p class="subtitle">Versão de Orientação Pública para Consumidores, Empresas e Departamentos Jurídicos</p>

    <h2>1. Apresentação e Propósito Institucional</h2>
    <p>A Poupe Energia atua simultaneamente como Plataforma de Comparação Especializada e Marketplace de Soluções Energéticas. Este documento tem como objetivo dar publicidade aos critérios técnicos e às diretrizes que regem o Ranking Poupe Energia, assegurando o direito fundamental do consumidor à escolha consciente e promovendo a transparência no mercado de Geração Distribuída (GD) e Mercado Livre de Energia.</p>
    <p>Nossa metodologia foi estruturada para mitigar a assimetria de informação setorial, organizando dados contratuais e regulatórios em uma métrica de valor compreensível e comparável.</p>

    <h2>2. Isenção Comercial e Governança — A Muralha da China</h2>
    <p>Para garantir a integridade dos resultados e a proteção institucional da marca, o Ranking Poupe Energia adota um protocolo rígido de governança:</p>
    <ul>
      <li><strong>Segregação de Funções:</strong> Existe uma rígida segregação operacional e ética (Muralha da China) entre o braço comercial (marketplace) e o braço de inteligência (ranking).</li>
      <li><strong>Independência de Notas:</strong> Eventuais parcerias comerciais, acordos de corretagem ou sucesso na conversão de leads não exercem qualquer influência, direta ou indireta, sobre a pontuação das empresas. A diretriz institucional é clara: "Não comercializamos posições no ranking".</li>
      <li><strong>Tratamento de Dados de Terceiros:</strong> A Poupe Energia não altera, manipula ou interfere em dados gerados por plataformas externas, limitando-se à sua organização estatística e interpretação metodológica.</li>
    </ul>

    <h2>3. Arquitetura Multicritério do Ranking</h2>
    <p>O ordenamento das empresas é resultado de uma avaliação técnica baseada em quatro grandes pilares estruturais:</p>

    <h3>A. Valor Exato dos Descontos (DS) <span class="badge">Peso: 40%</span></h3>
    <ul>
      <li><strong>Foco no Desconto Contratual:</strong> Considera-se apenas o percentual mínimo formalmente garantido na minuta de adesão, desconsiderando estimativas ou termos flutuantes (como "descontos de até X%").</li>
      <li><strong>Descontos por Faixa de Consumo (Simulador):</strong> Algumas empresas adotam percentuais variáveis por faixas de consumo. A plataforma disponibiliza o Simulador de Economia para que o usuário compreenda o desconto aplicável à sua faixa antes da adesão.</li>
      <li><strong>Referência Estática:</strong> O cálculo utiliza obrigatoriamente a Bandeira Verde como base, isolando variações sazonais de escassez hídrica.</li>
    </ul>

    <h3>B. Segurança Jurídica (SJ) <span class="badge">Peso: 30%</span></h3>
    <p>Analisa o equilíbrio das condições contratuais e a conformidade regulatória perante a Lei nº 14.300/2022 e o Código de Defesa do Consumidor. Scorecard com 10 eixos:</p>
    <ol>
      <li>Conformidade Lei 14.300/22</li>
      <li>Direito aos Créditos (Rescisão)</li>
      <li>Equilíbrio Contratual (CDC — Art. 51)</li>
      <li>Boa-fé Objetiva (Cód. Civil — Art. 422)</li>
      <li>Razoabilidade de Multa por Rescisão</li>
      <li>Aviso Prévio Operacional</li>
      <li>Conformidade LGPD</li>
      <li>Clareza sobre Base de Incidência do Desconto</li>
      <li>Responsabilidade Civil por Falhas Operacionais</li>
      <li>Foro do Consumidor (CDC — Art. 101, I)</li>
    </ol>
    <div class="nota">Nota de Isenção: A classificação de Segurança Jurídica possui caráter indicativo e comparativo, baseado em critérios estatísticos de amostragem documental, não constituindo parecer jurídico, consultoria legal formal ou garantia de ausência total de riscos.</div>

    <h3>C. Reputação e Pós-Venda (RA) <span class="badge">Peso: 20%</span></h3>
    <ul>
      <li><strong>Histórico Consolidado:</strong> O ranking utiliza exclusivamente a Nota Geral (histórico completo) disponível nas plataformas de defesa do consumidor, desconsiderando recortes temporais de 6 ou 12 meses.</li>
      <li><strong>Independência Institucional:</strong> A Poupe Energia não possui qualquer vínculo societário ou operacional com plataformas externas de reclamações.</li>
      <li><strong>Cláusula de Equidade e Transição:</strong> É adotada nota neutra provisória de 6,0 para empresas com menos de 6 meses de operação, perfis não verificados, ou volume inferior a 10 reclamações registradas.</li>
    </ul>

    <h3>D. Valor Mínimo da Fatura (VM) <span class="badge">Peso: 10%</span></h3>
    <p>Mede o grau de acessibilidade e democratização do serviço. Pontua de forma mais favorável as empresas que reduzem as barreiras financeiras de entrada, alinhando o índice às práticas de inclusão social e diretrizes de ESG.</p>

    <h2>4. Protocolo de Contestação e Direito de Resposta</h2>
    <ul>
      <li><strong>Procedimento:</strong> As empresas podem submeter novas minutas contratuais, aditivos homologados ou termos de serviço atualizados através do Canal de Contestação localizado no rodapé da plataforma.</li>
      <li><strong>Análise:</strong> O comitê técnico avaliará o cumprimento documental em ciclos periódicos, emitindo devolutiva técnica fundamentada à empresa solicitante.</li>
    </ul>

    <h2>5. Exclusão de Responsabilidade e Nota Legal</h2>
    <ul>
      <li><strong>Caráter Informativo:</strong> As informações e classificações apresentadas possuem caráter exclusivamente informativo e comparativo, não constituindo recomendação de contratação, garantia de desempenho, economia futura ou ausência de riscos.</li>
      <li><strong>Tempestividade dos Dados:</strong> O ranking reflete as condições comerciais coletadas ou informadas pelas empresas em períodos específicos.</li>
      <li><strong>Segredo Comercial e Registro:</strong> As fórmulas matemáticas internas, pesos decimais específicos e algoritmos automatizados estão protegidos para fins de resguardo de propriedade intelectual e concorrência leal.</li>
      <li><strong>Fé Pública:</strong> A íntegra do Manual Metodológico encontra-se devidamente registrada no Cartório de Registro de Títulos e Documentos.</li>
    </ul>

    <div class="footer-doc">Poupe Energia Intermediação e Plataforma Digital Ltda. — CNPJ 64.498.960/0001-06 — poupeenergia.com.br</div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Diretrizes Metodológicas | Ranking Poupe Energia"
        description="Documento oficial com os critérios técnicos, pilares de avaliação e governança do Ranking Poupe Energia."
      />
      <Header />

      {/* Hero */}
      <section className="bg-brand-blue text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center max-w-4xl">
          <p className="text-brand-yellow text-sm font-bold uppercase tracking-widest mb-3">Documento Oficial</p>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
            Diretrizes Metodológicas do <span className="text-brand-yellow">Ranking Poupe Energia</span>
          </h1>
          <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
            Versão de Orientação Pública para Consumidores, Empresas e Departamentos Jurídicos.
          </p>
          <button
            onClick={handlePrint}
            className="mt-6 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl px-5 py-2.5 text-sm font-semibold transition"
          >
            <Printer className="h-4 w-4" />
            Imprimir / Salvar PDF
          </button>
        </div>
      </section>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-14 max-w-4xl space-y-12">

          {/* Seção 1 */}
          <section>
            <h2 className="text-xs font-extrabold text-brand-blue uppercase tracking-widest mb-1">1. Apresentação</h2>
            <h3 className="text-xl font-extrabold text-foreground mb-4">Propósito Institucional</h3>
            <div className="text-foreground/75 leading-relaxed space-y-3">
              <p>A Poupe Energia atua simultaneamente como Plataforma de Comparação Especializada e Marketplace de Soluções Energéticas. Este documento tem como objetivo dar publicidade aos critérios técnicos e às diretrizes que regem o Ranking Poupe Energia, assegurando o direito fundamental do consumidor à escolha consciente e promovendo a transparência no mercado de Geração Distribuída (GD) e Mercado Livre de Energia.</p>
              <p>Nossa metodologia foi estruturada para mitigar a assimetria de informação setorial, organizando dados contratuais e regulatórios em uma métrica de valor compreensível e comparável.</p>
            </div>
          </section>

          <hr className="border-border" />

          {/* Seção 2 */}
          <section>
            <h2 className="text-xs font-extrabold text-brand-blue uppercase tracking-widest mb-1">2. Governança</h2>
            <h3 className="text-xl font-extrabold text-foreground mb-4">Isenção Comercial — A Muralha da China</h3>
            <p className="text-foreground/75 leading-relaxed mb-4">Para garantir a integridade dos resultados e a proteção institucional da marca, o Ranking Poupe Energia adota um protocolo rígido de governança:</p>
            <div className="space-y-3">
              {[
                { title: "Segregação de Funções", desc: "Existe uma rígida segregação operacional e ética (Muralha da China) entre o braço comercial (marketplace) e o braço de inteligência (ranking)." },
                { title: "Independência de Notas", desc: "Eventuais parcerias comerciais, acordos de corretagem ou sucesso na conversão de leads não exercem qualquer influência, direta ou indireta, sobre a pontuação das empresas. A diretriz institucional é clara: \"Não comercializamos posições no ranking\"." },
                { title: "Tratamento de Dados de Terceiros", desc: "A Poupe Energia não altera, manipula ou interfere em dados gerados por plataformas externas, limitando-se à sua organização estatística e interpretação metodológica." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 bg-white border border-border rounded-xl p-4 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-brand-blue mt-2 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.title}</p>
                    <p className="text-foreground/70 text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-border" />

          {/* Seção 3 */}
          <section>
            <h2 className="text-xs font-extrabold text-brand-blue uppercase tracking-widest mb-1">3. Metodologia</h2>
            <h3 className="text-xl font-extrabold text-foreground mb-4">Arquitetura Multicritério do Ranking</h3>
            <p className="text-foreground/75 leading-relaxed mb-6">O ordenamento das empresas é resultado de uma avaliação técnica baseada em quatro grandes pilares estruturais. Cada pilar possui um peso específico na composição do índice final:</p>

            <div className="space-y-5">
              {/* DS */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Pilar A</span>
                    <h4 className="font-extrabold text-brand-blue text-base">Valor Exato dos Descontos (DS)</h4>
                  </div>
                  <span className="bg-brand-yellow text-brand-blue text-xs font-extrabold px-3 py-1 rounded-full shrink-0 ml-3">Peso: 40%</span>
                </div>
                <p className="text-sm text-foreground/70 mb-3">Mede o benefício financeiro direto entregue ao consumidor:</p>
                <ul className="space-y-2 text-sm text-foreground/75">
                  <li><span className="font-semibold text-foreground">Foco no Desconto Contratual:</span> Considera-se apenas o percentual mínimo formalmente garantido na minuta de adesão, desconsiderando estimativas ou termos flutuantes (como "descontos de até X%").</li>
                  <li><span className="font-semibold text-foreground">Descontos por Faixa de Consumo:</span> Para empresas que adotam percentuais variáveis por faixas de consumo, a plataforma disponibiliza o Simulador de Economia, permitindo que o usuário compreenda o desconto aplicável à sua faixa antes da adesão.</li>
                  <li><span className="font-semibold text-foreground">Referência Estática:</span> O cálculo utiliza obrigatoriamente a Bandeira Verde como base, isolando variações sazonais de escassez hídrica para garantir a isonomia.</li>
                </ul>
              </div>

              {/* SJ */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Pilar B</span>
                    <h4 className="font-extrabold text-brand-blue text-base">Segurança Jurídica (SJ)</h4>
                  </div>
                  <span className="bg-brand-yellow text-brand-blue text-xs font-extrabold px-3 py-1 rounded-full shrink-0 ml-3">Peso: 30%</span>
                </div>
                <p className="text-sm text-foreground/70 mb-3">Analisa o equilíbrio das condições contratuais e a conformidade regulatória perante a Lei nº 14.300/2022 e o Código de Defesa do Consumidor. A avaliação baseia-se em uma Matriz de Conformidade Objetiva (Scorecard) com 10 eixos de verificação:</p>
                <ol className="space-y-1 text-sm text-foreground/75 list-decimal list-inside">
                  <li>Conformidade Lei 14.300/22</li>
                  <li>Direito aos Créditos (Rescisão)</li>
                  <li>Equilíbrio Contratual (CDC — Art. 51)</li>
                  <li>Boa-fé Objetiva (Cód. Civil — Art. 422)</li>
                  <li>Razoabilidade de Multa por Rescisão</li>
                  <li>Aviso Prévio Operacional</li>
                  <li>Conformidade LGPD</li>
                  <li>Clareza sobre Base de Incidência do Desconto</li>
                  <li>Responsabilidade Civil por Falhas Operacionais</li>
                  <li>Foro do Consumidor (CDC — Art. 101, I)</li>
                </ol>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">Nota de Isenção:</span> A classificação de Segurança Jurídica possui caráter indicativo e comparativo, baseado em critérios estatísticos de amostragem documental, não constituindo parecer jurídico, consultoria legal formal ou garantia de ausência total de riscos.
                </div>
              </div>

              {/* RA */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Pilar C</span>
                    <h4 className="font-extrabold text-brand-blue text-base">Reputação e Pós-Venda (RA)</h4>
                  </div>
                  <span className="bg-brand-yellow text-brand-blue text-xs font-extrabold px-3 py-1 rounded-full shrink-0 ml-3">Peso: 20%</span>
                </div>
                <ul className="space-y-2 text-sm text-foreground/75">
                  <li><span className="font-semibold text-foreground">Histórico Consolidado:</span> O ranking utiliza exclusivamente a Nota Geral (histórico completo) disponível nas plataformas de defesa do consumidor, desconsiderando métricas baseadas em recortes temporais de 6 ou 12 meses.</li>
                  <li><span className="font-semibold text-foreground">Independência Institucional:</span> A Poupe Energia não possui qualquer vínculo societário ou operacional com plataformas externas de reclamações, fazendo uso estrito de dados públicos de interesse social.</li>
                  <li><span className="font-semibold text-foreground">Cláusula de Equidade e Transição:</span> É adotada nota neutra provisória de 6,0 para empresas com menos de 6 meses de operação, perfis não verificados, ou volume inferior a 10 reclamações registradas — baseada no princípio da presunção de boa-fé.</li>
                </ul>
              </div>

              {/* VM */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Pilar D</span>
                    <h4 className="font-extrabold text-brand-blue text-base">Valor Mínimo da Fatura (VM)</h4>
                  </div>
                  <span className="bg-brand-yellow text-brand-blue text-xs font-extrabold px-3 py-1 rounded-full shrink-0 ml-3">Peso: 10%</span>
                </div>
                <p className="text-sm text-foreground/75">Mede o grau de acessibilidade e democratização do serviço. Este pilar pontua de forma mais favorável as empresas que reduzem as barreiras financeiras de entrada (menores faturas mínimas exigidas), alinhando o índice às práticas de inclusão social e diretrizes de ESG.</p>
              </div>
            </div>
          </section>

          <hr className="border-border" />

          {/* Seção 4 */}
          <section>
            <h2 className="text-xs font-extrabold text-brand-blue uppercase tracking-widest mb-1">4. Para Empresas</h2>
            <h3 className="text-xl font-extrabold text-foreground mb-4">Protocolo de Contestação e Direito de Resposta</h3>
            <p className="text-foreground/75 leading-relaxed mb-4">Em estrita observância aos princípios do contraditório e da ampla defesa, a Poupe Energia disponibiliza um canal permanente para que as empresas ranqueadas solicitem a atualização ou revisão de suas notas:</p>
            <div className="space-y-3">
              {[
                { title: "Procedimento", desc: "As empresas podem submeter novas minutas contratuais, aditivos homologados ou termos de serviço atualizados através do Canal de Contestação localizado permanentemente no rodapé da plataforma." },
                { title: "Análise", desc: "O comitê técnico avaliará o cumprimento documental em ciclos periódicos, emitindo uma devolutiva técnica fundamentada à empresa solicitante." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 bg-white border border-border rounded-xl p-4 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-brand-blue mt-2 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.title}</p>
                    <p className="text-foreground/70 text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-border" />

          {/* Seção 5 */}
          <section>
            <h2 className="text-xs font-extrabold text-brand-blue uppercase tracking-widest mb-1">5. Nota Legal</h2>
            <h3 className="text-xl font-extrabold text-foreground mb-4">Exclusão de Responsabilidade</h3>
            <div className="space-y-3">
              {[
                { title: "Caráter Informativo", desc: "As informações e classificações apresentadas possuem caráter exclusivamente informativo e comparativo, não constituindo recomendação de contratação, garantia de desempenho, economia futura ou ausência de riscos." },
                { title: "Tempestividade dos Dados", desc: "O ranking reflete as condições comerciais coletadas ou informadas pelas empresas em períodos específicos. A exatidão do painel está vinculada à tempestividade com que as próprias empresas comunicam suas alterações estruturais, não sendo a Poupe Energia responsável por defasagens decorrentes de omissão dos players avaliados." },
                { title: "Segredo Comercial e Registro", desc: "Para fins de resguardo de propriedade intelectual, concorrência leal e preservação de segredo comercial, as fórmulas matemáticas internas, pesos decimais específicos e algoritmos automatizados de normalização de dados que geram a Nota Final estão protegidos." },
                { title: "Fé Pública", desc: "A íntegra do Manual Metodológico com as regras de cálculo e parametrização sistêmica encontra-se devidamente registrada no Cartório de Registro de Títulos e Documentos, assegurando a anterioridade da metodologia, sua autenticidade pública e sua integridade técnica perante o mercado e autoridades reguladoras." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 bg-white border border-border rounded-xl p-4 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground mt-2 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.title}</p>
                    <p className="text-foreground/70 text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rodapé do documento */}
          <div className="border-t border-border pt-6 text-xs text-muted-foreground text-center">
            Poupe Energia Intermediação e Plataforma Digital Ltda. — CNPJ 64.498.960/0001-06 — poupeenergia.com.br
          </div>
        </div>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-16 text-center">
          <Button
            asChild
            size="lg"
            className="bg-brand-yellow text-brand-blue hover:bg-brand-yellow/90 font-extrabold rounded-xl px-10 h-14 shadow-md text-base"
          >
            <Link to="/">
              Ver o Ranking Agora <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default DiretrizesMetodologicas;
