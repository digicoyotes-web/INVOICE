/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Client, 
  Proposal, 
  Detailing, 
  Invoice, 
  MessageLog, 
  AuditTrail, 
  ProposalTemplate, 
  BrandConfig, 
  ProposalStatus, 
  InvoiceStatus 
} from "./types";

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  logoText: "Vinshare Premium",
  themeColor: "amber",
  fontFamily: "sans"
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: "c1",
    name: "Stellar Horizon Ltd",
    contactName: "Marcus Sterling",
    email: "marcus.sterling@stellarhorizon.com",
    whatsappNumber: "+1 (555) 234-5678",
    optInConsent: true,
    address: "742 Evergreen Terrace, Suite 900, Austin, TX 78701",
    createdAt: "2026-07-01T10:00:00Z"
  },
  {
    id: "c2",
    name: "Nebula Ventures",
    contactName: "Evelyn Croft",
    email: "evelyn@nebulaventures.io",
    whatsappNumber: "+1 (555) 987-6543",
    optInConsent: true,
    address: "420 Silicon Alley, Floor 12, New York, NY 10010",
    createdAt: "2026-07-05T14:30:00Z"
  },
  {
    id: "c3",
    name: "Apex Cybernetics",
    contactName: "Dr. Aris Vance",
    email: "vance@apexcyber.co",
    whatsappNumber: "+1 (555) 456-7890",
    optInConsent: false,
    address: "101 Quantum Parkway, San Jose, CA 95110",
    createdAt: "2026-07-10T09:15:00Z"
  }
];

export const INITIAL_TEMPLATES: ProposalTemplate[] = [
  {
    id: "pt1",
    name: "Premium Software Engineering & DevOps",
    type: "proposal",
    isActive: true,
    version: "2.4",
    sections: [
      {
        title: "Executive Summary",
        defaultContent: "We propose to design, architect, and deploy a secure, highly scalable, and containerized Cloud system customized to elevate your enterprise workflow. Our solution guarantees 99.99% availability, native auto-scaling, and pristine performance tracking."
      },
      {
        title: "The Problem",
        defaultContent: "Legacy infrastructure is causing high cold-start latencies, excessive server run costs, and visual inconsistencies during deployment. Siloed workflows prevent rapid iteration and lack proper monitoring metrics."
      },
      {
        title: "Proposed Solution",
        defaultContent: "A fully custom full-stack React + Express dashboard deployed on secure container nodes. The application will leverage real-time API integrations, resilient state persistence, and automated background jobs to guarantee continuous synchronization."
      },
      {
        title: "Deliverables",
        defaultContent: "• High-fidelity responsive dashboard UI\n• Robust server-side proxy handlers with lazy integration\n• Automated reminders & notification system\n• Full compliance audit and deployment handbook"
      },
      {
        title: "Timeline & Milestones",
        defaultContent: "• Week 1-2: Brand styling, UI mockup, and state engine verification\n• Week 3-4: Secure API development and multi-channel notification integration\n• Week 5: Quality Assurance, detailing metrics, and production deployment"
      }
    ],
    defaultTerms: "Payment terms are 40% upfront on proposal verification, 30% on completion of Week 3, and 30% upon final sign-off. All custom source files and intellectual property will be transferred upon final invoice settlement."
  },
  {
    id: "pt2",
    name: "Creative Branding & Website Design",
    type: "proposal",
    isActive: true,
    version: "1.1",
    sections: [
      {
        title: "Executive Summary",
        defaultContent: "Transform your visual brand identity with an elegant, modern, and highly tactile design system. We focus on premium typography, smooth fluid animations, and custom 3D micro-interactions to deliver absolute user engagement."
      },
      {
        title: "The Problem",
        defaultContent: "The current website feels static, lacking cohesive brand aesthetics, interactive physical feel, and modern scrolling dimensions. Users leave quickly because of flat presentation and poor kinetic response."
      },
      {
        title: "Proposed Solution",
        defaultContent: "A brand overhaul centered around custom typographic pairings (Inter & JetBrains Mono), smooth parallax coordinate scroll mechanisms, organic motion layouts, and a dark Obsidian theme with warm amber accents."
      },
      {
        title: "Deliverables",
        defaultContent: "• Dynamic custom website layout with 3D-like parallax effects\n• Reusable component library\n• Fully animated SVG assets\n• Comprehensive digital style guide"
      },
      {
        title: "Timeline & Milestones",
        defaultContent: "• Week 1: Identity audit and high-contrast styling guides\n• Week 2-3: Kinetic layout assembly and asset rendering\n• Week 4: Multi-device testing, speed optimization, and launch"
      }
    ],
    defaultTerms: "Creative work requires 50% deposit to initiate scope, with the remaining 50% due post-deployment review. Two rounds of major design revisions are included."
  }
];

export const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: "p1",
    clientId: "c1",
    templateId: "pt1",
    title: "Stellar Cloud Transformation Strategy",
    sections: [
      {
        title: "Executive Summary",
        content: "Deploying a state-of-the-art container infrastructure for Stellar Horizon Ltd to support high-velocity transactions."
      },
      {
        title: "The Problem",
        content: "Stellar's older API server cannot handle spikes during trade peaks, experiencing 3.4-second response lag."
      },
      {
        title: "Proposed Solution",
        content: "Implementing an Express proxy architecture with modern microservices and beautiful dashboard metrics."
      },
      {
        title: "Deliverables",
        content: "• Scalable backend cluster\n• Real-time transactional telemetry panels\n• Interactive alerts panel"
      },
      {
        title: "Timeline & Milestones",
        content: "• Phase 1: Prototype delivery (10 days)\n• Phase 2: Live staging & verification (15 days)\n• Phase 3: Launch & handover (5 days)"
      }
    ],
    items: [
      { id: "i1", description: "Architecture Design & Cloud Auditing", quantity: 1, price: 4500 },
      { id: "i2", description: "Vite + Express Proxy Node Integration", quantity: 1, price: 9200 },
      { id: "i3", description: "Multi-Channel SMS & WhatsApp API Bridge", quantity: 1, price: 2800 }
    ],
    terms: "Payment terms: Net 15 days upon invoice. 30% upfront requirement. Standard SLAs apply.",
    status: ProposalStatus.APPROVED,
    createdBy: "Sarah Jenkins (Senior Strategist)",
    verifiedBy: "Alex Wong (Operations Director)",
    sentAt: "2026-07-02T11:00:00Z",
    reminderCount: 0,
    createdAt: "2026-07-01T11:20:00Z"
  },
  {
    id: "p2",
    clientId: "c2",
    templateId: "pt2",
    title: "Nebula Cinematic Identity Overhaul",
    sections: [
      {
        title: "Executive Summary",
        content: "Re-imagining Nebula Ventures' corporate presence through an elegant, highly interactive dark canvas."
      },
      {
        title: "The Problem",
        content: "The current interface lacks depth, feeling flat and failing to demonstrate their technological sophistication."
      },
      {
        title: "Proposed Solution",
        content: "A professional parallax website using 'motion' layout engines, elegant typographic grids, and glassmorphic card widgets."
      },
      {
        title: "Deliverables",
        content: "• Parallax homepage deck\n• 3D hover-state visual dashboard\n• Interactive investment portal"
      },
      {
        title: "Timeline & Milestones",
        content: "• Week 1-2: Style guide & assets (Completed)\n• Week 3-4: Scroll orchestration & interactions (In Progress)"
      }
    ],
    items: [
      { id: "i4", description: "Kinetic Interactive UI and Parallax Core", quantity: 1, price: 6800 },
      { id: "i5", description: "Custom Typography Pairing & Design Tokens", quantity: 1, price: 2500 },
      { id: "i6", description: "Fluid Motion-dom Animations", quantity: 1, price: 3200 }
    ],
    terms: "50% deposit required. Digital handoff via private secure repo.",
    status: ProposalStatus.SENT,
    createdBy: "Sarah Jenkins (Senior Strategist)",
    sentAt: "2026-07-13T09:00:00Z",
    lastReminderAt: "2026-07-14T09:00:00Z",
    reminderCount: 1,
    createdAt: "2026-07-12T16:45:00Z"
  },
  {
    id: "p3",
    clientId: "c3",
    templateId: "pt1",
    title: "Apex Automation Pipeline Setup",
    sections: [
      {
        title: "Executive Summary",
        content: "Automation draft for Apex Cybernetics' robotics scheduling hub."
      },
      {
        title: "The Problem",
        content: "Human dispatchers struggle to coordinate shifts across multiple timezones."
      },
      {
        title: "Proposed Solution",
        content: "Automated cron scheduling layout with persistent queue states."
      },
      {
        title: "Deliverables",
        content: "• Cron engine wrapper\n• Dashboard interface"
      },
      {
        title: "Timeline & Milestones",
        content: "• 3-week delivery path."
      }
    ],
    items: [
      { id: "i7", description: "Automated Job Pipeline Engine", quantity: 1, price: 12000 },
      { id: "i8", description: "Role-Gated Management Controls", quantity: 1, price: 4000 }
    ],
    terms: "Net 30. Ownership transfers after final payment clearance.",
    status: ProposalStatus.DRAFT,
    createdBy: "Sarah Jenkins",
    reminderCount: 0,
    createdAt: "2026-07-14T06:30:00Z"
  }
];

export const INITIAL_DETAILINGS: Detailing[] = [
  {
    id: "det1",
    proposalId: "p1",
    scope: "Architect AWS EKS container endpoints. Integrate express middleware and optimize React state rerenders.",
    schedule: "Milestone A: Aug 1 (UX prototype). Milestone B: Aug 15 (EKS Staging). Milestone C: Aug 25 (Production Launch).",
    resources: "Sarah Jenkins (Project Manager), Aris Vance (Cloud Architect), Evelyn Croft (Security Engineer).",
    filledBy: "Alex Wong (Operations Director)",
    filledAt: "2026-07-03T14:22:00Z"
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv1",
    proposalId: "p1",
    templateId: "pt1",
    invoiceNumber: "INV-2026-0001",
    items: [
      { id: "i1", description: "Architecture Design & Cloud Auditing", quantity: 1, price: 4500 },
      { id: "i2", description: "Vite + Express Proxy Node Integration", quantity: 1, price: 9200 },
      { id: "i3", description: "Multi-Channel SMS & WhatsApp API Bridge", quantity: 1, price: 2800 }
    ],
    taxRate: 0.0825, // 8.25% Texas tax
    discount: 500, // $500 loyal client discount
    status: InvoiceStatus.IN_REVIEW,
    authorizedBy: "Elenore Fitz (Head of Finance)",
    authorizedAt: "2026-07-04T10:30:00Z",
    createdAt: "2026-07-04T10:30:00Z"
  }
];

export const INITIAL_MESSAGE_LOGS: MessageLog[] = [
  {
    id: "ml1",
    entityType: "proposal",
    entityId: "p1",
    channel: "email",
    direction: "outbound",
    status: "delivered",
    timestamp: "2026-07-02T11:00:15Z",
    messageContent: "To: marcus.sterling@stellarhorizon.com\nSubject: Stellar Cloud Transformation Strategy Proposal\n\nDear Marcus, your digital transformation proposal is verified and ready for review.",
    providerMessageId: "sg-msg-839210-stellar"
  },
  {
    id: "ml2",
    entityType: "proposal",
    entityId: "p1",
    channel: "whatsapp",
    direction: "outbound",
    status: "delivered",
    timestamp: "2026-07-02T11:01:02Z",
    messageContent: "To: +1 (555) 234-5678\nTemplate Name: proposal_ready_notice\nLanguage: English\nBody: Hello Marcus! Your proposal 'Stellar Cloud Transformation Strategy' is available for review.",
    providerMessageId: "wa-mid-92840-stellar"
  },
  {
    id: "ml3",
    entityType: "proposal",
    entityId: "p2",
    channel: "email",
    direction: "outbound",
    status: "delivered",
    timestamp: "2026-07-13T09:00:12Z",
    messageContent: "To: evelyn@nebulaventures.io\nSubject: Nebula Cinematic Overhaul Proposal\n\nHi Evelyn, please find our branding proposal enclosed.",
    providerMessageId: "sg-msg-192801-nebula"
  },
  {
    id: "ml4",
    entityType: "proposal",
    entityId: "p2",
    channel: "whatsapp",
    direction: "outbound",
    status: "delivered",
    timestamp: "2026-07-13T09:01:40Z",
    messageContent: "To: +1 (555) 987-6543\nTemplate: proposal_ready_notice\nBody: Hello Evelyn! Your branding overhaul proposal is ready.",
    providerMessageId: "wa-mid-01928-nebula"
  },
  {
    id: "ml5",
    entityType: "proposal",
    entityId: "p2",
    channel: "whatsapp",
    direction: "outbound",
    status: "delivered",
    timestamp: "2026-07-14T09:00:00Z",
    messageContent: "To: +1 (555) 987-6543\nTemplate: follow_up_reminder_24h\nBody: Hi Evelyn, this is a friendly reminder that the 'Nebula Cinematic Overhaul' proposal is awaiting approval.",
    providerMessageId: "wa-mid-83912-nebula-reminder"
  }
];

export const INITIAL_AUDIT_TRAILS: AuditTrail[] = [
  {
    id: "au1",
    entityType: "proposal",
    entityId: "p1",
    action: "PROPOSAL_CREATED",
    user: "Sarah Jenkins (Senior Strategist)",
    timestamp: "2026-07-01T11:20:00Z",
    details: "Created draft proposal 'Stellar Cloud Transformation Strategy' for Stellar Horizon Ltd."
  },
  {
    id: "au2",
    entityType: "proposal",
    entityId: "p1",
    action: "PROPOSAL_VERIFIED",
    user: "Alex Wong (Operations Director)",
    timestamp: "2026-07-02T10:45:00Z",
    details: "Verified technical accuracy and line pricing of the proposal. Status changed draft -> verified."
  },
  {
    id: "au3",
    entityType: "proposal",
    entityId: "p1",
    action: "PROPOSAL_DISPATCHED",
    user: "Alex Wong (Operations Director)",
    timestamp: "2026-07-02T11:01:02Z",
    details: "Dispatched proposal via both Email and WhatsApp channels."
  },
  {
    id: "au4",
    entityType: "proposal",
    entityId: "p1",
    action: "CLIENT_APPROVED",
    user: "System (Webhook Integration)",
    timestamp: "2026-07-03T09:12:00Z",
    details: "Marcus Sterling approved proposal 'Stellar Cloud Transformation Strategy' online. Gated to Stage 3 Detailing."
  },
  {
    id: "au5",
    entityType: "proposal",
    entityId: "p1",
    action: "PROPOSAL_DETAILED",
    user: "Alex Wong (Operations Director)",
    timestamp: "2026-07-03T14:22:00Z",
    details: "Operations detailing (scope, resource, timeline metrics) submitted."
  },
  {
    id: "au6",
    entityType: "invoice",
    entityId: "inv1",
    action: "INVOICE_AUTHORIZED",
    user: "Elenore Fitz (Head of Finance)",
    timestamp: "2026-07-04T10:30:00Z",
    details: "Authorized and generated invoice sequential number INV-2026-0001 from active DevOps template merge-fields."
  }
];
