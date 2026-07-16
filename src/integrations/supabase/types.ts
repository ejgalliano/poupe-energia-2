export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          ativo: boolean
          created_at: string
          empresa_id: string | null
          id: string
          imagem_url: string
          link_url: string | null
          ordem: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          empresa_id?: string | null
          id?: string
          imagem_url: string
          link_url?: string | null
          ordem?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          empresa_id?: string | null
          id?: string
          imagem_url?: string
          link_url?: string | null
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "banners_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      distribuidoras: {
        Row: {
          estado_id: number
          id: string
          nome: string
        }
        Insert: {
          estado_id: number
          id?: string
          nome: string
        }
        Update: {
          estado_id?: number
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "distribuidoras_estado_id_fkey"
            columns: ["estado_id"]
            isOneToOne: false
            referencedRelation: "estados"
            referencedColumns: ["id"]
          },
        ]
      }
      embaixadores: {
        Row: {
          ativo: boolean
          chave_pix: string | null
          codigo: string
          comissao_percentual: number
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          chave_pix?: string | null
          codigo: string
          comissao_percentual?: number
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          chave_pix?: string | null
          codigo?: string
          comissao_percentual?: number
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      embaixadores_candidatos: {
        Row: {
          id: string
          created_at: string
          nome: string
          email: string
          telefone: string
          cidade: string | null
          uf: string | null
          is_mei: boolean | null
          tem_equipe: boolean
          status: string
          observacoes: string | null
          aprovado_em: string | null
          embaixador_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          nome: string
          email: string
          telefone: string
          cidade?: string | null
          uf?: string | null
          is_mei?: boolean | null
          tem_equipe?: boolean
          status?: string
          observacoes?: string | null
          aprovado_em?: string | null
          embaixador_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          nome?: string
          email?: string
          telefone?: string
          cidade?: string | null
          uf?: string | null
          is_mei?: boolean | null
          tem_equipe?: boolean
          status?: string
          observacoes?: string | null
          aprovado_em?: string | null
          embaixador_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "embaixadores_candidatos_embaixador_id_fkey"
            columns: ["embaixador_id"]
            isOneToOne: false
            referencedRelation: "embaixadores"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          arquetipo: string | null
          atende_empresarial: boolean
          atende_residencial: boolean
          ativa: boolean
          avaliacao_google: number | null
          aviso_previo_dias: number | null
          canais_atendimento: string[] | null
          cancel_aviso_previo: number | null
          cancel_dicas: string | null
          cancel_email: string | null
          cancel_ouvidoria: string | null
          cancel_processo: string | null
          cancel_recorrer: string | null
          cancel_site: string | null
          cancel_telefone: string | null
          cashback_percentual: number
          cnpj: string | null
          consumo_minimo: number | null
          created_at: string
          desconto_divulgado: string | null
          economia_minima_garantida: boolean | null
          estados_atuacao: string | null
          fontes_geracao: string[] | null
          fundacao: number | null
          grupo_economico: string | null
          id: string
          incide_sobre: string | null
          indice_reajuste: string | null
          logo_url: string | null
          meses_fidelidade: number | null
          modelo_billing: string | null
          modelo_infraestrutura: string | null
          multa_cancelamento: number | null
          nome: string
          numero_reclamacoes_ra: number | null
          parceira: boolean
          parecer_tecnico: string | null
          pontos_atencao: string | null
          possui_usina_propria: boolean | null
          prazo_ativacao: string | null
          processos_judiciais: boolean | null
          razao_social: string | null
          reputacao_reclame_aqui: number | null
          sede: string | null
          site_url: string | null
          taxa_adesao: number | null
          tipo: string
          tipo_desconto: string | null
          tipo_fornecedor: string
          vantagens: string | null
        }
        Insert: {
          arquetipo?: string | null
          atende_empresarial?: boolean
          atende_residencial?: boolean
          ativa?: boolean
          avaliacao_google?: number | null
          aviso_previo_dias?: number | null
          canais_atendimento?: string[] | null
          cancel_aviso_previo?: number | null
          cancel_dicas?: string | null
          cancel_email?: string | null
          cancel_ouvidoria?: string | null
          cancel_processo?: string | null
          cancel_recorrer?: string | null
          cancel_site?: string | null
          cancel_telefone?: string | null
          cashback_percentual?: number
          cnpj?: string | null
          consumo_minimo?: number | null
          created_at?: string
          desconto_divulgado?: string | null
          economia_minima_garantida?: boolean | null
          estados_atuacao?: string | null
          fontes_geracao?: string[] | null
          fundacao?: number | null
          grupo_economico?: string | null
          id?: string
          incide_sobre?: string | null
          indice_reajuste?: string | null
          logo_url?: string | null
          meses_fidelidade?: number | null
          modelo_billing?: string | null
          modelo_infraestrutura?: string | null
          multa_cancelamento?: number | null
          nome: string
          numero_reclamacoes_ra?: number | null
          parceira?: boolean
          parecer_tecnico?: string | null
          pontos_atencao?: string | null
          possui_usina_propria?: boolean | null
          prazo_ativacao?: string | null
          processos_judiciais?: boolean | null
          razao_social?: string | null
          reputacao_reclame_aqui?: number | null
          sede?: string | null
          site_url?: string | null
          taxa_adesao?: number | null
          tipo: string
          tipo_desconto?: string | null
          tipo_fornecedor?: string
          vantagens?: string | null
        }
        Update: {
          arquetipo?: string | null
          atende_empresarial?: boolean
          atende_residencial?: boolean
          ativa?: boolean
          avaliacao_google?: number | null
          aviso_previo_dias?: number | null
          canais_atendimento?: string[] | null
          cancel_aviso_previo?: number | null
          cancel_dicas?: string | null
          cancel_email?: string | null
          cancel_ouvidoria?: string | null
          cancel_processo?: string | null
          cancel_recorrer?: string | null
          cancel_site?: string | null
          cancel_telefone?: string | null
          cashback_percentual?: number
          cnpj?: string | null
          consumo_minimo?: number | null
          created_at?: string
          desconto_divulgado?: string | null
          economia_minima_garantida?: boolean | null
          estados_atuacao?: string | null
          fontes_geracao?: string[] | null
          fundacao?: number | null
          grupo_economico?: string | null
          id?: string
          incide_sobre?: string | null
          indice_reajuste?: string | null
          logo_url?: string | null
          meses_fidelidade?: number | null
          modelo_billing?: string | null
          modelo_infraestrutura?: string | null
          multa_cancelamento?: number | null
          nome?: string
          numero_reclamacoes_ra?: number | null
          parceira?: boolean
          parecer_tecnico?: string | null
          pontos_atencao?: string | null
          possui_usina_propria?: boolean | null
          prazo_ativacao?: string | null
          processos_judiciais?: boolean | null
          razao_social?: string | null
          reputacao_reclame_aqui?: number | null
          sede?: string | null
          site_url?: string | null
          taxa_adesao?: number | null
          tipo?: string
          tipo_desconto?: string | null
          tipo_fornecedor?: string
          vantagens?: string | null
        }
        Relationships: []
      }
      estados: {
        Row: {
          id: number
          nome: string
          sigla: string
        }
        Insert: {
          id?: number
          nome: string
          sigla: string
        }
        Update: {
          id?: number
          nome?: string
          sigla?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          distribuidora_id: string | null
          email: string | null
          empresa_id: string
          estado_sigla: string | null
          evento: string
          id: string
          ip_hash: string | null
          nome: string | null
          telefone: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          distribuidora_id?: string | null
          email?: string | null
          empresa_id: string
          estado_sigla?: string | null
          evento: string
          id?: string
          ip_hash?: string | null
          nome?: string | null
          telefone?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          distribuidora_id?: string | null
          email?: string | null
          empresa_id?: string
          estado_sigla?: string | null
          evento?: string
          id?: string
          ip_hash?: string | null
          nome?: string | null
          telefone?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_distribuidora_id_fkey"
            columns: ["distribuidora_id"]
            isOneToOne: false
            referencedRelation: "distribuidoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_embaixadores: {
        Row: {
          created_at: string
          data_adesao: string | null
          data_pagamento: string | null
          embaixador_id: string
          empresa_id: string
          id: string
          lead_id: string
          observacoes: string | null
          status_comissao: string
          updated_at: string
          valor_comissao: number
        }
        Insert: {
          created_at?: string
          data_adesao?: string | null
          data_pagamento?: string | null
          embaixador_id: string
          empresa_id: string
          id?: string
          lead_id: string
          observacoes?: string | null
          status_comissao?: string
          updated_at?: string
          valor_comissao?: number
        }
        Update: {
          created_at?: string
          data_adesao?: string | null
          data_pagamento?: string | null
          embaixador_id?: string
          empresa_id?: string
          id?: string
          lead_id?: string
          observacoes?: string | null
          status_comissao?: string
          updated_at?: string
          valor_comissao?: number
        }
        Relationships: [
          {
            foreignKeyName: "leads_embaixadores_embaixador_id_fkey"
            columns: ["embaixador_id"]
            isOneToOne: false
            referencedRelation: "embaixadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_embaixadores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_embaixadores_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_empresariais: {
        Row: {
          arquivos_paths: string[] | null
          cnpj: string
          created_at: string
          distribuidora_id: string | null
          distribuidora_nome: string | null
          email: string
          estado_sigla: string | null
          id: string
          observacoes_admin: string | null
          razao_social: string
          responsavel_nome: string
          status: string
          telefone: string
          updated_at: string
          valor_conta: number | null
        }
        Insert: {
          arquivos_paths?: string[] | null
          cnpj: string
          created_at?: string
          distribuidora_id?: string | null
          distribuidora_nome?: string | null
          email: string
          estado_sigla?: string | null
          id?: string
          observacoes_admin?: string | null
          razao_social: string
          responsavel_nome: string
          status?: string
          telefone: string
          updated_at?: string
          valor_conta?: number | null
        }
        Update: {
          arquivos_paths?: string[] | null
          cnpj?: string
          created_at?: string
          distribuidora_id?: string | null
          distribuidora_nome?: string | null
          email?: string
          estado_sigla?: string | null
          id?: string
          observacoes_admin?: string | null
          razao_social?: string
          responsavel_nome?: string
          status?: string
          telefone?: string
          updated_at?: string
          valor_conta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_empresariais_distribuidora_id_fkey"
            columns: ["distribuidora_id"]
            isOneToOne: false
            referencedRelation: "distribuidoras"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_empresas: {
        Row: {
          desconto_percentual: number
          distribuidora_id: string
          empresa_id: string
          id: string
          nivel_risco: string | null
          nota_final: number
          reputacao_reclame_aqui: number
          seguranca_juridica: number
          updated_at: string
          valor_minimo_fatura: number
        }
        Insert: {
          desconto_percentual: number
          distribuidora_id: string
          empresa_id: string
          id?: string
          nivel_risco?: string | null
          nota_final?: number
          reputacao_reclame_aqui: number
          seguranca_juridica: number
          updated_at?: string
          valor_minimo_fatura: number
        }
        Update: {
          desconto_percentual?: number
          distribuidora_id?: string
          empresa_id?: string
          id?: string
          nivel_risco?: string | null
          nota_final?: number
          reputacao_reclame_aqui?: number
          seguranca_juridica?: number
          updated_at?: string
          valor_minimo_fatura?: number
        }
        Relationships: [
          {
            foreignKeyName: "notas_empresas_distribuidora_id_fkey"
            columns: ["distribuidora_id"]
            isOneToOne: false
            referencedRelation: "distribuidoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_empresas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      parceiros_config: {
        Row: {
          ativo: boolean
          comissao_percentual: number | null
          contato_email: string | null
          contato_nome: string | null
          empresa_id: string
          id: string
          modelo_comissao: string | null
          observacoes: string | null
          updated_at: string
          url_afiliado: string | null
        }
        Insert: {
          ativo?: boolean
          comissao_percentual?: number | null
          contato_email?: string | null
          contato_nome?: string | null
          empresa_id: string
          id?: string
          modelo_comissao?: string | null
          observacoes?: string | null
          updated_at?: string
          url_afiliado?: string | null
        }
        Update: {
          ativo?: boolean
          comissao_percentual?: number | null
          contato_email?: string | null
          contato_nome?: string | null
          empresa_id?: string
          id?: string
          modelo_comissao?: string | null
          observacoes?: string | null
          updated_at?: string
          url_afiliado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parceiros_config_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      scorecard_sj: {
        Row: {
          aviso_previo_90_dias: boolean
          boa_fe_objetiva: boolean
          conformidade_lei_14300: boolean
          creditos_scee_rescisao: boolean
          equilibrio_contratual_cdc: boolean
          foro_consumidor: boolean
          id: string
          limites_multa: boolean
          nota_empresa_id: string
          protecao_dados_lgpd: boolean
          responsabilidade_injecao: boolean
          transparencia_tarifaria: boolean
        }
        Insert: {
          aviso_previo_90_dias?: boolean
          boa_fe_objetiva?: boolean
          conformidade_lei_14300?: boolean
          creditos_scee_rescisao?: boolean
          equilibrio_contratual_cdc?: boolean
          foro_consumidor?: boolean
          id?: string
          limites_multa?: boolean
          nota_empresa_id: string
          protecao_dados_lgpd?: boolean
          responsabilidade_injecao?: boolean
          transparencia_tarifaria?: boolean
        }
        Update: {
          aviso_previo_90_dias?: boolean
          boa_fe_objetiva?: boolean
          conformidade_lei_14300?: boolean
          creditos_scee_rescisao?: boolean
          equilibrio_contratual_cdc?: boolean
          foro_consumidor?: boolean
          id?: string
          limites_multa?: boolean
          nota_empresa_id?: string
          protecao_dados_lgpd?: boolean
          responsabilidade_injecao?: boolean
          transparencia_tarifaria?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "scorecard_sj_nota_empresa_id_fkey"
            columns: ["nota_empresa_id"]
            isOneToOne: false
            referencedRelation: "notas_empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
