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
      block_programs: {
        Row: {
          block_category: Database["public"]["Enums"]["block_category"]
          id: string
          steps: Json
          tier_required: Database["public"]["Enums"]["tier_level"]
          title: string
        }
        Insert: {
          block_category: Database["public"]["Enums"]["block_category"]
          id?: string
          steps: Json
          tier_required?: Database["public"]["Enums"]["tier_level"]
          title: string
        }
        Update: {
          block_category?: Database["public"]["Enums"]["block_category"]
          id?: string
          steps?: Json
          tier_required?: Database["public"]["Enums"]["tier_level"]
          title?: string
        }
        Relationships: []
      }
      block_progress: {
        Row: {
          completed_at: string | null
          current_step: number
          diagnosis_result: Json | null
          id: string
          program_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number
          diagnosis_result?: Json | null
          id?: string
          program_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number
          diagnosis_result?: Json | null
          id?: string
          program_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "block_progress_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "block_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "block_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          coach_id: string
          created_at: string
          duration_min: number
          id: string
          meeting_link: string | null
          notes: string | null
          price_paid: number | null
          session_date: string
          status: Database["public"]["Enums"]["booking_status"]
          user_id: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          duration_min?: number
          id?: string
          meeting_link?: string | null
          notes?: string | null
          price_paid?: number | null
          session_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          user_id: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          duration_min?: number
          id?: string
          meeting_link?: string | null
          notes?: string | null
          price_paid?: number | null
          session_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          available: boolean
          avatar_url: string | null
          bio: string | null
          calendly_url: string | null
          id: string
          name: string
          price_eur: number
          rating: number | null
          rating_count: number
          specialization: string[] | null
        }
        Insert: {
          available?: boolean
          avatar_url?: string | null
          bio?: string | null
          calendly_url?: string | null
          id?: string
          name: string
          price_eur: number
          rating?: number | null
          rating_count?: number
          specialization?: string[] | null
        }
        Update: {
          available?: boolean
          avatar_url?: string | null
          bio?: string | null
          calendly_url?: string | null
          id?: string
          name?: string
          price_eur?: number
          rating?: number | null
          rating_count?: number
          specialization?: string[] | null
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_accepted_answer: boolean
          is_coach_reply: boolean
          post_id: string
          upvotes: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_accepted_answer?: boolean
          is_coach_reply?: boolean
          post_id: string
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_accepted_answer?: boolean
          is_coach_reply?: boolean
          post_id?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category: Database["public"]["Enums"]["forum_category"]
          content: string
          created_at: string
          id: string
          is_answered: boolean
          is_pinned: boolean
          tags: string[] | null
          title: string
          updated_at: string
          upvotes: number
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["forum_category"]
          content: string
          created_at?: string
          id?: string
          is_answered?: boolean
          is_pinned?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
          upvotes?: number
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["forum_category"]
          content?: string
          created_at?: string
          id?: string
          is_answered?: boolean
          is_pinned?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_reactions: {
        Row: {
          comment_id: string | null
          id: string
          post_id: string | null
          type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          id?: string
          post_id?: string | null
          type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          comment_id?: string | null
          id?: string
          post_id?: string | null
          type?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          id: string
          last_active: string | null
          level: number
          name: string | null
          onboarding_completed: boolean
          position: Database["public"]["Enums"]["player_position"] | null
          streak_current: number
          streak_longest: number
          tier: Database["public"]["Enums"]["tier_level"]
          xp_points: number
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          id: string
          last_active?: string | null
          level?: number
          name?: string | null
          onboarding_completed?: boolean
          position?: Database["public"]["Enums"]["player_position"] | null
          streak_current?: number
          streak_longest?: number
          tier?: Database["public"]["Enums"]["tier_level"]
          xp_points?: number
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          last_active?: string | null
          level?: number
          name?: string | null
          onboarding_completed?: boolean
          position?: Database["public"]["Enums"]["player_position"] | null
          streak_current?: number
          streak_longest?: number
          tier?: Database["public"]["Enums"]["tier_level"]
          xp_points?: number
        }
        Relationships: []
      }
      task_completions: {
        Row: {
          completed_at: string
          id: string
          mood_after: number | null
          mood_before: number | null
          reflection_note: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          reflection_note?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          mood_after?: number | null
          mood_before?: number | null
          reflection_note?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category: Database["public"]["Enums"]["task_category"]
          created_at: string
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_min: number
          id: string
          instructions: string[] | null
          tier_required: Database["public"]["Enums"]["tier_level"]
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["task_category"]
          created_at?: string
          description?: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          duration_min: number
          id?: string
          instructions?: string[] | null
          tier_required?: Database["public"]["Enums"]["tier_level"]
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["task_category"]
          created_at?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          duration_min?: number
          id?: string
          instructions?: string[] | null
          tier_required?: Database["public"]["Enums"]["tier_level"]
          title?: string
        }
        Relationships: []
      }
      xp_log: {
        Row: {
          created_at: string
          id: string
          points: number
          reason: string | null
          source: Database["public"]["Enums"]["xp_source"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          reason?: string | null
          source: Database["public"]["Enums"]["xp_source"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reason?: string | null
          source?: Database["public"]["Enums"]["xp_source"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_xp: {
        Args: {
          _points: number
          _reason: string
          _source: Database["public"]["Enums"]["xp_source"]
          _user_id: string
        }
        Returns: undefined
      }
      check_and_update_streak: {
        Args: { _user_id: string }
        Returns: undefined
      }
      get_user_stats: { Args: { _user_id: string }; Returns: Json }
    }
    Enums: {
      block_category:
        | "form_loss"
        | "fear_of_failure"
        | "external_pressure"
        | "injury_return"
        | "concentration"
        | "identity_crisis"
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      difficulty_level: "easy" | "medium" | "hard"
      forum_category:
        | "question"
        | "experience"
        | "motivation"
        | "tip"
        | "challenge"
      notification_type:
        | "task_reminder"
        | "streak"
        | "new_reply"
        | "coaching_reminder"
        | "achievement"
      player_position:
        | "goalkeeper"
        | "defender"
        | "midfielder"
        | "striker"
        | "other"
      reaction_type: "upvote" | "fire" | "helpful" | "relatable"
      task_category:
        | "focus"
        | "confidence"
        | "pressure"
        | "team"
        | "recovery"
        | "visualization"
      tier_level: "free" | "pro" | "elite"
      xp_source:
        | "task"
        | "block_step"
        | "coaching"
        | "forum_post"
        | "forum_answer"
        | "streak_bonus"
        | "login"
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
      block_category: [
        "form_loss",
        "fear_of_failure",
        "external_pressure",
        "injury_return",
        "concentration",
        "identity_crisis",
      ],
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      difficulty_level: ["easy", "medium", "hard"],
      forum_category: [
        "question",
        "experience",
        "motivation",
        "tip",
        "challenge",
      ],
      notification_type: [
        "task_reminder",
        "streak",
        "new_reply",
        "coaching_reminder",
        "achievement",
      ],
      player_position: [
        "goalkeeper",
        "defender",
        "midfielder",
        "striker",
        "other",
      ],
      reaction_type: ["upvote", "fire", "helpful", "relatable"],
      task_category: [
        "focus",
        "confidence",
        "pressure",
        "team",
        "recovery",
        "visualization",
      ],
      tier_level: ["free", "pro", "elite"],
      xp_source: [
        "task",
        "block_step",
        "coaching",
        "forum_post",
        "forum_answer",
        "streak_bonus",
        "login",
      ],
    },
  },
} as const
