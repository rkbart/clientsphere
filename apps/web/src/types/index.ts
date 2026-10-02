export interface Account {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  account_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  created_at: string;
}

export interface Contact {
  id: string;
  account_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_id: string | null;
  owner_id: string | null;
  status: "lead" | "customer" | "churned";
  source: string;
  lead_score: number;
  score_reasons: string[];
  custom_data: Record<string, unknown>;
  discarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  account_id: string;
  name: string;
  domain: string;
  industry: string;
  size_range: string;
  annual_revenue: number;
  description: string;
  owner_id: string | null;
  custom_data: Record<string, unknown>;
  discarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pipeline {
  id: string;
  account_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stage {
  id: string;
  account_id: string;
  pipeline_id: string;
  name: string;
  position: number;
  color: string;
  probability: number;
  kind: "open" | "won" | "lost";
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  account_id: string;
  title: string;
  amount: number;
  currency: string;
  pipeline_id: string;
  stage_id: string;
  contact_id: string | null;
  company_id: string | null;
  owner_id: string | null;
  expected_close_date: string;
  probability: number;
  position: number;
  closed_at: string | null;
  custom_data: Record<string, unknown>;
  discarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  account_id: string;
  kind: "call" | "meeting" | "task" | "email" | "other";
  subject: string;
  description: string;
  contact_id: string | null;
  company_id: string | null;
  deal_id: string | null;
  creator_id: string;
  assignee_id: string | null;
  due_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  account_id: string;
  body: string;
  notable_type: string;
  notable_id: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  account_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CustomFieldDefinition {
  id: string;
  account_id: string;
  entity_type: string;
  key: string;
  label: string;
  field_type: string;
  options: Record<string, unknown>;
  required: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Automation {
  id: string;
  account_id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailSequence {
  id: string;
  account_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  account_id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiSetting {
  id: string;
  account_id: string;
  provider: string;
  model: string;
  base_url: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiConversation {
  id: string;
  account_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AiMessage {
  id: string;
  account_id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}
