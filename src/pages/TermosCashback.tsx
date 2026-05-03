import LegalPageLayout, { LegalSection, LegalSubtitle, LegalList } from "@/components/LegalPageLayout";

const TermosCashback = () => {
  return (
    <LegalPageLayout
      title="Termos e Condições do Cashback e Benefícios – Poupe Energia"
      pageName="Cashback – Termos e Condições"
      seoDescription="Termos e Condições do Cashback e Benefícios da Poupe Energia. Conheça as regras de elegibilidade, cálculo, pagamento e proteção de dados do programa de cashback."
    >
      <p>
        Estes Termos e Condições regulam o programa de <strong>Cashback e Benefícios</strong>{" "}
        oferecido pela Poupe Energia aos usuários que aderirem a planos de comercializadoras
        parceiras por meio da plataforma.
      </p>

      <LegalSection number={1} title="Do Objeto">
        <p>
          O programa de Cashback consiste no <strong>retorno financeiro</strong> ao usuário
          que efetivar a adesão a uma comercializadora de energia parceira da Poupe Energia,
          observadas as condições previstas nestes Termos.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Da Elegibilidade e Vigência">
        <p>São elegíveis ao cashback os usuários que:</p>
        <LegalList>
          <li>Tenham realizado a adesão a uma comercializadora <strong>por meio do link disponibilizado na plataforma</strong> Poupe Energia;</li>
          <li>Tenham cumprido todas as exigências cadastrais e contratuais da comercializadora;</li>
          <li>Estejam com o contrato <strong>ativo e adimplente</strong> no momento da apuração e do pagamento.</li>
        </LegalList>
        <p>
          A vigência do programa é por prazo indeterminado, podendo ser alterada ou
          encerrada a qualquer momento mediante aviso prévio na plataforma.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Da Base de Cálculo do Cashback">
        <p>
          O cashback corresponde a um <strong>percentual sobre a economia mensal</strong>{" "}
          gerada ao usuário em decorrência da adesão à comercializadora parceira, conforme
          divulgado em cada empresa específica na plataforma.
        </p>
        <LegalList>
          <li>A base de cálculo considera o desconto efetivamente concedido pela comercializadora;</li>
          <li>Não integram a base impostos, taxas adicionais ou serviços não relacionados ao consumo de energia;</li>
          <li>O percentual aplicável a cada parceiro está claramente indicado na ficha técnica da empresa.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number={4} title="Da Referência de Consumo e Auditoria">
        <p>
          Para cálculo do benefício, será considerada a <strong>fatura mensal emitida</strong>
          pela comercializadora ou pela distribuidora local, conforme aplicável. A Poupe
          Energia poderá realizar auditoria nos valores informados, podendo solicitar cópia
          das faturas para validação.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Do Momento de Liberação e Prazos">
        <p>
          O cashback será apurado <strong>mensalmente</strong> e liberado em até{" "}
          <strong>60 (sessenta) dias</strong> após a confirmação do pagamento da fatura pelo
          usuário e do repasse das informações pela comercializadora parceira à Poupe Energia.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Da Forma de Pagamento e Tributação">
        <p>
          O pagamento será realizado preferencialmente via <strong>Pix</strong> ou
          transferência bancária, em conta de titularidade do usuário cadastrado.
        </p>
        <p>
          Eventuais tributos incidentes sobre o valor recebido são de{" "}
          <strong>responsabilidade exclusiva do usuário</strong>, devendo ser declarados
          conforme legislação fiscal aplicável.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Dos Dados Bancários">
        <p>
          O usuário se compromete a fornecer dados bancários <strong>corretos, atualizados e
          de sua titularidade</strong>. A Poupe Energia não se responsabiliza por valores
          enviados a contas erroneamente informadas pelo próprio usuário.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Do Cancelamento e Perda do Direito">
        <p>O usuário perde o direito ao cashback nas seguintes hipóteses:</p>
        <LegalList>
          <li>Cancelamento do contrato com a comercializadora parceira;</li>
          <li>Inadimplência junto à comercializadora ou distribuidora;</li>
          <li>Constatação de fraude, simulação ou prestação de informações falsas;</li>
          <li>Descumprimento de qualquer condição prevista nestes Termos.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number={9} title="Proteção de Dados (LGPD)">
        <p>
          Os dados pessoais coletados para operacionalização do cashback são tratados em
          conformidade com a <strong>Lei nº 13.709/2018 (LGPD)</strong> e com a Política de
          Privacidade da Poupe Energia. Os dados serão utilizados exclusivamente para a
          finalidade do programa e mantidos pelo prazo legal aplicável.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Das Disposições Finais">
        <p>
          A Poupe Energia poderá <strong>alterar, suspender ou encerrar</strong> o programa
          de cashback a qualquer momento, mediante comunicação prévia, sem que isso gere
          qualquer direito de indenização aos usuários, ressalvados os valores já apurados e
          devidos até a data da alteração.
        </p>
        <p>
          Fica eleito o <strong>foro da Comarca de Londrina/PR</strong> para dirimir
          eventuais conflitos oriundos destes Termos.
        </p>
      </LegalSection>

      {/* Política de Privacidade do Cashback */}
      <div className="pt-8 mt-8 border-t-2 border-brand-blue/20">
        <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue mb-2">
          Política de Privacidade e Proteção de Dados do Cashback
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Aplicável especificamente ao programa de Cashback e Benefícios.
        </p>

        <div className="space-y-6">
          <section>
            <LegalSubtitle>1. Dados Coletados</LegalSubtitle>
            <p className="text-[15px] leading-relaxed">Para operacionalização do cashback, coletamos:</p>
            <LegalList>
              <li>Nome completo e CPF/CNPJ;</li>
              <li>E-mail e telefone de contato;</li>
              <li>Dados bancários (banco, agência, conta ou chave Pix);</li>
              <li>Cópia das faturas de energia para validação dos valores;</li>
              <li>Dados de adesão e relacionamento com a comercializadora parceira.</li>
            </LegalList>
          </section>

          <section>
            <LegalSubtitle>2. Finalidade</LegalSubtitle>
            <p className="text-[15px] leading-relaxed">
              Os dados são utilizados exclusivamente para apurar, liberar e auditar o cashback
              devido, bem como para cumprir obrigações legais e fiscais.
            </p>
          </section>

          <section>
            <LegalSubtitle>3. Compartilhamento</LegalSubtitle>
            <p className="text-[15px] leading-relaxed">
              Os dados poderão ser compartilhados com a comercializadora parceira responsável
              pela conta do usuário, instituições financeiras envolvidas no pagamento e
              autoridades competentes, quando exigido por lei.
            </p>
          </section>

          <section>
            <LegalSubtitle>4. Segurança</LegalSubtitle>
            <p className="text-[15px] leading-relaxed">
              Adotamos medidas técnicas e organizacionais adequadas para proteger os dados
              bancários e pessoais utilizados no programa contra acesso não autorizado, perda
              ou alteração indevida.
            </p>
          </section>

          <section>
            <LegalSubtitle>5. Direitos do Titular</LegalSubtitle>
            <p className="text-[15px] leading-relaxed">
              O usuário pode, a qualquer momento, solicitar acesso, correção, atualização,
              portabilidade ou exclusão de seus dados, observadas as obrigações legais de
              guarda. As solicitações devem ser enviadas para{" "}
              <strong>contato.poupeenergia@hotmail.com</strong>.
            </p>
          </section>

          <section>
            <LegalSubtitle>6. Retenção</LegalSubtitle>
            <p className="text-[15px] leading-relaxed">
              Os dados serão mantidos pelo prazo necessário ao cumprimento das finalidades do
              programa e dos prazos legais e prescricionais aplicáveis (em especial,
              fiscais e contábeis).
            </p>
          </section>
        </div>
      </div>
    </LegalPageLayout>
  );
};

export default TermosCashback;
