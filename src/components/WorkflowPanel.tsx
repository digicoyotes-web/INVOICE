import React, { useState } from "react";
import { Proposal, Invoice, Client, Detailing, MessageLog, AuditTrail, ProposalStatus, InvoiceStatus, LineItem } from "../types";
import { 
  GitCommit, CheckCircle2, Send, Clock, UserCheck, Shield, FileSignature, 
  Mail, MessageSquare, Plus, AlertCircle, Sparkles, Receipt, RefreshCw, 
  Printer, ArrowRight, User, HelpCircle, AlertTriangle, Download, FileText, CheckSquare, Square 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WorkflowPanelProps {
  proposals: Proposal[];
  invoices: Invoice[];
  clients: Client[];
  detailings: Detailing[];
  messageLogs: MessageLog[];
  auditTrails: AuditTrail[];
  onUpdateProposal: (p: Proposal) => void;
  onUpdateInvoice: (i: Invoice) => void;
  onAddDetailing: (det: Detailing) => void;
  onAddMessageLog: (log: MessageLog) => void;
  onAddAuditTrail: (trail: AuditTrail) => void;
  brandColors: { bg: string; text: string; border: string; glow: string };
  onOpenPrintPreview: (type: "proposal" | "invoice", id: string) => void;
  // Controlled selection props from global search
  parentSelectedProposalId?: string;
  onSelectProposalId?: (id: string) => void;
  parentActiveStageTab?: "stage1" | "stage2" | "stage3" | "stage4";
  onSelectStageTab?: (tab: "stage1" | "stage2" | "stage3" | "stage4") => void;
}

export default function WorkflowPanel({
  proposals,
  invoices,
  clients,
  detailings,
  messageLogs,
  auditTrails,
  onUpdateProposal,
  onUpdateInvoice,
  onAddDetailing,
  onAddMessageLog,
  onAddAuditTrail,
  brandColors,
  onOpenPrintPreview,
  parentSelectedProposalId,
  onSelectProposalId,
  parentActiveStageTab,
  onSelectStageTab,
}: WorkflowPanelProps) {
  const [selectedProposalId, setSelectedProposalId] = useState<string>(proposals[0]?.id || "");
  const [isFinanceRole, setIsFinanceRole] = useState(false);
  const [activeStageTab, setActiveStageTab] = useState<"stage1" | "stage2" | "stage3" | "stage4">("stage1");

  // Sync with parent props (e.g. from global search)
  React.useEffect(() => {
    if (parentSelectedProposalId) {
      setSelectedProposalId(parentSelectedProposalId);
    }
  }, [parentSelectedProposalId]);

  React.useEffect(() => {
    if (parentActiveStageTab) {
      setActiveStageTab(parentActiveStageTab);
    }
  }, [parentActiveStageTab]);

  // Wrapped state setters to keep parent in sync
  const handleSelectProposalId = (id: string) => {
    setSelectedProposalId(id);
    if (onSelectProposalId) onSelectProposalId(id);
  };

  const handleSelectStageTab = (tab: "stage1" | "stage2" | "stage3" | "stage4") => {
    setActiveStageTab(tab);
    if (onSelectStageTab) onSelectStageTab(tab);
  };

  // Local inputs for Detailing
  const [scopeText, setScopeText] = useState("");
  const [scheduleText, setScheduleText] = useState("");
  const [resourcesText, setResourcesText] = useState("");

  // Bulk Registry and Selection States
  const [activeLayoutMode, setActiveLayoutMode] = useState<"pipeline" | "registry">("pipeline");
  const [selectedProposalIds, setSelectedProposalIds] = useState<string[]>([]);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // AI Insight states
  const [insightText, setInsightText] = useState("");
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [insightProposalId, setInsightProposalId] = useState("");

  const toggleSelectProposal = (id: string) => {
    setSelectedProposalIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllProposals = () => {
    if (selectedProposalIds.length === proposals.length) {
      setSelectedProposalIds([]);
    } else {
      setSelectedProposalIds(proposals.map((p) => p.id));
    }
  };

  const toggleSelectInvoice = (id: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllInvoices = () => {
    if (selectedInvoiceIds.length === invoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(invoices.map((inv) => inv.id));
    }
  };

  const selectedProposal = proposals.find((p) => p.id === selectedProposalId);

  React.useEffect(() => {
    if (!selectedProposal || selectedProposal.status !== ProposalStatus.IN_REVIEW) {
      setInsightText("");
      setInsightProposalId("");
      return;
    }

    if (insightProposalId === selectedProposal.id) return; // Already generated

    const generateInsight = async () => {
      setIsGeneratingInsight(true);
      setInsightProposalId(selectedProposal.id);
      try {
        const res = await fetch("/api/generate-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: selectedProposal.title,
            sections: selectedProposal.sections,
            items: selectedProposal.items
          })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to generate AI insight");
        }
        const data = await res.json();
        setInsightText(data.insight);
      } catch (err: any) {
        console.error(err);
        setInsightText("Failed to load AI Insight. " + (err.message || ""));
      } finally {
        setIsGeneratingInsight(false);
      }
    };

    generateInsight();
  }, [selectedProposal]);

  const handleDownloadBulkZip = async () => {
    if (selectedProposalIds.length === 0 && selectedInvoiceIds.length === 0) {
      alert("Please select at least one proposal or invoice to export.");
      return;
    }
    setIsExportingZip(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // 1. Process selected proposals
      selectedProposalIds.forEach((pid) => {
        const p = proposals.find((item) => item.id === pid);
        if (!p) return;
        const client = clients.find((c) => c?.id === p.clientId);
        const clientName = client ? client.name : "Unknown Client";
        const subtotal = p.items.reduce((s, item) => s + (item.quantity * item.price), 0);

        // Generate print-ready HTML page
        const proposalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${p.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; background-color: #ffffff; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: bold; color: #f59e0b; }
    .title { font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #0f172a; }
    .metadata { margin-bottom: 30px; font-size: 14px; color: #64748b; }
    .client-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; color: #334155; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }
    .section-content { font-size: 14px; margin-bottom: 20px; color: #475569; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 13px; font-weight: bold; color: #475569; border-bottom: 2px solid #cbd5e1; }
    td { padding: 12px; font-size: 13px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    .total-row { font-weight: bold; font-size: 15px; }
    .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">VINSHARE AUTOMATION</div>
    <div>PROPOSAL DOCUMENT</div>
  </div>
  
  <div class="title">${p.title}</div>
  <div class="metadata">
    <strong>Proposal ID:</strong> ${p.id}<br>
    <strong>Created Date:</strong> ${new Date(p.createdAt).toLocaleDateString()}<br>
    <strong>Status:</strong> ${p.status.toUpperCase()}
  </div>

  <div class="client-box">
    <strong>Client Entity Details:</strong><br>
    Company: ${clientName}<br>
    Primary Contact: ${client ? client.contactName : "N/A"}<br>
    Email: ${client ? client.email : "N/A"}<br>
    WhatsApp: ${client ? client.whatsappNumber : "N/A"}<br>
    Address: ${client ? client.address : "N/A"}
  </div>

  ${p.sections.map((sec) => `
    <div class="section-title">${sec.title}</div>
    <div class="section-content">${sec.content.replace(/\n/g, '<br>')}</div>
  `).join('')}

  <div class="section-title">Pricing Line Items Breakdown</div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Total Price</th>
      </tr>
    </thead>
    <tbody>
      ${p.items.map((it) => `
        <tr>
          <td>${it.description}</td>
          <td>${it.quantity}</td>
          <td>$${it.price.toLocaleString()}</td>
          <td>$${(it.quantity * it.price).toLocaleString()}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="3" style="text-align: right;">Grand Total:</td>
        <td>$${subtotal.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">Terms & Conditions</div>
  <div class="section-content">${p.terms ? p.terms.replace(/\n/g, '<br>') : "Standard enterprise corporate net terms apply."}</div>

  <div class="footer">
    This automated business document is officially verified and closed under Vinshare Automation Systems.
  </div>
</body>
</html>
        `;
        zip.file(`Proposal-${p.id}-${clientName.replace(/\s+/g, '_')}.html`, proposalHtml);
      });

      // 2. Process selected invoices
      selectedInvoiceIds.forEach((iid) => {
        const inv = invoices.find((item) => item.id === iid);
        if (!inv) return;
        const p = proposals.find((prop) => prop.id === inv.proposalId);
        const client = p ? clients.find((c) => c?.id === p.clientId) : null;
        const clientName = client ? client.name : "Unknown Client";

        const subtotal = inv.items.reduce((sum, it) => sum + (it.quantity * it.price), 0);
        const taxAmount = Math.floor(subtotal * inv.taxRate);
        const grandTotal = subtotal - inv.discount + taxAmount;

        const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${inv.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; background-color: #ffffff; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; }
    .title { font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #0f172a; }
    .metadata { margin-bottom: 30px; font-size: 14px; color: #64748b; }
    .client-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; color: #334155; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 13px; font-weight: bold; color: #475569; border-bottom: 2px solid #cbd5e1; }
    td { padding: 12px; font-size: 13px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    .total-row { font-size: 13px; color: #475569; }
    .grand-total { font-weight: bold; font-size: 16px; color: #0f172a; border-top: 2px solid #cbd5e1; }
    .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">VINSHARE AUTOMATION</div>
    <div>TAX-COMPLIANT INVOICE</div>
  </div>
  
  <div class="title">Invoice: ${inv.invoiceNumber}</div>
  <div class="metadata">
    <strong>Invoice ID:</strong> ${inv.id}<br>
    <strong>Proposal Ref ID:</strong> ${inv.proposalId}<br>
    <strong>Authorized By:</strong> ${inv.authorizedBy || "N/A"}<br>
    <strong>Created Date:</strong> ${new Date(inv.createdAt).toLocaleDateString()}<br>
    <strong>Status:</strong> ${inv.status.toUpperCase()}
  </div>

  <div class="client-box">
    <strong>Client Entity Details:</strong><br>
    Company: ${clientName}<br>
    Primary Contact: ${client ? client.contactName : "N/A"}<br>
    Email: ${client ? client.email : "N/A"}<br>
    WhatsApp: ${client ? client.whatsappNumber : "N/A"}<br>
    Address: ${client ? client.address : "N/A"}
  </div>

  <div class="section-title">Invoiced Items Breakdown</div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Total Price</th>
      </tr>
    </thead>
    <tbody>
      ${inv.items.map((it) => `
        <tr>
          <td>${it.description}</td>
          <td>${it.quantity}</td>
          <td>$${it.price.toLocaleString()}</td>
          <td>$${(it.quantity * it.price).toLocaleString()}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="3" style="text-align: right;">Subtotal:</td>
        <td>$${subtotal.toLocaleString()}</td>
      </tr>
      <tr class="total-row">
        <td colspan="3" style="text-align: right;">Discount (Applied):</td>
        <td>-$${inv.discount.toLocaleString()}</td>
      </tr>
      <tr class="total-row">
        <td colspan="3" style="text-align: right;">Tax Rate (8.25%):</td>
        <td>+$${taxAmount.toLocaleString()}</td>
      </tr>
      <tr class="total-row grand-total">
        <td colspan="3" style="text-align: right;">Grand Settlement Total:</td>
        <td>$${grandTotal.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    This invoice is tax-compliant, officially authorized, and closes the matching proposal document lifecycle.
  </div>
</body>
</html>
        `;
        zip.file(`Invoice-${inv.invoiceNumber}-${clientName.replace(/\s+/g, '_')}.html`, invoiceHtml);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `vinshare_documents_export_${Date.now()}.zip`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error building exported ZIP bundle.");
    } finally {
      setIsExportingZip(false);
    }
  };

  const selectedClient = clients.find((c) => c?.id === selectedProposal?.clientId);
  const selectedDetailing = detailings.find((d) => d.proposalId === selectedProposalId);
  const selectedInvoice = invoices.find((i) => i.proposalId === selectedProposalId);

  // Message Logs specific to selected proposal/invoice
  const relatedLogs = messageLogs.filter(
    (log) => 
      (log.entityType === "proposal" && log.entityId === selectedProposalId) ||
      (log.entityType === "invoice" && selectedInvoice && log.entityId === selectedInvoice.id)
  );

  // Audit Trails specific to selected proposal/invoice
  const relatedAudits = auditTrails.filter(
    (a) => 
      (a.entityType === "proposal" && a.entityId === selectedProposalId) ||
      (a.entityType === "invoice" && selectedInvoice && a.entityId === selectedInvoice.id)
  );

  // Transition logs helper
  const logAudit = (entityType: "proposal" | "invoice", entityId: string, action: string, details: string) => {
    const newAudit: AuditTrail = {
      id: "au_" + Date.now(),
      entityType,
      entityId,
      action,
      user: isFinanceRole ? "Finance Auditor" : "Alex Wong (Operations Director)",
      timestamp: new Date().toISOString(),
      details,
    };
    onAddAuditTrail(newAudit);
  };

  const logMessage = (entityType: "proposal" | "invoice", entityId: string, channel: "email" | "whatsapp", content: string) => {
    const newLog: MessageLog = {
      id: "ml_" + Date.now(),
      entityType,
      entityId,
      channel,
      direction: "outbound",
      status: "delivered",
      timestamp: new Date().toISOString(),
      messageContent: content,
      providerMessageId: `${channel === "email" ? "sg" : "wa"}-msg-${Math.floor(Math.random() * 900000) + 100000}`,
    };
    onAddMessageLog(newLog);
  };

  // Stage 1 Actions
  const handleVerifyProposal = () => {
    if (!selectedProposal) return;
    const updated = { 
      ...selectedProposal, 
      status: ProposalStatus.VERIFIED,
      verifiedBy: isFinanceRole ? "Elenore Fitz (Finance)" : "Alex Wong (Ops)"
    };
    onUpdateProposal(updated);
    logAudit("proposal", selectedProposal.id, "PROPOSAL_VERIFIED", `Proposal verified to status: verified. Authorized by ${updated.verifiedBy}.`);
  };

  const handleNeedsRevision = () => {
    if (!selectedProposal) return;
    const updated = { ...selectedProposal, status: ProposalStatus.IN_REVIEW };
    onUpdateProposal(updated);
    logAudit("proposal", selectedProposal.id, "REVISION_REQUESTED", "Returned proposal state to in_review. Internal revision flag enabled.");
  };

  // Stage 2 Actions (Multi-channel dispatch)
  const handleSendProposal = () => {
    if (!selectedProposal || !selectedClient) return;
    const updated = { ...selectedProposal, status: ProposalStatus.SENT, sentAt: new Date().toISOString() };
    onUpdateProposal(updated);

    // Send mock Email & WhatsApp at once
    logMessage(
      "proposal",
      selectedProposal.id,
      "email",
      `To: ${selectedClient.email}\nSubject: ${selectedProposal.title} for Review\n\nDear ${selectedClient.contactName},\nYour proposal is verified and available for your authorized signature.`
    );
    logMessage(
      "proposal",
      selectedProposal.id,
      "whatsapp",
      `To: ${selectedClient.whatsappNumber}\nTemplate: proposal_ready_notice\nBody: Hello ${selectedClient.contactName}! Your automated proposal is verified. Review here.`
    );

    logAudit("proposal", selectedProposal.id, "PROPOSAL_DISPATCHED", "Fired simultaneous dispatch channels: Email & WhatsApp logged as delivered.");
  };

  // Reminders triggers (Simulates 24-hour automated cadences)
  const handleTriggerReminder = () => {
    if (!selectedProposal || !selectedClient) return;
    const updated = {
      ...selectedProposal,
      reminderCount: selectedProposal.reminderCount + 1,
      lastReminderAt: new Date().toISOString(),
    };
    onUpdateProposal(updated);

    logMessage(
      "proposal",
      selectedProposal.id,
      "whatsapp",
      `To: ${selectedClient.whatsappNumber}\nTemplate: follow_up_reminder_24h\nBody: Hi ${selectedClient.contactName}, your proposal '${selectedProposal.title}' is pending approval. (Reminder #${updated.reminderCount})`
    );

    logAudit("proposal", selectedProposal.id, "REMINDER_SENT", `24h Automated reminder dispatch #${updated.reminderCount} triggered successfully.`);
  };

  // Client simulated action
  const handleSimulateClientAction = (action: "approve" | "reject" | "view") => {
    if (!selectedProposal) return;
    let nextStatus = ProposalStatus.SENT;
    if (action === "approve") nextStatus = ProposalStatus.APPROVED;
    if (action === "reject") nextStatus = ProposalStatus.REJECTED;
    if (action === "view") nextStatus = ProposalStatus.VIEWED;

    const updated = { ...selectedProposal, status: nextStatus };
    onUpdateProposal(updated);

    logAudit("proposal", selectedProposal.id, "CLIENT_RESPONSE", `Client simulated action: ${action.toUpperCase()}. Status updated -> ${nextStatus}.`);
  };

  // Stage 3 Actions: Manual Detailing
  const handleSaveDetailing = () => {
    if (!selectedProposal) return;
    if (!scopeText || !scheduleText) return;

    const newDetailing: Detailing = {
      id: "det_" + Date.now(),
      proposalId: selectedProposal.id,
      scope: scopeText,
      schedule: scheduleText,
      resources: resourcesText || "General Team Allocation",
      filledBy: isFinanceRole ? "Elenore Fitz (Finance)" : "Alex Wong (Operations Director)",
      filledAt: new Date().toISOString(),
    };
    onAddDetailing(newDetailing);

    logAudit("proposal", selectedProposal.id, "PROPOSAL_DETAILED", "Ops manual detailing completed. Gated 'Authorize Invoice' action unlocked.");
    
    // Clear inputs
    setScopeText("");
    setScheduleText("");
    setResourcesText("");
  };

  const handleAuthorizeInvoice = () => {
    if (!selectedProposal) return;
    if (!isFinanceRole) return; // Role gated!

    const count = invoices.length + 1;
    const invNumber = `INV-2026-000${count}`;

    const newInvoice: Invoice = {
      id: "inv_" + Date.now(),
      proposalId: selectedProposal.id,
      templateId: selectedProposal.templateId,
      invoiceNumber: invNumber,
      items: selectedProposal.items.map((it) => ({ ...it })),
      taxRate: 0.0825, // Texas flat tax
      discount: 250, // standard promotional discount
      status: InvoiceStatus.DRAFT,
      createdAt: new Date().toISOString(),
    };
    onUpdateInvoice(newInvoice);

    logAudit("invoice", newInvoice.id, "INVOICE_AUTHORIZED", `Authorized Invoice generation: ${invNumber}. Financial controls unlocked.`);
  };

  // Stage 4 Actions: Invoice Lifecycle
  const handleInvoiceSubmitForReview = () => {
    if (!selectedInvoice) return;
    const updated = { ...selectedInvoice, status: InvoiceStatus.IN_REVIEW };
    onUpdateInvoice(updated);
    logAudit("invoice", selectedInvoice.id, "INVOICE_SUBMITTED_FOR_REVIEW", "Invoice submitted to Internal Review stage.");
  };

  const handleInvoiceNeedsRevision = () => {
    if (!selectedInvoice) return;
    const updated = { ...selectedInvoice, status: InvoiceStatus.DRAFT };
    onUpdateInvoice(updated);
    logAudit("invoice", selectedInvoice.id, "INVOICE_REVISION_REQUESTED", "Invoice returned to Draft status for revision.");
  };

  const handleApproveInvoice = () => {
    if (!selectedInvoice) return;
    const updated = { ...selectedInvoice, status: InvoiceStatus.APPROVED, authorizedBy: "Elenore Fitz (Head of Finance)" };
    onUpdateInvoice(updated);

    logAudit("invoice", selectedInvoice.id, "INVOICE_VERIFIED", "Invoice reviewed & verified. State changed in_review -> approved. Ready to send.");
  };

  const handleSendInvoice = () => {
    if (!selectedInvoice || !selectedClient) return;
    const updated = { ...selectedInvoice, status: InvoiceStatus.SENT, sentAt: new Date().toISOString() };
    onUpdateInvoice(updated);

    logMessage(
      "invoice",
      selectedInvoice.id,
      "email",
      `To: ${selectedClient.email}\nSubject: Invoice ${selectedInvoice.invoiceNumber} from Vinshare\n\nDear Marcus, your invoice is authorized and attached for your convenience.`
    );
    logMessage(
      "invoice",
      selectedInvoice.id,
      "whatsapp",
      `To: ${selectedClient.whatsappNumber}\nTemplate: invoice_ready_notice\nBody: Hello Marcus! Your authorized invoice ${selectedInvoice.invoiceNumber} is ready. Complete payment here.`
    );

    logAudit("invoice", selectedInvoice.id, "INVOICE_DISPATCHED", `Invoice ${selectedInvoice.invoiceNumber} dispatched via both email + WhatsApp.`);
  };

  const handlePayInvoice = () => {
    if (!selectedInvoice) return;
    const updated = { ...selectedInvoice, status: InvoiceStatus.PAID };
    onUpdateInvoice(updated);

    logAudit("invoice", selectedInvoice.id, "INVOICE_SETTLED", `Invoice ${selectedInvoice.invoiceNumber} marked as fully settled/paid.`);
  };

  return (
    <div id="workflow-control-panel" className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Proposal Directory Panel */}
      <div className="xl:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Active Workspace</h2>
          
          {/* Role Gating Switch */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Finance Role</span>
            <button
              onClick={() => setIsFinanceRole(!isFinanceRole)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 ${
                isFinanceRole ? "bg-amber-500" : "bg-slate-700"
              }`}
              title="Toggle role authorization"
            >
              <div className={`w-4 h-4 rounded-full bg-slate-900 shadow transition-transform duration-300 ${
                isFinanceRole ? "translate-x-4" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {proposals.map((p) => {
            const client = clients.find((c) => c?.id === p.clientId);
            const active = p.id === selectedProposalId;
            return (
              <button
                key={p.id}
                onClick={() => {
                  handleSelectProposalId(p.id);
                  // Default to relevant tabs depending on proposal status
                  if (p.status === ProposalStatus.DRAFT || p.status === ProposalStatus.IN_REVIEW) handleSelectStageTab("stage1");
                  else if (p.status === ProposalStatus.VERIFIED || p.status === ProposalStatus.SENT || p.status === ProposalStatus.VIEWED) handleSelectStageTab("stage2");
                  else if (p.status === ProposalStatus.APPROVED) handleSelectStageTab("stage3");
                  else handleSelectStageTab("stage4");
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                  active 
                    ? "bg-slate-800 border-amber-500/50 text-slate-100" 
                    : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] uppercase font-mono tracking-wider font-semibold py-0.5 px-2 rounded-full ${
                    p.status === ProposalStatus.APPROVED ? "bg-emerald-500/10 text-emerald-400" :
                    p.status === ProposalStatus.SENT ? "bg-sky-500/10 text-sky-400" :
                    p.status === ProposalStatus.VERIFIED ? "bg-indigo-500/10 text-indigo-400" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>
                    Proposal: {p.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 truncate">{p.title}</h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Client: {client ? client.name : "Unregistered Client"}
                </p>
              </button>
            );
          })}
        </div>

        {/* Role Helper Info */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Role Gating simulates financial security audits. Only the <strong className="text-slate-300">Finance Role</strong> can authorize invoice creation in Stage 3.
          </p>
        </div>
      </div>

      {/* Main Workflow Stage Panel */}
      <div className="xl:col-span-8 space-y-6">
        {/* Layout Switcher (Pipeline vs Bulk Document Registry) */}
        <div className="flex items-center justify-between bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveLayoutMode("pipeline")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeLayoutMode === "pipeline"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              Interactive Pipeline
            </button>
            <button
              onClick={() => setActiveLayoutMode("registry")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeLayoutMode === "registry"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Document Registry Directory
            </button>
          </div>

          {activeLayoutMode === "registry" && (
            <button
              onClick={handleDownloadBulkZip}
              disabled={isExportingZip || (selectedProposalIds.length === 0 && selectedInvoiceIds.length === 0)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 disabled:cursor-not-allowed font-bold text-xs rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
            >
              {isExportingZip ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Zipping...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Export ZIP ({selectedProposalIds.length + selectedInvoiceIds.length})
                </>
              )}
            </button>
          )}
        </div>

        {activeLayoutMode === "registry" ? (
          /* ========================================================
             BULK DOCUMENT REGISTRY DIRECTORY VIEW
             ======================================================== */
          <div className="space-y-6">
            {/* Section: Proposals */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    Proposals Bulk Registry
                  </h3>
                  <p className="text-[11px] text-slate-500">Check rows to bundle into your compiled archive</p>
                </div>
                <button
                  onClick={toggleSelectAllProposals}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {selectedProposalIds.length === proposals.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="py-3 px-2 w-8"></th>
                      <th className="py-3 px-3">Title & ID</th>
                      <th className="py-3 px-3">Client Entity</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Value</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {proposals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 text-[11px]">
                          No proposals in registry database.
                        </td>
                      </tr>
                    ) : (
                      proposals.map((p) => {
                        const client = clients.find((c) => c?.id === p.clientId);
                        const isSelected = selectedProposalIds.includes(p.id);
                        const value = p.items.reduce((s, item) => s + (item.quantity * item.price), 0);
                        return (
                          <tr
                            key={p.id}
                            className={`hover:bg-slate-800/20 transition-colors ${
                              isSelected ? "bg-amber-500/5" : ""
                            }`}
                          >
                            <td className="py-3.5 px-2">
                              <button
                                onClick={() => toggleSelectProposal(p.id)}
                                className="text-slate-400 hover:text-amber-400 transition cursor-pointer"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600" />
                                )}
                              </button>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="font-bold text-slate-200">{p.title}</div>
                              <div className="text-[10px] font-mono text-slate-500 mt-0.5">{p.id}</div>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="text-slate-300 font-medium">{client ? client.name : "N/A"}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{client ? client.email : ""}</div>
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  p.status === "draft"
                                    ? "bg-slate-800 text-slate-400"
                                    : p.status === "verified"
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    : p.status === "sent" || p.status === "viewed"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right font-bold font-mono text-slate-200">
                              ${value.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  handleSelectProposalId(p.id);
                                  setActiveLayoutMode("pipeline");
                                }}
                                className="px-2 py-1 bg-slate-950 border border-slate-800/80 text-[10px] font-semibold text-slate-300 hover:text-amber-400 hover:border-amber-500/40 rounded transition cursor-pointer"
                                title="Open this proposal inside the Interactive Pipeline"
                              >
                                View Pipeline
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section: Invoices */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-500" />
                    Invoices Bulk Registry
                  </h3>
                  <p className="text-[11px] text-slate-500">Check rows to bundle into your compiled archive</p>
                </div>
                <button
                  onClick={toggleSelectAllInvoices}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {selectedInvoiceIds.length === invoices.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="py-3 px-2 w-8"></th>
                      <th className="py-3 px-3">Invoice No & ID</th>
                      <th className="py-3 px-3">Client Entity</th>
                      <th className="py-3 px-3">Authorized By</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Value</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 text-[11px]">
                          No invoices in registry database yet. Complete a proposal up to Stage 3 to authorize an invoice.
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => {
                        const relatedP = proposals.find((prop) => prop.id === inv.proposalId);
                        const client = relatedP ? clients.find((c) => c?.id === relatedP.clientId) : null;
                        const isSelected = selectedInvoiceIds.includes(inv.id);
                        const value = inv.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                        const totalWithTax = value - inv.discount + Math.floor(value * inv.taxRate);

                        return (
                          <tr
                            key={inv.id}
                            className={`hover:bg-slate-800/20 transition-colors ${
                              isSelected ? "bg-emerald-500/5" : ""
                            }`}
                          >
                            <td className="py-3.5 px-2">
                              <button
                                onClick={() => toggleSelectInvoice(inv.id)}
                                className="text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600" />
                                )}
                              </button>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="font-bold text-slate-200">{inv.invoiceNumber}</div>
                              <div className="text-[10px] font-mono text-slate-500 mt-0.5">{inv.id}</div>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="text-slate-300 font-medium">{client ? client.name : "N/A"}</div>
                            </td>
                            <td className="py-3.5 px-3 font-medium text-slate-400">
                              {inv.authorizedBy || "System Admin"}
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  inv.status === "paid"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right font-bold font-mono text-slate-200">
                              ${totalWithTax.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-3 text-right space-x-2">
                              {relatedP && (
                                <button
                                  onClick={() => {
                                    handleSelectProposalId(relatedP.id);
                                    handleSelectStageTab("stage4");
                                    setActiveLayoutMode("pipeline");
                                  }}
                                  className="px-2 py-1 bg-slate-950 border border-slate-800/80 text-[10px] font-semibold text-slate-300 hover:text-amber-400 hover:border-amber-500/40 rounded transition cursor-pointer"
                                  title="Jump to Stage 4 inside the Interactive Pipeline"
                                >
                                  View Pipeline
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             STANDARD PIPELINE VIEW
             ======================================================== */
          selectedProposal ? (
          <div className="space-y-6">
            {/* Horizontal Step Indicator */}
            <div className="grid grid-cols-4 gap-2 bg-slate-950/60 border border-slate-800 p-2 rounded-2xl">
              {(["stage1", "stage2", "stage3", "stage4"] as const).map((stage, idx) => {
                const names = {
                  stage1: "1. Review & Verify",
                  stage2: "2. Track Response",
                  stage3: "3. Detail & Auth",
                  stage4: "4. Dispatch Invoice"
                };
                const active = activeStageTab === stage;
                return (
                  <button
                    key={stage}
                    onClick={() => handleSelectStageTab(stage)}
                    className={`py-2.5 rounded-xl text-center text-xs font-semibold transition ${
                      active 
                        ? "bg-slate-800 text-amber-400 shadow-lg" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {names[stage]}
                  </button>
                );
              })}
            </div>

            {/* Stage Forms */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl min-h-[300px]">
              {activeStageTab === "stage1" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">Stage 1 — Internal Review & Verification</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Audit proposal sections, confirm realistic pricing lines, and lock as verified.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase ${
                        selectedProposal.status === ProposalStatus.DRAFT ? "text-amber-500" : "text-emerald-400"
                      }`}>
                        Status: {selectedProposal.status}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Overview */}
                  <div className="space-y-2 bg-slate-950/40 p-4 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Line Items Verification</span>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {selectedProposal.items.map((it) => (
                        <div key={it.id} className="flex justify-between text-xs py-1 border-b border-slate-900 last:border-0">
                          <span className="text-slate-400">{it.description}</span>
                          <span className="text-slate-300 font-mono">
                            {it.quantity} × ${it.price.toLocaleString()} = ${(it.quantity * it.price).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Narrative Preview */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Scope Executive Summary</span>
                      <button 
                        onClick={() => onOpenPrintPreview("proposal", selectedProposal.id)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5" /> Full Document Preview
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed truncate">
                      {selectedProposal.sections[0]?.content || "No narrative content loaded."}
                    </p>
                  </div>

                  {/* AI Insight Badge (only in review) */}
                  {selectedProposal.status === ProposalStatus.IN_REVIEW && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -mr-6 -mt-6 blur-md" />
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400">Gemini AI Risk Insight</span>
                      </div>
                      
                      {isGeneratingInsight ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Analyzing proposal for risks & opportunities...
                        </div>
                      ) : insightText ? (
                        <div className="text-xs text-slate-300 leading-relaxed markdown-body">
                          <div dangerouslySetInnerHTML={{ __html: insightText.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-slate-800/80">
                    <button
                      onClick={handleNeedsRevision}
                      disabled={selectedProposal.status === ProposalStatus.DRAFT}
                      className="py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Return to Draft (Needs Revision)
                    </button>
                    <button
                      onClick={handleVerifyProposal}
                      disabled={selectedProposal.status !== ProposalStatus.DRAFT && selectedProposal.status !== ProposalStatus.IN_REVIEW}
                      className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-40"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify Proposal (Ready to Send)
                    </button>
                  </div>
                </div>
              )}

              {activeStageTab === "stage2" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">Stage 2 — Multi-Channel Send & Reminders</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Dispatch proposal. Automatically tracking responses under simulated schedules.</p>
                    </div>
                    <span className="text-xs font-bold text-amber-500 uppercase">
                      Status: {selectedProposal.status}
                    </span>
                  </div>

                  {/* Status Pipeline visualizer */}
                  <div className="grid grid-cols-4 gap-2 text-center py-4 bg-slate-950/40 rounded-xl border border-slate-800">
                    {["verified", "sent", "viewed", "approved"].map((s) => {
                      const currentStatus = selectedProposal.status;
                      const active = currentStatus === s || 
                        (s === "verified" && ["sent", "viewed", "approved"].includes(currentStatus)) ||
                        (s === "sent" && ["viewed", "approved"].includes(currentStatus)) ||
                        (s === "viewed" && ["approved"].includes(currentStatus));
                      return (
                        <div key={s} className="space-y-1">
                          <div className={`w-3 h-3 rounded-full mx-auto border transition-colors ${
                            active ? "bg-amber-500 border-amber-300" : "bg-slate-900 border-slate-800"
                          }`} />
                          <span className={`text-[10px] uppercase font-semibold block ${
                            active ? "text-amber-400" : "text-slate-600"
                          }`}>{s}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Channel stats */}
                    <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl space-y-3">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Delivery Channels</span>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500" /> Transact Email</span>
                          <span className="text-emerald-400">Ready</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-slate-500" /> WhatsApp Cloud API</span>
                          <span className="text-emerald-400">Opted In</span>
                        </div>
                      </div>
                    </div>

                    {/* Cadence info */}
                    <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl space-y-2 relative overflow-hidden">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">24h Follow-up Cadence</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        A proactive scheduler triggers every 24h until approved. Reminders sent: <strong className="text-slate-200">{selectedProposal.reminderCount}</strong>
                      </p>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Requires Meta pre-approved templates
                      </div>
                    </div>
                  </div>

                  {/* Actions & Simulation */}
                  <div className="space-y-4 pt-4 border-t border-slate-800/80">
                    <div className="flex flex-col sm:flex-row gap-2 justify-between">
                      {/* Send button */}
                      <button
                        onClick={handleSendProposal}
                        disabled={selectedProposal.status !== ProposalStatus.VERIFIED}
                        className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-40"
                      >
                        <Send className="w-4 h-4" />
                        Send Proposal (Email + WhatsApp)
                      </button>

                      {/* Manual trigger reminders */}
                      <button
                        onClick={handleTriggerReminder}
                        disabled={selectedProposal.status !== ProposalStatus.SENT && selectedProposal.status !== ProposalStatus.VIEWED}
                        className="py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" /> Force 24h Reminder Log
                      </button>
                    </div>

                    {/* Simulation Console */}
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Simulate Client Behavior (Testing)</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleSimulateClientAction("view")}
                          disabled={selectedProposal.status === ProposalStatus.DRAFT || selectedProposal.status === ProposalStatus.VERIFIED || selectedProposal.status === ProposalStatus.APPROVED}
                          className="py-1.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg hover:border-slate-700 disabled:opacity-30"
                        >
                          Mark Viewed
                        </button>
                        <button
                          onClick={() => handleSimulateClientAction("approve")}
                          disabled={selectedProposal.status === ProposalStatus.DRAFT || selectedProposal.status === ProposalStatus.VERIFIED || selectedProposal.status === ProposalStatus.APPROVED}
                          className="py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg hover:bg-emerald-500/20 disabled:opacity-30"
                        >
                          Approve Project
                        </button>
                        <button
                          onClick={() => handleSimulateClientAction("reject")}
                          disabled={selectedProposal.status === ProposalStatus.DRAFT || selectedProposal.status === ProposalStatus.VERIFIED || selectedProposal.status === ProposalStatus.APPROVED}
                          className="py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg hover:bg-rose-500/20 disabled:opacity-30"
                        >
                          Stall / Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeStageTab === "stage3" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">Stage 3 — Manual Detailing & Financial Authorization</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Ops team inserts scope/milestones. Finance team authorizes sequential invoice generation.</p>
                    </div>
                    <span className="text-xs font-bold text-amber-500 uppercase">
                      Status: {selectedProposal.status}
                    </span>
                  </div>

                  {selectedProposal.status !== ProposalStatus.APPROVED ? (
                    <div className="p-8 bg-slate-950/40 border border-slate-800/60 rounded-xl text-center space-y-2 flex flex-col items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-amber-500/80 mb-1" />
                      <h4 className="text-xs font-bold text-slate-300">Awaiting Client Approval</h4>
                      <p className="text-[11px] text-slate-500 max-w-sm">This stage unlocks once the client approves the proposal. You can simulate approval in Stage 2.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedDetailing ? (
                        /* Already detailed, ready for invoice authorization */
                        <div className="space-y-5">
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div>
                              <h4 className="text-xs font-bold text-emerald-400">Manual Detailing Complete</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">Submitted by {selectedDetailing.filledBy} on {new Date(selectedDetailing.filledAt).toLocaleDateString()}.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
                            <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl">
                              <span className="text-[10px] text-slate-500 uppercase block font-bold mb-1">Detailed Technical Scope</span>
                              <p className="leading-relaxed">{selectedDetailing.scope}</p>
                            </div>
                            <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl">
                              <span className="text-[10px] text-slate-500 uppercase block font-bold mb-1">Target Milestones Schedule</span>
                              <p className="leading-relaxed">{selectedDetailing.schedule}</p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h4 className="text-xs font-bold text-slate-200">Invoice Generation Controls</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">Generates sequential tax-compliant invoice from approved items.</p>
                            </div>

                            {selectedInvoice ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-medium">Invoice Generated:</span>
                                <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                  {selectedInvoice.invoiceNumber}
                                </span>
                                <button
                                  onClick={() => handleSelectStageTab("stage4")}
                                  className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-0.5"
                                >
                                  Go to dispatch <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={handleAuthorizeInvoice}
                                disabled={!isFinanceRole}
                                className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
                              >
                                <Shield className="w-4 h-4" />
                                Authorize Invoice (Requires Finance Role)
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Detailing form needs submission */
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                            <AlertCircle className="w-4 h-4" />
                            <span>Ops Detailing Required before Invoice Authorization is unlocked.</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Scope Specifications Details</label>
                              <textarea
                                value={scopeText}
                                onChange={(e) => setScopeText(e.target.value)}
                                placeholder="AWS instance cluster nodes sizing, database encryption levels..."
                                rows={3}
                                className="w-full bg-slate-950 border border-slate-850 text-xs text-slate-200 rounded-lg p-3 focus:border-amber-500/40 outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Target Milestones Schedule</label>
                              <textarea
                                value={scheduleText}
                                onChange={(e) => setScheduleText(e.target.value)}
                                placeholder="Milestone 1: Aug 1. Milestone 2: Aug 15. Sign-off: Aug 30..."
                                rows={3}
                                className="w-full bg-slate-950 border border-slate-850 text-xs text-slate-200 rounded-lg p-3 focus:border-amber-500/40 outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Allocated Resources</label>
                            <input
                              type="text"
                              value={resourcesText}
                              onChange={(e) => setResourcesText(e.target.value)}
                              placeholder="Sarah (PM), John (Dev), Dave (Dev)..."
                              className="w-full bg-slate-950 border border-slate-850 text-xs text-slate-200 rounded-lg p-3 focus:border-amber-500/40 outline-none"
                            />
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              onClick={handleSaveDetailing}
                              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold"
                            >
                              Submit Ops Detailing
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeStageTab === "stage4" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">Stage 4 — Invoice Review, Dispatch & Settlement</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Symmetric review panel. Verify tax rates, apply flat discounts, and dispatch multi-channel logs.</p>
                    </div>
                    {selectedInvoice && (
                      <span className="text-xs font-bold text-amber-500 uppercase">
                        Invoice Status: {selectedInvoice.status}
                      </span>
                    )}
                  </div>

                  {!selectedInvoice ? (
                    <div className="p-8 bg-slate-950/40 border border-slate-800/60 rounded-xl text-center space-y-2 flex flex-col items-center justify-center animate-fadeIn">
                      <Receipt className="w-10 h-10 text-slate-700 mb-1" />
                      <h4 className="text-xs font-bold text-slate-300">Invoice Not Yet Authorized</h4>
                      <p className="text-[11px] text-slate-500 max-w-sm">
                        Please complete detailing & authorize invoice generation in <strong className="text-slate-400">Stage 3</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Symmetry Display matching Stage 1 layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Invoice Pricing card */}
                        <div className="space-y-3 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 uppercase block font-bold">Invoice: {selectedInvoice.invoiceNumber}</span>
                            <button
                              onClick={() => onOpenPrintPreview("invoice", selectedInvoice.id)}
                              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-semibold"
                            >
                              <Printer className="w-3.5 h-3.5" /> Print Preview
                            </button>
                          </div>

                          <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                            {selectedInvoice.items.map((it) => (
                              <div key={it.id} className="flex justify-between text-[11px] text-slate-400 border-b border-slate-900 pb-1">
                                <span>{it.description}</span>
                                <span>${(it.quantity * it.price).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1 text-slate-400 font-mono">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>${selectedInvoice.items.reduce((sum, it) => sum + (it.quantity*it.price), 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Discount (Loyal):</span>
                              <span>-${selectedInvoice.discount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tax (8.25%):</span>
                              <span>+${Math.floor(selectedInvoice.items.reduce((sum, it) => sum + (it.quantity*it.price), 0) * selectedInvoice.taxRate).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-200 font-bold pt-1 border-t border-slate-900">
                              <span>Grand Total:</span>
                              <span>
                                ${(
                                  selectedInvoice.items.reduce((sum, it) => sum + (it.quantity*it.price), 0) - 
                                  selectedInvoice.discount + 
                                  Math.floor(selectedInvoice.items.reduce((sum, it) => sum + (it.quantity*it.price), 0) * selectedInvoice.taxRate)
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Dispatch Log checklist */}
                        <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3">
                          <span className="text-[10px] text-slate-500 uppercase block font-bold">Delivery Status (Simulated API)</span>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-500" /> Client Email</span>
                              <span>{selectedInvoice.status !== InvoiceStatus.DRAFT && selectedInvoice.status !== InvoiceStatus.IN_REVIEW && selectedInvoice.status !== InvoiceStatus.APPROVED ? "Delivered" : "Awaiting approval"}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Client WhatsApp</span>
                              <span>{selectedInvoice.status !== InvoiceStatus.DRAFT && selectedInvoice.status !== InvoiceStatus.IN_REVIEW && selectedInvoice.status !== InvoiceStatus.APPROVED ? "Delivered" : "Awaiting approval"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Invoice stages action bar */}
                      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-slate-800/80">
                        {selectedInvoice.status === InvoiceStatus.DRAFT && (
                          <div className="flex flex-wrap gap-2 items-center">
                            <button
                              onClick={handleInvoiceSubmitForReview}
                              className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                            >
                              <Shield className="w-4 h-4" />
                              Submit to Internal Review
                            </button>
                            <span className="text-[10px] text-slate-500 font-mono italic">
                              Status: Draft (Unsent). Next step is Internal Review.
                            </span>
                          </div>
                        )}

                        {selectedInvoice.status === InvoiceStatus.IN_REVIEW && (
                          <div className="flex flex-wrap gap-3 items-center justify-between w-full">
                            <div className="flex gap-2">
                              <button
                                onClick={handleApproveInvoice}
                                className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Approve & Rectify (Finance Sign-off)
                              </button>
                              <button
                                onClick={handleInvoiceNeedsRevision}
                                className="py-2.5 px-5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-rose-500/30"
                              >
                                <AlertCircle className="w-4 h-4" />
                                Needs Revision (Loop back to Draft)
                              </button>
                            </div>
                            <span className="text-[10px] text-amber-400 font-mono italic">
                              Status: Internal Review. Authorized personnel only.
                            </span>
                          </div>
                        )}

                        {selectedInvoice.status === InvoiceStatus.APPROVED && (
                          <div className="flex flex-wrap gap-2 items-center">
                            <button
                              onClick={handleSendInvoice}
                              className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 transition"
                            >
                              <Send className="w-4 h-4" />
                              Dispatch Invoice (Email + WhatsApp)
                            </button>
                            <span className="text-[10px] text-slate-500 font-mono italic">
                              Status: Approved & Unsent. Next step is Multi-channel Dispatch.
                            </span>
                          </div>
                        )}

                        {selectedInvoice.status === InvoiceStatus.SENT && (
                          <div className="flex flex-wrap gap-2 items-center">
                            <button
                              onClick={handlePayInvoice}
                              className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Mark Invoice as PAID / SETTLED
                            </button>
                            <span className="text-[10px] text-sky-400 font-mono italic">
                              Status: Dispatched. Awaiting client payment.
                            </span>
                          </div>
                        )}

                        {selectedInvoice.status === InvoiceStatus.PAID && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 w-full justify-between">
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              This automated document lifecycle is fully closed, settled and audited.
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Paid (Archived)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Related Message Log & Audit Trail Console */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Message Logs */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Simulated Message Logs</span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {relatedLogs.length === 0 ? (
                    <p className="text-[10px] text-slate-600 text-center py-6">No communication logs recorded for this document.</p>
                  ) : (
                    relatedLogs.map((log) => (
                      <div key={log.id} className="bg-slate-900 border border-slate-850 p-2.5 rounded-lg text-[10px] text-slate-400 font-mono space-y-1">
                        <div className="flex justify-between text-slate-500">
                          <span className="uppercase text-amber-500 font-bold">{log.channel} Outbox</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-normal font-sans">{log.messageContent}</p>
                        <div className="text-[9px] text-slate-600">Provider ID: {log.providerMessageId}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Audit Trails */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Audit Trail Logs</span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {relatedAudits.length === 0 ? (
                    <p className="text-[10px] text-slate-600 text-center py-6">No auditing state transitions recorded.</p>
                  ) : (
                    relatedAudits.map((a) => (
                      <div key={a.id} className="text-[10px] border-b border-slate-900 pb-2 last:border-0">
                        <div className="flex justify-between text-slate-400 font-mono">
                          <span className="font-bold text-slate-300">{a.action}</span>
                          <span>{new Date(a.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-500 font-sans mt-0.5 leading-normal">{a.details}</p>
                        <span className="text-[9px] text-slate-600 font-mono">Actor: {a.user}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-slate-700 mb-3" />
            <p className="text-sm">No proposals selected. Create or select a proposal in the left sidebar directory.</p>
          </div>
        )
      )}
      </div>
    </div>
  );
}
