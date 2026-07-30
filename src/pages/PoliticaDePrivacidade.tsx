import LegalPageLayout, { LegalSection, LegalSubtitle, LegalList } from "@/components/LegalPageLayout";

const PoliticaDePrivacidade = () => {
  return (
    <LegalPageLayout
      title="Política de Privacidade – Poupe Energia"
      pageName="Política de Privacidade"
      lastUpdate="10 de maio de 2026"
      seoDescription="Política de Privacidade da Poupe Energia. Saiba como coletamos, utilizamos, armazenamos e protegemos seus dados pessoais conforme a LGPD."
    >
      <p>
        A <strong>Poupe Energia</strong> respeita a privacidade de seus usuários e está
        comprometida com a proteção dos dados pessoais coletados em sua plataforma. Esta
        Política de Privacidade descreve como tratamos as informações dos usuários, em
        conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD)</strong>.
      </p>

      <LegalSection number={1} title="Quem Somos">
        <p>
          A <strong>Poupe Energia</strong> é uma plataforma digital que organiza e
          compara fornecedoras de energia elétrica do mercado livre e da geração
          distribuída no Brasil, com foco em transparência, economia e segurança jurídica.
        </p>
        <p>
          <strong>CNPJ:</strong> 64.498.960/0001-06<br />
          <strong>Endereço:</strong> Av. Paraná, 427 Sala 201 Ed. Metrópole – Londrina/PR<br />
          <strong>E-mail de contato:</strong> contato.poupeenergia@hotmail.com
        </p>
      </LegalSection>

      <LegalSection number={2} title="Quais Dados Coletamos">
        <p>Coletamos diferentes tipos de dados, sempre com finalidade específica e legítima:</p>

        <LegalSubtitle>a) Dados fornecidos pelo usuário</LegalSubtitle>
        <LegalList>
          <li>Nome completo</li>
          <li>E-mail</li>
          <li>Telefone / WhatsApp</li>
          <li>Estado e distribuidora local</li>
          <li>Dados da conta de luz (CNPJ, razão social, valor da fatura, consumo mensal, distribuidora)</li>
          <li>Arquivos enviados (faturas em PDF/imagem) — apenas em formulários empresariais</li>
        </LegalList>

        <LegalSubtitle>b) Dados coletados automaticamente</LegalSubtitle>
        <LegalList>
          <li>Endereço IP (armazenado de forma anonimizada/hash)</li>
          <li>Tipo de dispositivo e navegador</li>
          <li>Páginas acessadas e tempo de navegação</li>
          <li>Cookies e identificadores de sessão</li>
        </LegalList>
      </LegalSection>

      <LegalSection number={3} title="Como Utilizamos os Dados">
        <p>Os dados coletados são utilizados para:</p>
        <LegalList>
          <li>Permitir a comparação personalizada entre fornecedoras de energia;</li>
          <li>Encaminhar o usuário às empresas parceiras escolhidas;</li>
          <li>Realizar contato comercial e suporte sobre a adesão;</li>
          <li>Cumprir obrigações legais e regulatórias;</li>
          <li>Melhorar a experiência de navegação e aprimorar nossos serviços;</li>
          <li>Realizar análises estatísticas e de auditoria interna.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number={4} title="Compartilhamento de Dados">
        <p>A Poupe Energia <strong>não vende</strong> dados pessoais. Compartilhamos informações apenas:</p>
        <LegalList>
          <li>
            Com a <strong>fornecedora parceira escolhida pelo usuário</strong>, exclusivamente
            para viabilizar a proposta de adesão;
          </li>
          <li>Com prestadores de serviço (hospedagem, e-mail, analytics) sob obrigação contratual de sigilo;</li>
          <li>Quando exigido por <strong>autoridade competente</strong> ou por determinação legal/judicial.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number={5} title="Base Legal para Tratamento">
        <p>O tratamento dos dados é realizado com base nas seguintes hipóteses previstas na LGPD:</p>
        <LegalList>
          <li><strong>Consentimento</strong> do titular (art. 7º, I);</li>
          <li><strong>Execução de contrato</strong> ou procedimentos preliminares (art. 7º, V);</li>
          <li><strong>Cumprimento de obrigação legal</strong> ou regulatória (art. 7º, II);</li>
          <li><strong>Legítimo interesse</strong>, observados os direitos do titular (art. 7º, IX).</li>
        </LegalList>
      </LegalSection>

      <LegalSection number={6} title="Armazenamento e Segurança">
        <p>
          Os dados são armazenados em ambiente seguro, com criptografia em trânsito (HTTPS/TLS)
          e controles de acesso baseados em papéis. Adotamos medidas técnicas e organizacionais
          razoáveis para proteger os dados contra acesso não autorizado, perda, alteração ou
          destruição indevida.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Direitos do Titular">
        <p>Nos termos da LGPD, o titular pode, a qualquer momento, solicitar:</p>
        <LegalList>
          <li>Confirmação da existência de tratamento;</li>
          <li>Acesso aos dados;</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>Portabilidade dos dados;</li>
          <li>Eliminação dos dados tratados com consentimento;</li>
          <li>Informação sobre compartilhamentos;</li>
          <li>Revogação do consentimento.</li>
        </LegalList>
        <p>
          As solicitações devem ser enviadas para{" "}
          <strong>contato.poupeenergia@hotmail.com</strong>.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Cookies">
        <p>
          Utilizamos cookies essenciais para o funcionamento da plataforma e cookies analíticos
          para entender o comportamento dos visitantes. O usuário pode, a qualquer momento,
          gerenciar ou desativar cookies nas configurações do seu navegador.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Retenção de Dados">
        <p>
          Os dados pessoais são mantidos pelo tempo necessário ao cumprimento das finalidades
          informadas, observados os prazos legais, regulatórios e prescricionais aplicáveis.
          Após esse período, os dados são eliminados ou anonimizados.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Alterações">
        <p>
          Esta Política de Privacidade pode ser atualizada periodicamente. A versão vigente
          estará sempre disponível nesta página, com a data da última atualização indicada no topo.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Contato">
        <p>
          Para dúvidas, solicitações ou exercício de direitos previstos na LGPD, entre em
          contato pelo e-mail <strong>contato.poupeenergia@hotmail.com</strong>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default PoliticaDePrivacidade;
