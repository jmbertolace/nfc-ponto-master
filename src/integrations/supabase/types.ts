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
      alunos: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          identificador: string | null
          nome: string
          nome_exibicao: string | null
          numero: number | null
          saldo_pontos: number
          status: string
          turma_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          identificador?: string | null
          nome: string
          nome_exibicao?: string | null
          numero?: number | null
          saldo_pontos?: number
          status?: string
          turma_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          identificador?: string | null
          nome?: string
          nome_exibicao?: string | null
          numero?: number | null
          saldo_pontos?: number
          status?: string
          turma_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      atividades: {
        Row: {
          created_at: string
          data: string | null
          descricao: string | null
          disciplina: string | null
          id: string
          nome: string
          prazo: string | null
          status: string
          turma_id: string | null
          valor: number
        }
        Insert: {
          created_at?: string
          data?: string | null
          descricao?: string | null
          disciplina?: string | null
          id?: string
          nome: string
          prazo?: string | null
          status?: string
          turma_id?: string | null
          valor?: number
        }
        Update: {
          created_at?: string
          data?: string | null
          descricao?: string | null
          disciplina?: string | null
          id?: string
          nome?: string
          prazo?: string | null
          status?: string
          turma_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "atividades_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      auditoria: {
        Row: {
          aluno_id: string | null
          data_hora: string
          id: string
          motivo: string | null
          operacao: string
          usuario_id: string | null
          usuario_nome: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          aluno_id?: string | null
          data_hora?: string
          id?: string
          motivo?: string | null
          operacao: string
          usuario_id?: string | null
          usuario_nome?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          aluno_id?: string | null
          data_hora?: string
          id?: string
          motivo?: string | null
          operacao?: string
          usuario_id?: string | null
          usuario_nome?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          created_at: string
          data: string | null
          descricao: string | null
          disciplina: string | null
          id: string
          nome: string
          turma_id: string | null
          valor_maximo: number
        }
        Insert: {
          created_at?: string
          data?: string | null
          descricao?: string | null
          disciplina?: string | null
          id?: string
          nome: string
          turma_id?: string | null
          valor_maximo?: number
        }
        Update: {
          created_at?: string
          data?: string | null
          descricao?: string | null
          disciplina?: string | null
          id?: string
          nome?: string
          turma_id?: string | null
          valor_maximo?: number
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      cartoes_nfc: {
        Row: {
          aluno_id: string
          data_vinculacao: string
          id: string
          nfc_uid: string
          status: string
        }
        Insert: {
          aluno_id: string
          data_vinculacao?: string
          id?: string
          nfc_uid: string
          status?: string
        }
        Update: {
          aluno_id?: string
          data_vinculacao?: string
          id?: string
          nfc_uid?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cartoes_nfc_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          id: number
          nome_professor: string
          permitir_saldo_negativo: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          nome_professor?: string
          permitir_saldo_negativo?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          nome_professor?: string
          permitir_saldo_negativo?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      entregas_atividades: {
        Row: {
          aluno_id: string
          atividade_id: string
          data_entrega: string | null
          id: string
          nota: number | null
          status: string
        }
        Insert: {
          aluno_id: string
          atividade_id: string
          data_entrega?: string | null
          id?: string
          nota?: number | null
          status?: string
        }
        Update: {
          aluno_id?: string
          atividade_id?: string
          data_entrega?: string | null
          id?: string
          nota?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "entregas_atividades_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_atividades_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_avaliacoes: {
        Row: {
          aluno_id: string
          avaliacao_id: string
          id: string
          nota: number | null
        }
        Insert: {
          aluno_id: string
          avaliacao_id: string
          id?: string
          nota?: number | null
        }
        Update: {
          aluno_id?: string
          avaliacao_id?: string
          id?: string
          nota?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_avaliacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_avaliacoes_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          aluno_id: string
          data_hora: string
          id: string
          motivo: string | null
          saldo_anterior: number
          saldo_posterior: number
          tipo: string
          transaction_group_id: string | null
          usuario_id: string | null
          usuario_nome: string | null
          valor: number
        }
        Insert: {
          aluno_id: string
          data_hora?: string
          id?: string
          motivo?: string | null
          saldo_anterior: number
          saldo_posterior: number
          tipo: string
          transaction_group_id?: string | null
          usuario_id?: string | null
          usuario_nome?: string | null
          valor: number
        }
        Update: {
          aluno_id?: string
          data_hora?: string
          id?: string
          motivo?: string | null
          saldo_anterior?: number
          saldo_posterior?: number
          tipo?: string
          transaction_group_id?: string | null
          usuario_id?: string | null
          usuario_nome?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          ano: string | null
          created_at: string
          id: string
          nome: string
          status: string
          updated_at: string
        }
        Insert: {
          ano?: string | null
          created_at?: string
          id?: string
          nome: string
          status?: string
          updated_at?: string
        }
        Update: {
          ano?: string | null
          created_at?: string
          id?: string
          nome?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "professor" | "aluno"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["professor", "aluno"],
    },
  },
} as const
