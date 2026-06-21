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
      profile_application_defaults: {
        Row: {
          availability: string | null
          created_at: string
          notes: string | null
          preferred_location: string | null
          salary_expectation: string | null
          updated_at: string
          user_id: string
          work_authorization: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string
          notes?: string | null
          preferred_location?: string | null
          salary_expectation?: string | null
          updated_at?: string
          user_id: string
          work_authorization?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string
          notes?: string | null
          preferred_location?: string | null
          salary_expectation?: string | null
          updated_at?: string
          user_id?: string
          work_authorization?: string | null
        }
        Relationships: []
      }
      profile_certifications: {
        Row: {
          created_at: string
          id: string
          issue_date: string | null
          issuer: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_documents: {
        Row: {
          created_at: string
          doc_type: string | null
          id: string
          mime_type: string | null
          name: string
          size_bytes: number | null
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type?: string | null
          id?: string
          mime_type?: string | null
          name: string
          size_bytes?: number | null
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          size_bytes?: number | null
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_education: {
        Row: {
          created_at: string
          degree: string | null
          end_year: string | null
          field: string | null
          id: string
          institution: string
          start_year: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          degree?: string | null
          end_year?: string | null
          field?: string | null
          id?: string
          institution: string
          start_year?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          degree?: string | null
          end_year?: string | null
          field?: string | null
          id?: string
          institution?: string
          start_year?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_experience: {
        Row: {
          company: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          role: string
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          role: string
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          role?: string
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_extras: {
        Row: {
          created_at: string
          linkedin_url: string | null
          location: string | null
          summary: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          linkedin_url?: string | null
          location?: string | null
          summary?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          linkedin_url?: string | null
          location?: string | null
          summary?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profile_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profile_skills: {
        Row: {
          created_at: string
          id: string
          level: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string | null
          name?: string
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
