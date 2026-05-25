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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bursary_requirements: {
        Row: {
          bursary_name: string
          created_at: string
          deadline: string | null
          id: string
          provider: string | null
          raw: Json | null
          requirements: string
          source_url: string | null
          updated_at: string
        }
        Insert: {
          bursary_name: string
          created_at?: string
          deadline?: string | null
          id?: string
          provider?: string | null
          raw?: Json | null
          requirements: string
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          bursary_name?: string
          created_at?: string
          deadline?: string | null
          id?: string
          provider?: string | null
          raw?: Json | null
          requirements?: string
          source_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      comparagent_results: {
        Row: {
          created_at: string
          given_info_id: string | null
          id: string
          matches: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          given_info_id?: string | null
          id?: string
          matches?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          given_info_id?: string | null
          id?: string
          matches?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparagent_results_given_info_id_fkey"
            columns: ["given_info_id"]
            isOneToOne: false
            referencedRelation: "given_bursary_info"
            referencedColumns: ["id"]
          },
        ]
      }
      given_bursary_info: {
        Row: {
          created_at: string
          id: string
          payload: Json
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload: Json
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          created_at: string
          degree: string | null
          disability: boolean
          faculty: string | null
          full_name: string
          gpa: string | null
          household_income: string | null
          id: string
          id_number: string
          province: string | null
          race: string | null
          supporting_documents: Json | null
          updated_at: string
          university: string | null
          user_id: string
          year_of_study: string | null
          gender: string | null
        }
        Insert: {
          created_at?: string
          degree?: string | null
          disability?: boolean
          faculty?: string | null
          full_name: string
          gpa?: string | null
          household_income?: string | null
          id?: string
          id_number: string
          province?: string | null
          race?: string | null
          supporting_documents?: Json | null
          updated_at?: string
          university?: string | null
          user_id: string
          year_of_study?: string | null
          gender?: string | null
        }
        Update: {
          created_at?: string
          degree?: string | null
          disability?: boolean
          faculty?: string | null
          full_name?: string
          gpa?: string | null
          household_income?: string | null
          id?: string
          id_number?: string
          province?: string | null
          race?: string | null
          supporting_documents?: Json | null
          updated_at?: string
          university?: string | null
          user_id?: string
          year_of_study?: string | null
          gender?: string | null
        }
        Relationships: []
      }
      bursaries: {
        Row: {
          application_url: string | null
          amount: string | null
          created_at: string
          deadline: string | null
          eligibility: Json | null
          fields_of_study: string[] | null
          id: string
          last_scraped_at: string
          name: string
          provider: string | null
          status: "open" | "closed" | "unknown"
          updated_at: string
          url: string | null
        }
        Insert: {
          application_url?: string | null
          amount?: string | null
          created_at?: string
          deadline?: string | null
          eligibility?: Json | null
          fields_of_study?: string[] | null
          id?: string
          last_scraped_at?: string
          name: string
          provider?: string | null
          status?: "open" | "closed" | "unknown"
          updated_at?: string
          url?: string | null
        }
        Update: {
          application_url?: string | null
          amount?: string | null
          created_at?: string
          deadline?: string | null
          eligibility?: Json | null
          fields_of_study?: string[] | null
          id?: string
          last_scraped_at?: string
          name?: string
          provider?: string | null
          status?: "open" | "closed" | "unknown"
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          agent_log: string | null
          bursary_id: string
          created_at: string
          id: string
          screenshot_url: string | null
          status: "pending" | "submitted" | "failed" | "reviewing"
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_log?: string | null
          bursary_id: string
          created_at?: string
          id?: string
          screenshot_url?: string | null
          status?: "pending" | "submitted" | "failed" | "reviewing"
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_log?: string | null
          bursary_id?: string
          created_at?: string
          id?: string
          screenshot_url?: string | null
          status?: "pending" | "submitted" | "failed" | "reviewing"
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          field_of_study: string | null
          full_name: string | null
          id: string
          income_band: string | null
          institution: string | null
          marks: string | null
          nationality: string | null
          onboarding_complete: boolean | null
          output: string | null
          phone: string | null
          preferred_language: string | null
          province: string | null
          study_level: string | null
          title: string | null
          updated_at: string | null
          year_of_study: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          field_of_study?: string | null
          full_name?: string | null
          id: string
          income_band?: string | null
          institution?: string | null
          marks?: string | null
          nationality?: string | null
          onboarding_complete?: boolean | null
          output?: string | null
          phone?: string | null
          preferred_language?: string | null
          province?: string | null
          study_level?: string | null
          title?: string | null
          updated_at?: string | null
          year_of_study?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          field_of_study?: string | null
          full_name?: string | null
          id?: string
          income_band?: string | null
          institution?: string | null
          marks?: string | null
          nationality?: string | null
          onboarding_complete?: boolean | null
          output?: string | null
          phone?: string | null
          preferred_language?: string | null
          province?: string | null
          study_level?: string | null
          title?: string | null
          updated_at?: string | null
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
