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
      empresas: {
        Row: {
          ativa: boolean
          cashback_percentual: number
          created_at: string
          id: string
          logo_url: string | null
          nome: string
          parceira: boolean
          site_url: string | null
          tipo: string
        }
        Insert: {
          ativa?: boolean
          cashback_percentual?: number
          created_at?: string
          id?: string
          logo_url?: string | null
          nome: string
          parceira?: boolean
          site_url?: string | null
          tipo: string
        }
        Update: {
          ativa?: boolean
          cashback_percentual?: number
          created_at?: string
          id?: string
          logo_url?: string | null
          nome?: string
          parceira?: boolean
          site_url?: string | null
          tipo?: string
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
      notas_empresas: {
        Row: {
          desconto_percentual: number
          distribuidora_id: string
          empresa_id: string
          id: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
