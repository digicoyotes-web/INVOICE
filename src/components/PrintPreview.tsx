import React, { useEffect } from "react";
import { Proposal, Invoice, Client, BrandConfig } from "../types";
import { Printer, Download, X, FileText, CheckCircle } from "lucide-react";

interface PrintPreviewProps {
  type: "proposal" | "invoice";
  documentId: string;
  proposals: Proposal[];
  invoices: Invoice[];
  clients: Client[];
  brandConfig: BrandConfig;
  onClose: () => void;
}

export default function PrintPreview({
  type,
  documentId,
  proposals,
  invoices,
  clients,
  brandConfig,
  onClose,
}: PrintPreviewProps) {
  
  // Find correct document
  const proposal = type === "proposal" 
    ? proposals.find((p) => p.id === documentId) 
    : proposals.find((p) => {
        const inv = invoices.find((i) => i.id === documentId);
        return inv ? inv.proposalId === p.id : false;
      });

  const invoice = type === "invoice" ? invoices.find((i) => i.id === documentId) : null;
  const client = proposal ? clients.find((c) => c.id === proposal.clientId) : null;

  // CSS fonts mappings
  const getFontFamilyClass = (f: BrandConfig["fontFamily"]) => {
    switch (f) {
      case "sans": return "font-sans";
      case "serif": return "font-serif";
      case "mono": return "font-mono";
    }
  };

  const getThemeColorClass = (theme: BrandConfig["themeColor"]) => {
    switch (theme) {
      case "amber": return "bg-amber-600 border-amber-600 text-amber-600";
      case "teal": return "bg-teal-600 border-teal-600 text-teal-600";
      case "indigo": return "bg-indigo-600 border-indigo-600 text-indigo-600";
      case "crimson": return "bg-rose-600 border-rose-600 text-rose-600";
      case "violet": return "bg-purple-600 border-purple-600 text-purple-600";
    }
  };

  const fontClass = getFontFamilyClass(brandConfig.fontFamily);
  const colorClass = getThemeColorClass(brandConfig.themeColor);

  const subtotal = invoice 
    ? invoice.items.reduce((sum, it) => sum + (it.quantity * it.price), 0)
    : proposal 
      ? proposal.items.reduce((sum, it) => sum + (it.quantity * it.price), 0)
      : 0;

  const discount = invoice ? invoice.discount : 0;
  const tax = invoice ? Math.floor(subtotal * invoice.taxRate) : 0;
  const grandTotal = subtotal - discount + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-50 overflow-y-auto flex items-start justify-center p-4 sm:p-8">
      
      {/* Non-Printable Action Bar */}
      <div className="fixed top-4 right-4 flex items-center gap-2 print:hidden z-50">
        <button
          onClick={handlePrint}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow-lg transition"
        >
          <Printer className="w-4 h-4" />
          Print / Download PDF
        </button>
        <button
          onClick={onClose}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition"
          title="Close preview"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main printable paper container */}
      <div 
        id="printable-area" 
        className={`w-full max-w-4xl bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl ${fontClass} border border-slate-200 mt-12 mb-12`}
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm`}>
                V
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                {brandConfig.logoText}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">VINSHARE COMPLIANT TRANS-DOCUMENT</p>
            <p className="text-xs text-slate-500">Suite 120, Tech Arcade Parkway, Delaware</p>
          </div>

          <div className="text-right sm:text-right">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
              {type === "invoice" ? "Invoice" : "Proposal"}
            </h1>
            {invoice && (
              <div className="mt-2 text-xs text-slate-500 font-mono space-y-0.5">
                <div>Invoice Number: <strong className="text-slate-800">{invoice.invoiceNumber}</strong></div>
                <div>Authorized Date: {new Date(invoice.createdAt).toLocaleDateString()}</div>
                <div>Status: <span className="font-bold text-emerald-600 uppercase">{invoice.status}</span></div>
              </div>
            )}
            {proposal && !invoice && (
              <div className="mt-2 text-xs text-slate-500 font-mono space-y-0.5">
                <div>Reference ID: <strong className="text-slate-800">{proposal.id}</strong></div>
                <div>Created Date: {new Date(proposal.createdAt).toLocaleDateString()}</div>
                <div>Status: <span className="font-bold uppercase text-amber-600">{proposal.status}</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Client details / Bill To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold mb-2">Corporate Client Address</span>
            {client ? (
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">{client.name}</h3>
                <p className="text-slate-600">Attn: {client.contactName}</p>
                <p className="text-slate-500">{client.email}</p>
                <p className="text-slate-500">{client.whatsappNumber}</p>
                <p className="text-slate-500 pt-1 leading-relaxed max-w-xs">{client.address}</p>
              </div>
            ) : (
              <p className="text-slate-400 italic">No client details linked.</p>
            )}
          </div>

          <div className="sm:text-right space-y-1 text-slate-500">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold mb-2 sm:text-right">Contract Handover</span>
            <p>Author: <strong className="text-slate-700">Sarah Jenkins</strong></p>
            <p>Standard SLA: Class-A Container Hosting</p>
            <p>Payment Terms: Net 15 Business Days</p>
          </div>
        </div>

        {/* Narrative chapters (Proposal Only) */}
        {type === "proposal" && proposal && (
          <div className="py-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Project Scope & Chapters</h2>
            {proposal.sections.map((sec, idx) => (
              <div key={idx} className="space-y-1.5 break-inside-avoid">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{sec.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{sec.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Line Items Pricing Table */}
        {proposal && (
          <div className="py-8">
            <h2 className="text-md font-bold text-slate-800 mb-4 tracking-tight uppercase">
              {type === "invoice" ? "Invoice Itemized Details" : "Proposed Pricing & Milestones"}
            </h2>
            
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 pr-4">Description / Deliverable Milestone</th>
                  <th className="py-3 text-center w-16">Qty</th>
                  <th className="py-3 text-right w-28">Unit Price</th>
                  <th className="py-3 text-right w-28">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(type === "invoice" && invoice ? invoice.items : proposal.items).map((it) => (
                  <tr key={it.id} className="text-slate-700 break-inside-avoid">
                    <td className="py-3 pr-4 font-medium text-slate-800">{it.description}</td>
                    <td className="py-3 text-center font-mono">{it.quantity}</td>
                    <td className="py-3 text-right font-mono">${it.price.toLocaleString()}</td>
                    <td className="py-3 text-right font-mono font-semibold text-slate-900">${(it.quantity * it.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations totals */}
            <div className="flex justify-end pt-6 break-inside-avoid">
              <div className="w-64 space-y-2 text-xs text-slate-500 font-mono">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-slate-800">${subtotal.toLocaleString()}</span>
                </div>
                {type === "invoice" && (
                  <>
                    <div className="flex justify-between text-rose-600">
                      <span>Discount:</span>
                      <span>-${discount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8.25%):</span>
                      <span>+${tax.toLocaleString()}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm text-slate-900 font-bold pt-2 border-t border-slate-200">
                  <span>Total Amount (USD):</span>
                  <span className="text-base text-slate-950">
                    ${(type === "invoice" ? grandTotal : subtotal).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terms & Conditions Signature Block */}
        <div className="pt-8 border-t border-slate-200 mt-12 break-inside-avoid text-xs text-slate-500 space-y-8">
          <div>
            <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Legal Clauses & Signature Terms</h4>
            <p className="leading-relaxed max-w-2xl">
              {type === "invoice" ? "Payment is due within 15 business days. Please settle via registered bank credentials. Standard corporate interest rates apply to overdue balances as specified in the service agreement." : proposal?.terms}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-8 max-w-lg">
            <div className="border-t border-slate-200 pt-3 text-center">
              <p className="font-semibold text-slate-800">Vinshare Director Signature</p>
              <p className="text-[10px] text-slate-400 mt-1">Authorized Digital Sign-off</p>
            </div>
            <div className="border-t border-slate-200 pt-3 text-center">
              <p className="font-semibold text-slate-800">Client Acceptance Signature</p>
              <p className="text-[10px] text-slate-400 mt-1">Marcus Sterling (Authorized Agent)</p>
            </div>
          </div>
        </div>

        {/* Print Layout Styles Injection */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            #printable-area {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            #template-studio-panel, #parallax-canvas, nav, header {
              display: none !important;
            }
            @page {
              margin: 20mm;
            }
          }
        `}} />
      </div>
    </div>
  );
}
