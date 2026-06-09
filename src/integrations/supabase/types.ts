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
      article_ratings: {
        Row: {
          article_id: string
          created_at: string
          id: string
          rating: number
          user_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          rating: number
          user_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_ratings_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_views: {
        Row: {
          article_id: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          article_id: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          article_id?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          meta_description: string | null
          published: boolean
          rubrique: string
          slug: string
          source_document_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          published?: boolean
          rubrique: string
          slug: string
          source_document_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          published?: boolean
          rubrique?: string
          slug?: string
          source_document_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          article_id: string | null
          created_at: string
          id: string
          podcast_id: string | null
          user_id: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          id?: string
          podcast_id?: string | null
          user_id: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          id?: string
          podcast_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          approved: boolean
          article_id: string | null
          content: string
          created_at: string
          id: string
          parent_id: string | null
          podcast_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          article_id?: string | null
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          podcast_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          article_id?: string | null
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          podcast_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      podcast_ratings: {
        Row: {
          created_at: string
          id: string
          podcast_id: string
          rating: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          podcast_id: string
          rating: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          podcast_id?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_ratings_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_views: {
        Row: {
          id: string
          ip_address: string | null
          podcast_id: string
          user_agent: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address?: string | null
          podcast_id: string
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address?: string | null
          podcast_id?: string
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_views_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          audio_url: string
          author_id: string
          created_at: string
          description: string
          duration: number | null
          id: string
          image_url: string | null
          media_type: string
          meta_description: string | null
          published: boolean
          slug: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          audio_url: string
          author_id: string
          created_at?: string
          description: string
          duration?: number | null
          id?: string
          image_url?: string | null
          media_type?: string
          meta_description?: string | null
          published?: boolean
          slug: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          audio_url?: string
          author_id?: string
          created_at?: string
          description?: string
          duration?: number | null
          id?: string
          image_url?: string | null
          media_type?: string
          meta_description?: string | null
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      search_articles: {
        Args: { search_query: string }
        Returns: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          meta_description: string | null
          published: boolean
          rubrique: string
          slug: string
          source_document_url: string | null
          title: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "articles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      search_podcasts: {
        Args: { search_query: string }
        Returns: {
          audio_url: string
          author_id: string
          created_at: string
          description: string
          duration: number | null
          id: string
          image_url: string | null
          media_type: string
          meta_description: string | null
          published: boolean
          slug: string
          title: string
          updated_at: string
          video_url: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "podcasts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
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
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
