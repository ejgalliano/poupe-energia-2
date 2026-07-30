import LegalPageLayout, { LegalSection, LegalList } from "@/components/LegalPageLayout";

const TermosDeUso = () => {
  return (
    <LegalPageLayout
      title="Termos de Uso – Plataforma Poupe Energia"
      pageName="Termos de Uso"
      lastUpdate="10 de maio de 2026"
      seoDescription="Termos de Uso da plataforma Poupe Energia. Conheça as regras de uso, propriedade intelectual e limites de responsabilidade do comparador independente de energia."
    >
      <p>
        Estes Termos de Uso regulam o acesso e a utilização da plataforma{" "}
        <strong>Poupe Energia</strong>. Ao navegar, cadastrar-se, preencher formulários ou
        utilizar qualquer funcionalidade do site, o usuário declara concordar integralmente
        com as condições aqui descritas.
      </p>

      <LegalSection number={1} title="Objeto">
        <p>
          A Poupe Energia é uma <strong>plataforma independente de comparação</strong> de
          fornecedoras de energia elétrica, com foco em geração distribuída e mercado
          livre. A plataforma fornece informações, rankings e ferramentas para auxiliar o
          usuário na escolha da melhor opção, intermediando o contato com empresas parceiras.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Aceitação dos Termos">
        <p>
          O uso da plataforma implica a <strong>aceitação automática e integral</strong>
          destes Termos de Uso, da Política de Privacidade e das demais políticas vinculadas.
          Caso o usuário não concorde com qualquer disposição, deverá interromper o uso
          imediatamente.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Metodologia de Ranqueamento (Propriedade Exclusiva)">
        <p>
          A metodologia de ranqueamento utilizada pela Poupe Energia, incluindo seus
          critérios, pesos, fórmulas, scorecards de segurança jurídica e algoritmos de
          cálculo, é <strong>propriedade intelectual exclusiva</strong> da Poupe Energia.
        </p>
        <LegalList>
          <li>É vedada qualquer reprodução, cópia, engenharia reversa ou uso comercial sem autorização prévia e expressa por escrito;</li>
          <li>Os rankings refletem análise técnica baseada em dados públicos e em critérios próprios da Poupe Energia, com caráter informativo;</li>
          <li>A Poupe Energia pode alterar a metodologia a qualquer tempo, visando melhoria contínua e adequação ao mercado.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number={4} title="Uso Permitido">
        <p>O usuário poderá utilizar a plataforma para:</p>
        <LegalList>
          <li>Consultar rankings e fichas técnicas das fornecedoras;</li>
          <li>Comparar propostas residenciais e empresariais;</li>
          <li>Solicitar contato com empresas parceiras;</li>
          <li>Acessar conteúdos institucionais e educativos sobre o mercado de energia.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number={5} title="Restrições de Uso">
        <p>É expressamente proibido:</p>
        <LegalList>
          <li>Utilizar a plataforma para fins ilícitos, fraudulentos ou contrários à boa-fé;</li>
          <li>Reproduzir, copiar, modificar ou distribuir conteúdos sem autorização;</li>
          <li>Tentar acessar áreas restritas, sistemas internos, banco de dados ou metodologia;</li>
          <li>Utilizar robôs, scrapers ou ferramentas automatizadas de extração de dados;</li>
          <li>Inserir dados falsos, de terceiros sem autorização ou de qualquer forma enganosos.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number={6} title="Propriedade Intelectual">
        <p>
          Todos os conteúdos, marcas, logotipos, layouts, textos, imagens, bases de dados,
          rankings e a metodologia da Poupe Energia são <strong>protegidos por direitos
          autorais e de propriedade industrial</strong>, sendo de titularidade exclusiva da
          Poupe Energia ou de seus licenciadores. Qualquer uso não autorizado sujeitará o
          infrator às sanções civis e criminais aplicáveis.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Intermediação de Propostas">
        <p>
          A Poupe Energia atua exclusivamente como <strong>intermediadora</strong> entre o
          usuário e as fornecedoras parceiras, não sendo parte na relação contratual
          estabelecida entre eles. A contratação, faturamento, fornecimento de energia,
          atendimento, cancelamento e quaisquer obrigações decorrentes são de responsabilidade
          exclusiva da fornecedora escolhida.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Limitação de Responsabilidade">
        <p>A Poupe Energia não se responsabiliza por:</p>
        <LegalList>
          <li>Atos, omissões ou descumprimento contratual praticados pelas fornecedoras parceiras;</li>
          <li>Variações nos descontos, tarifas ou condições oferecidas pelas empresas após o contato inicial;</li>
          <li>Indisponibilidades temporárias da plataforma decorrentes de manutenção, falhas de terceiros ou caso fortuito/força maior;</li>
          <li>Dados informados incorretamente pelo próprio usuário.</li>
        </LegalList>
        <p>
          As informações apresentadas têm caráter <strong>informativo e comparativo</strong>,
          não constituindo aconselhamento jurídico, financeiro ou energético individualizado.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Modificações">
        <p>
          A Poupe Energia poderá <strong>alterar estes Termos a qualquer momento</strong>,
          publicando a versão atualizada nesta página. O uso continuado da plataforma após a
          publicação implica aceitação das novas condições.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Legislação Aplicável">
        <p>
          Estes Termos são regidos pelas <strong>leis brasileiras</strong>, em especial pelo
          Código de Defesa do Consumidor (Lei nº 8.078/1990), pelo Marco Civil da Internet
          (Lei nº 12.965/2014) e pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
        </p>
        <p>
          Fica eleito o <strong>foro da Comarca de Londrina/PR</strong> para dirimir
          eventuais controvérsias, ressalvada a faculdade do consumidor de optar pelo foro
          de seu domicílio.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Contato">
        <p>
          Dúvidas, solicitações ou notificações relativas a estes Termos devem ser
          encaminhadas para <strong>contato.poupeenergia@hotmail.com</strong>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default TermosDeUso;
