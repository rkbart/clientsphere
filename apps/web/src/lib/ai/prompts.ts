import type { Contact, Deal, Company } from "@/types";

export const PROMPTS = {
  chat: (context: Record<string, unknown>) => `
You are a CRM assistant for ClientSphere. You have access to the user's contacts, deals, and activities.
Current context: ${JSON.stringify(context)}
Answer questions about their CRM data, suggest actions, and help manage relationships.
Be concise and actionable.`,

  draftEmail: (contact: Contact, purpose: string, context?: string) => `
Draft a professional ${purpose} email to ${contact.first_name} ${contact.last_name}.
${contact.email ? `Email: ${contact.email}` : ""}
${context ? `Context: ${context}` : ""}
Keep it concise, warm, and actionable.`,

  suggestNextAction: (record: Contact | Deal | Company) => `
Suggest the single best next action for this record.
Record: ${JSON.stringify(record)}
Return a brief, actionable suggestion.`,

  enrichCompany: (domain: string) => `
Analyze this company domain and return JSON with any information you can infer:
{"name": "...", "industry": "...", "size_range": "...", "description": "..."}
Domain: ${domain}`,

  summarizeDeal: (deal: Deal, activities: unknown[]) => `
Summarize this deal's progress and suggest next steps.
Deal: ${JSON.stringify(deal)}
Recent activities: ${JSON.stringify(activities)}
Be concise and actionable.`,

  scoreContact: (contact: Contact, company?: Company) => `
Score this contact's lead potential from 0-100 based on available information.
Contact: ${JSON.stringify(contact)}
${company ? `Company: ${JSON.stringify(company)` : ""}
Return JSON: {"score": number, "reasoning": "..."}`,
};
