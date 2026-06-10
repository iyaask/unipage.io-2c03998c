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
      applications: {
        Row: {
          agent_log: string | null
          bursary_id: string
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_log?: string | null
          bursary_id: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_log?: string | null
          bursary_id?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_bursary_id_fkey"
            columns: ["bursary_id"]
            isOneToOne: false
            referencedRelation: "bursaries"
            referencedColumns: ["id"]
          },
        ]
      }
      bursaries: {
        Row: {
          amount: string | null
          created_at: string
          deadline: string | null
          eligibility: Json | null
          fields_of_study: string[] | null
          id: string
          name: string
          provider: string | null
          status: string
          updated_at: string
          url: string | null
        }
        Insert: {
          amount?: string | null
          created_at?: string
          deadline?: string | null
          eligibility?: Json | null
          fields_of_study?: string[] | null
          id?: string
          name: string
          provider?: string | null
          status?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          amount?: string | null
          created_at?: string
          deadline?: string | null
          eligibility?: Json | null
          fields_of_study?: string[] | null
          id?: string
          name?: string
          provider?: string | null
          status?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      bursary_requirements: {
        Row: {
          bursary_name: string
          created_at: string
          deadline: string | null
          id: string
          provider: string | null
          requirements: string | null
          source_url: string | null
          updated_at: string
        }
        Insert: {
          bursary_name: string
          created_at?: string
          deadline?: string | null
          id?: string
          provider?: string | null
          requirements?: string | null
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          bursary_name?: string
          created_at?: string
          deadline?: string | null
          id?: string
          provider?: string | null
          requirements?: string | null
          source_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      comparagent_results: {
        Row: {
          created_at: string
          id: string
          matches: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          matches?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          matches?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      given_bursary_info: {
        Row: {
          created_at: string
          id: string
          payload: Json | null
          summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json | null
          summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json | null
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          "contact information": number | null
          "country of citizenship": string | null
          created_at: string
          "email address": string | null
          "full name": string | null
          id: string
          marks: string | null
          output: string | null
          "preferred language": string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          "contact information"?: number | null
          "country of citizenship"?: string | null
          created_at?: string
          "email address"?: string | null
          "full name"?: string | null
          id: string
          marks?: string | null
          output?: string | null
          "preferred language"?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          "contact information"?: number | null
          "country of citizenship"?: string | null
          created_at?: string
          "email address"?: string | null
          "full name"?: string | null
          id?: string
          marks?: string | null
          output?: string | null
          "preferred language"?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          created_at: string
          degree: string | null
          disability: boolean | null
          faculty: string | null
          full_name: string | null
          gender: string | null
          gpa: number | null
          household_income: string | null
          id: string
          id_number: string | null
          province: string | null
          race: string | null
          supporting_documents: Json | null
          university: string | null
          updated_at: string
          user_id: string
          year_of_study: string | null
        }
        Insert: {
          created_at?: string
          degree?: string | null
          disability?: boolean | null
          faculty?: string | null
          full_name?: string | null
          gender?: string | null
          gpa?: number | null
          household_income?: string | null
          id?: string
          id_number?: string | null
          province?: string | null
          race?: string | null
          supporting_documents?: Json | null
          university?: string | null
          updated_at?: string
          user_id: string
          year_of_study?: string | null
        }
        Update: {
          created_at?: string
          degree?: string | null
          disability?: boolean | null
          faculty?: string | null
          full_name?: string | null
          gender?: string | null
          gpa?: number | null
          household_income?: string | null
          id?: string
          id_number?: string | null
          province?: string | null
          race?: string | null
          supporting_documents?: Json | null
          university?: string | null
          updated_at?: string
          user_id?: string
          year_of_study?: string | null
        }
        Relationships: []
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
