/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProposalStatus {
  DRAFT = "draft",
  IN_REVIEW = "in_review",
  VERIFIED = "verified",
  SENT = "sent",
  VIEWED = "viewed",
  APPROVED = "approved",
  REJECTED = "rejected/stalled"
}

export enum InvoiceStatus {
  DRAFT = "draft",
  IN_REVIEW = "in_review",
  APPROVED = "approved",
  SENT = "sent",
  PAID = "paid"
}

export interface Client {
  id: string;
  name: string;
  contactName: string;
  email: string;
  whatsappNumber: string;
  optInConsent: boolean;
  address: string;
  createdAt: string;
}

export interface ProposalSection {
  title: string;
  content: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Proposal {
  id: string;
  clientId: string;
  templateId: string;
  title: string;
  sections: ProposalSection[];
  items: LineItem[];
  terms: string;
  status: ProposalStatus;
  createdBy: string;
  verifiedBy?: string;
  sentAt?: string;
  lastReminderAt?: string;
  reminderCount: number;
  createdAt: string;
}

export interface Detailing {
  id: string;
  proposalId: string;
  scope: string;
  schedule: string;
  resources: string;
  filledBy: string;
  filledAt: string;
}

export interface Invoice {
  id: string;
  proposalId: string;
  templateId: string;
  invoiceNumber: string;
  items: LineItem[];
  taxRate: number; // e.g. 0.08 for 8%
  discount: number; // flat discount in USD
  status: InvoiceStatus;
  authorizedBy?: string;
  authorizedAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface MessageLog {
  id: string;
  entityType: "proposal" | "invoice";
  entityId: string;
  channel: "email" | "whatsapp";
  direction: "outbound" | "inbound";
  status: "queued" | "sent" | "delivered" | "failed";
  timestamp: string;
  messageContent: string;
  providerMessageId?: string;
}

export interface AuditTrail {
  id: string;
  entityType: "proposal" | "invoice" | "client";
  entityId: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface BrandConfig {
  logoText: string;
  themeColor: "amber" | "teal" | "indigo" | "crimson" | "violet";
  fontFamily: "sans" | "mono" | "serif";
  logoUrl?: string;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  type: "proposal" | "invoice";
  sections: { title: string; defaultContent: string }[];
  defaultTerms: string;
  isActive: boolean;
  version: string;
}
