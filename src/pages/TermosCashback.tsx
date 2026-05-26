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
        <p>
          O benefício será aplicável exclusivamente às empresas parceiras que possuírem o{" "}
          <strong>selo de cashback</strong> e o respectivo percentual de retorno financeiro
          devidamente divulgado na plataforma da Poupe Energia.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Da Elegibilidade e Ativação do Cashback">
        <p>São elegíveis ao cashback os usuários que:</p>
        <LegalList>
          <li>
            Tenham realizado a adesão a uma comercializadora{" "}
            <strong>por meio do link disponibilizado na plataforma</strong> Poupe Energia;
          </li>
          <li>Tenham cumprido todas as exigências cadastrais e contratuais da comercializadora;</li>
          <li>
            Estejam com o contrato <strong>ativo e adimplente</strong> no momento da apuração
            e do pagamento;
          </li>
          <li>
            Tenham realizado previamente o cadastro e a ativação do benefício por meio do botão{" "}
            <strong>"Entrar – Ativar Cashback"</strong>, disponível na página principal da
            plataforma da Poupe Energia;
          </li>
          <li>
            Possuam todos os <strong>dados cadastrais e bancários</strong> corretamente
            preenchidos e validados no sistema da plataforma.
          </li>
        </LegalList>
        <p>
          A ausência da ativação do cashback pelo usuário na plataforma poderá{" "}
          <strong>impedir a liberação do benefício</strong>, ainda que a adesão ao plano
          tenha sido concluída junto à comercializadora parceira.
        </p>
        <p>
          A vigência do programa é por prazo indeterminado, podendo ser alterada, suspensa
          ou encerrada a qualquer momento mediante aviso prévio na plataforma.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Da Natureza e Limitação do Cashback">
        <p>
          O cashback concedido pela Poupe Energia possui <strong>natureza promocional e
          comercial</strong>, sendo devido ao usuário apenas{" "}
          <strong>uma única vez por unidade consumidora</strong> cadastrada e vinculada à
          adesão realizada junto à comercializadora parceira.
        </p>
        <p>
          O benefício <strong>não possui caráter recorrente, mensal, vitalício ou
          continuado</strong>, ainda que o consumidor permaneça ativo na comercializadora
          parceira após a adesão.
        </p>
        <p>O direito ao recebimento do cashback será adquirido somente após:</p>
        <LegalList>
          <li>A efetiva ativação da unidade consumidora na comercializadora parceira;</li>
          <li>A compensação/injeção dos créditos de energia, quando aplicável ao modelo contratado;</li>
          <li>A emissão da primeira fatura vinculada ao novo plano contratado;</li>
          <li>A confirmação do pagamento integral da primeira fatura pelo consumidor;</li>
          <li>A validação das informações pela comercializadora parceira e pela Poupe Energia.</li>
        </LegalList>
        <p>
          Após o pagamento do cashback referente à adesão validada, considerar-se-á{" "}
          <strong>integralmente cumprida a obrigação</strong> da Poupe Energia perante o
          usuário em relação àquela contratação específica.
        </p>
      </LegalSection>

      <LegalSection number={4} title="Da Base de Cálculo do Cashback">
        <p>
          O cashback corresponde a um <strong>percentual promocional</strong> previamente
          divulgado na plataforma da Poupe Energia para cada comercializadora parceira
          participante.
        </p>
        <p>
          A base de cálculo considerará exclusivamente os critérios promocionais definidos
          pela parceria comercial vigente à época da contratação.
        </p>
        <p>Não integram a base de cálculo:</p>
        <LegalList>
          <li>Impostos;</li>
          <li>Taxas;</li>
          <li>Juros;</li>
          <li>Multas;</li>
          <li>Serviços acessórios;</li>
          <li>Valores não relacionados diretamente ao fornecimento ou compensação de energia elétrica.</li>
        </LegalList>
        <p>
          O percentual aplicável a cada parceiro estará claramente indicado na{" "}
          <strong>ficha técnica ou área comercial</strong> correspondente dentro da plataforma.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Da Referência de Consumo e Auditoria">
        <p>
          Para validação do benefício, poderá ser considerada a fatura emitida pela
          comercializadora parceira, pela distribuidora local ou quaisquer documentos
          comprobatórios relacionados à ativação e utilização do serviço contratado.
        </p>
        <p>
          A Poupe Energia poderá realizar <strong>auditoria e conferência</strong> das
          informações fornecidas, podendo solicitar:
        </p>
        <LegalList>
          <li>Cópia de faturas;</li>
          <li>Comprovantes de pagamento;</li>
          <li>Confirmação de titularidade;</li>
          <li>Documentos cadastrais complementares.</li>
        </LegalList>
        <p>
          A não apresentação das informações solicitadas poderá resultar na{" "}
          <strong>suspensão ou cancelamento</strong> do benefício.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Do Momento de Liberação e Prazos">
        <p>
          O cashback será apurado após a confirmação de todas as etapas operacionais e
          financeiras da adesão.
        </p>
        <p>
          O pagamento poderá ocorrer em até <strong>60 (sessenta) dias</strong> contados
          da ocorrência conjunta dos seguintes eventos:
        </p>
        <LegalList>
          <li>Ativação da unidade consumidora;</li>
          <li>Injeção/compensação dos créditos de energia, quando aplicável;</li>
          <li>Pagamento da primeira fatura pelo consumidor;</li>
          <li>Recebimento e validação das informações pela comercializadora parceira;</li>
          <li>Aprovação cadastral e operacional pela Poupe Energia.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number={7} title="Da Forma de Pagamento e Tributação">
        <p>
          O pagamento será realizado preferencialmente via <strong>Pix</strong> ou
          transferência bancária, em conta de titularidade do usuário cadastrado.
        </p>
        <p>
          Eventuais tributos incidentes sobre os valores recebidos são de{" "}
          <strong>responsabilidade exclusiva do usuário</strong>, devendo ser observada a
          legislação fiscal aplicável.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Dos Dados Bancários">
        <p>
          O usuário se compromete a fornecer dados bancários{" "}
          <strong>corretos, atualizados e de sua titularidade</strong>.
        </p>
        <p>A Poupe Energia não se responsabiliza por:</p>
        <LegalList>
          <li>Informações bancárias incorretas fornecidas pelo usuário;</li>
          <li>Chaves Pix inválidas;</li>
          <li>Contas de terceiros;</li>
          <li>Dados desatualizados ou inconsistentes.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number={9} title="Do Cancelamento e Perda do Direito">
        <p>O usuário perderá o direito ao cashback nas seguintes hipóteses:</p>
        <LegalList>
          <li>Cancelamento do contrato junto à comercializadora parceira antes da validação final;</li>
          <li>Inadimplência junto à comercializadora ou distribuidora;</li>
          <li>Não ativação do cadastro no botão <strong>"Entrar – Ativar Cashback"</strong>;</li>
          <li>Informações cadastrais incompletas ou inconsistentes;</li>
          <li>Constatação de fraude, simulação ou má-fé;</li>
          <li>Descumprimento de qualquer condição prevista nestes Termos.</li>
        </LegalList>
        <p>
          A Poupe Energia poderá <strong>suspender preventivamente</strong> pagamentos em
          caso de suspeita de irregularidade até a conclusão da análise interna.
        </p>
      </LegalSection>

      <LegalSection number={10} title="Proteção de Dados (LGPD)">
        <p>
          Os dados pessoais coletados para operacionalização do cashback serão tratados em
          conformidade com a <strong>Lei nº 13.709/2018 (LGPD)</strong> e com a Política de
          Privacidade da Poupe Energia.
        </p>
        <p>Os dados serão utilizados exclusivamente para:</p>
        <LegalList>
          <li>Operacionalização do cashback;</li>
          <li>Validação das adesões;</li>
          <li>Auditoria e prevenção à fraude;</li>
          <li>Cumprimento de obrigações legais e regulatórias.</li>
        </LegalList>
      </LegalSection>

      <LegalSection number={11} title="Das Disposições Finais">
        <p>
          A Poupe Energia poderá <strong>alterar, suspender ou encerrar</strong> o programa
          de cashback a qualquer momento, mediante comunicação prévia na plataforma, sem que
          isso gere direito a indenização, ressalvados os valores já devidamente apurados e
          aprovados antes da alteração.
        </p>
        <p>
          A participação no programa implica <strong>aceitação integral</strong> destes
          Termos e Condições.
        </p>
        <p>
          Fica eleito o <strong>foro da Comarca de Londrina</strong> para dirimir eventuais
          conflitos oriundos destes Termos.
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
            <p className="text-[15px] leading-relaxed">
              Para operacionalização do cashback, poderão ser coletados:
            </p>
            <LegalList>
              <li>Nome completo e CPF/CNPJ;</li>
              <li>E-mail e telefone;</li>
              <li>Dados bancários (banco, agência, conta ou chave Pix);</li>
              <li>Cópias de faturas e comprovantes de pagamento;</li>
              <li>Dados de adesão e relacionamento com a comercializadora parceira;</li>
              <li>
                Informações de ativação e validação do cadastro no sistema da Poupe Energia.
              </li>
            </LegalList>
          </section>

          <section>
            <LegalSubtitle>2. Finalidade</LegalSubtitle>
            <p className="text-[15px] leading-relaxed">
              Os dados serão utilizados exclusivamente para:
            </p>
            <LegalList>
              <li>Apuração do cashback;</li>
              <li>Validação da elegibilidade;</li>
              <li>Liberação do pagamento;</li>
              <li>Auditoria operacional e financeira;</li>
              <li>Cumprimento de obrigações legais e fiscais.</li>
            </LegalList>
          </section>

          <section>
            <LegalSubtitle>3. Compartilhamento</LegalSubtitle>
            <p className="text-[15px] leading-relaxed">
              Os dados poderão ser compartilhados com:
            </p>
            <LegalList>
              <li>Comercializadoras parceiras;</li>
              <li>Instituições financeiras responsáveis pelos pagamentos;</li>
              <li>Prestadores de serviços tecnológicos vinculados ao programa;</li>
              <li>Autoridades públicas, quando exigido por lei.</li>
            </LegalList>
          </section>

          <section>
            <LegalSubtitle>4. Segurança</LegalSubtitle>
            <p className="text-[15px] leading-relaxed">
              A Poupe Energia adota medidas técnicas e organizacionais adequadas para
              proteger os dados pessoais e bancários utilizados no programa contra acessos
              não autorizados, perda, alteração ou divulgação indevida.
            </p>
          </section>

          <section>
            <LegalSubtitle>5. Direitos do Titular</LegalSubtitle>
            <p className="text-[15px] leading-relaxed">
              O usuário poderá solicitar, a qualquer momento:
            </p>
            <LegalList>
              <li>Acesso aos dados;</li>
              <li>Correção;</li>
              <li>Atualização;</li>
              <li>Portabilidade;</li>
              <li>Exclusão, quando legalmente possível.</li>
            </LegalList>
            <p className="text-[15px] leading-relaxed">
              As solicitações deverão ser encaminhadas para{" "}
              <strong>contato.poupeenergia@hotmail.com</strong>.
            </p>
          </section>

          <section>
            <LegalSubtitle>6. Retenção</LegalSubtitle>
            <p className="text-[15px] leading-relaxed">
              Os dados serão mantidos pelo prazo necessário ao cumprimento das finalidades
              do programa, bem como dos prazos legais, regulatórios, fiscais e
              prescricionais aplicáveis.
            </p>
          </section>
        </div>
      </div>
    </LegalPageLayout>
  );
};

export default TermosCashback;
