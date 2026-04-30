/** Reference shape; replace with `supabase gen types typescript` output when you wire codegen. */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      spots: {
        Row: {
          id: string;
          latitude: number;
          longitude: number;
          place_label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          latitude: number;
          longitude: number;
          place_label?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          latitude?: number;
          longitude?: number;
          place_label?: string | null;
          created_at?: string;
        };
      };
      entries: {
        Row: {
          id: string;
          spot_id: string;
          user_id: string;
          title: string;
          body: string;
          photo_path: string | null;
          is_private: boolean;
          like_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          spot_id: string;
          user_id: string;
          title: string;
          body: string;
          photo_path?: string | null;
          is_private?: boolean;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          spot_id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          photo_path?: string | null;
          is_private?: boolean;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
