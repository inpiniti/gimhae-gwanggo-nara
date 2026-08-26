/**
 * Supabase Database 타입.
 * 원래는 `supabase gen types typescript --linked > types/supabase.ts` 로 생성한다.
 * 프로젝트 링크 전이라 supabase/migrations/0001_init.sql 기준으로 수기 작성 — 링크 후 반드시 재생성.
 */
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: { user_id: string; display_name: string; created_at: string };
        Insert: { user_id: string; display_name?: string; created_at?: string };
        Update: { user_id?: string; display_name?: string; created_at?: string };
        Relationships: [];
      };
      categories: {
        Row: { code: string; name: string; color: string; sort_order: number; is_active: boolean };
        Insert: { code: string; name: string; color?: string; sort_order?: number; is_active?: boolean };
        Update: { code?: string; name?: string; color?: string; sort_order?: number; is_active?: boolean };
        Relationships: [];
      };
      works: {
        Row: {
          id: string;
          slug: string;
          shop_name: string;
          phone: string | null;
          address: string;
          address_dong: string | null;
          lng: number;
          lat: number;
          summary: string | null;
          description: string | null;
          worked_at: string | null;
          is_published: boolean;
          consent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          shop_name: string;
          phone?: string | null;
          address: string;
          address_dong?: string | null;
          lng: number;
          lat: number;
          summary?: string | null;
          description?: string | null;
          worked_at?: string | null;
          is_published?: boolean;
          consent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["works"]["Insert"]>;
        Relationships: [];
      };
      work_categories: {
        Row: { work_id: string; category_code: string };
        Insert: { work_id: string; category_code: string };
        Update: { work_id?: string; category_code?: string };
        Relationships: [];
      };
      work_images: {
        Row: {
          id: string;
          work_id: string;
          path: string;
          alt: string | null;
          width: number | null;
          height: number | null;
          thumb_path: string | null;
          blurhash: string | null;
          sort_order: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          work_id: string;
          path: string;
          alt?: string | null;
          width?: number | null;
          height?: number | null;
          thumb_path?: string | null;
          blurhash?: string | null;
          sort_order?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["work_images"]["Insert"]>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          work_id: string;
          nickname: string;
          password_hash: string | null;
          body: string;
          is_owner: boolean;
          is_hidden: boolean;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          work_id: string;
          nickname: string;
          password_hash?: string | null;
          body: string;
          is_owner?: boolean;
          is_hidden?: boolean;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      works_public_list: {
        Row: {
          id: string;
          slug: string;
          shop_name: string;
          address: string;
          address_dong: string | null;
          lng: number;
          lat: number;
          summary: string | null;
          worked_at: string | null;
          cover_path: string | null;
          categories: string[];
        };
        Relationships: [];
      };
      comments_public: {
        Row: {
          id: string;
          work_id: string;
          nickname: string;
          body: string;
          is_owner: boolean;
          created_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      comment_rate_ok: { Args: { p_ip_hash: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];
export type { Json };
