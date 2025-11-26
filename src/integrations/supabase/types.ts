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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blogs: {
        Row: {
          author: string
          category_id: number | null
          content: string
          created_at: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author: string
          category_id?: number | null
          content: string
          created_at?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          category_id?: number | null
          content?: string
          created_at?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blogs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          code_range: string
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          code_range: string
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          code_range?: string
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      email_submissions: {
        Row: {
          country: string | null
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          related_search_id: string | null
          session_id: string | null
          source: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          related_search_id?: string | null
          session_id?: string | null
          source?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          related_search_id?: string | null
          session_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_submissions_related_search_id_fkey"
            columns: ["related_search_id"]
            isOneToOne: false
            referencedRelation: "related_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_landing_config: {
        Row: {
          background_color: string | null
          button_color: string | null
          button_text_color: string | null
          created_at: string | null
          description: string | null
          headline: string | null
          id: string
          logo_url: string | null
          main_image_url: string | null
          related_search_id: string | null
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          button_color?: string | null
          button_text_color?: string | null
          created_at?: string | null
          description?: string | null
          headline?: string | null
          id?: string
          logo_url?: string | null
          main_image_url?: string | null
          related_search_id?: string | null
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          button_color?: string | null
          button_text_color?: string | null
          created_at?: string | null
          description?: string | null
          headline?: string | null
          id?: string
          logo_url?: string | null
          main_image_url?: string | null
          related_search_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_landing_config_related_search_id_fkey"
            columns: ["related_search_id"]
            isOneToOne: false
            referencedRelation: "related_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      related_searches: {
        Row: {
          blog_id: string | null
          created_at: string | null
          id: string
          search_order: number | null
          search_text: string
        }
        Insert: {
          blog_id?: string | null
          created_at?: string | null
          id?: string
          search_order?: number | null
          search_text: string
        }
        Update: {
          blog_id?: string | null
          created_at?: string | null
          id?: string
          search_order?: number | null
          search_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "related_searches_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          blog_id: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          related_search_id: string | null
          session_id: string
          source: string | null
          user_agent: string | null
        }
        Insert: {
          blog_id?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          related_search_id?: string | null
          session_id: string
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          blog_id?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          related_search_id?: string | null
          session_id?: string
          source?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_events_related_search_id_fkey"
            columns: ["related_search_id"]
            isOneToOne: false
            referencedRelation: "related_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      web_results: {
        Row: {
          created_at: string | null
          description: string
          display_order: number | null
          id: string
          is_sponsored: boolean | null
          logo_url: string | null
          related_search_id: string
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order?: number | null
          id?: string
          is_sponsored?: boolean | null
          logo_url?: string | null
          related_search_id: string
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number | null
          id?: string
          is_sponsored?: boolean | null
          logo_url?: string | null
          related_search_id?: string
          title?: string
          updated_at?: string | null
          url?: string
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
