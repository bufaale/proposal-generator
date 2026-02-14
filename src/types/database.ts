export interface Profile {
  [key: string]: unknown;
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_status: "active" | "trialing" | "past_due" | "canceled" | "free";
  subscription_plan: string | null;
  api_key: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  [key: string]: unknown;
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiUsage {
  [key: string]: unknown;
  id: string;
  user_id: string;
  tokens_used: number;
  model: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          [key: string]: unknown;
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: "active" | "trialing" | "past_due" | "canceled" | "free";
          subscription_plan?: string | null;
          api_key?: string | null;
          role?: "user" | "admin";
        };
        Update: {
          [key: string]: unknown;
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: "active" | "trialing" | "past_due" | "canceled" | "free";
          subscription_plan?: string | null;
          api_key?: string | null;
          role?: "user" | "admin";
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: {
          [key: string]: unknown;
          user_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
        };
        Update: {
          [key: string]: unknown;
          user_id?: string;
          stripe_subscription_id?: string;
          stripe_price_id?: string;
          status?: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | string;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_usage: {
        Row: AiUsage;
        Insert: {
          [key: string]: unknown;
          user_id: string;
          tokens_used: number;
          model: string;
        };
        Update: {
          [key: string]: unknown;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
