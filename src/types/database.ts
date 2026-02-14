export interface Profile {
  [key: string]: unknown;
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  stripe_customer_id: string | null;
  subscription_status: "active" | "trialing" | "past_due" | "canceled" | "free";
  subscription_plan: string | null;
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

export interface Client {
  [key: string]: unknown;
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface TemplateSection {
  type: string;
  title: string;
  prompt_hint: string;
}

export interface Template {
  [key: string]: unknown;
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  industry: "technology" | "design" | "marketing" | "consulting" | "content" | null;
  sections_schema: TemplateSection[];
  is_public: boolean;
  created_at: string;
}

export interface ProposalSection {
  type: string;
  title: string;
  content: string;
  order: number;
}

export interface PricingData {
  amount?: number;
  currency?: string;
  hourly_rate?: number;
  estimated_hours?: number;
  milestones?: { name: string; amount: number; due: string }[];
}

export interface BrandSettings {
  logo_url?: string;
  company_name?: string;
  primary_color?: string;
  secondary_color?: string;
}

export interface ProposalBrief {
  project_description: string;
  client_name?: string;
  client_company?: string;
  industry?: string;
  budget_range?: string;
  timeline?: string;
  special_requirements?: string;
}

export interface Proposal {
  [key: string]: unknown;
  id: string;
  user_id: string;
  client_id: string | null;
  template_id: string | null;
  title: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined";
  sections: ProposalSection[];
  pricing_type: "fixed" | "hourly" | "milestone" | null;
  pricing_data: PricingData;
  share_token: string | null;
  share_password: string | null;
  brand_settings: BrandSettings;
  valid_until: string | null;
  brief: ProposalBrief | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalEvent {
  [key: string]: unknown;
  id: string;
  proposal_id: string;
  event_type: "viewed" | "accepted" | "declined" | "commented";
  viewer_ip: string | null;
  viewer_ua: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ProposalComment {
  [key: string]: unknown;
  id: string;
  proposal_id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: Partial<Subscription> & { user_id: string; stripe_subscription_id: string; stripe_price_id: string };
        Update: Partial<Subscription>;
        Relationships: [];
      };
      clients: {
        Row: Client;
        Insert: Partial<Client> & { user_id: string; name: string };
        Update: Partial<Client>;
        Relationships: [];
      };
      templates: {
        Row: Template;
        Insert: Partial<Template> & { name: string; sections_schema: TemplateSection[] };
        Update: Partial<Template>;
        Relationships: [];
      };
      proposals: {
        Row: Proposal;
        Insert: Partial<Proposal> & { user_id: string; title: string };
        Update: Partial<Proposal>;
        Relationships: [];
      };
      proposal_events: {
        Row: ProposalEvent;
        Insert: Partial<ProposalEvent> & { proposal_id: string; event_type: string };
        Update: Partial<ProposalEvent>;
        Relationships: [];
      };
      proposal_comments: {
        Row: ProposalComment;
        Insert: Partial<ProposalComment> & { proposal_id: string; author_name: string; content: string };
        Update: Partial<ProposalComment>;
        Relationships: [];
      };
    };
    /* eslint-disable @typescript-eslint/no-empty-object-type */
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
    /* eslint-enable @typescript-eslint/no-empty-object-type */
  };
}
