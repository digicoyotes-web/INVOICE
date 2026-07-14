/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Client, Proposal, Detailing, Invoice, MessageLog, AuditTrail, 
  BrandConfig, ProposalTemplate, ProposalStatus, InvoiceStatus 
} from "./types";
import { 
  INITIAL_CLIENTS, INITIAL_TEMPLATES, INITIAL_PROPOSALS, 
  INITIAL_DETAILINGS, INITIAL_INVOICES, INITIAL_MESSAGE_LOGS, 
  INITIAL_AUDIT_TRAILS, DEFAULT_BRAND_CONFIG 
} from "./data";
import ParallaxBackground from "./components/ParallaxBackground";
import TemplateStudio from "./components/TemplateStudio";
import ProposalWizard from "./components/ProposalWizard";
import WorkflowPanel from "./components/WorkflowPanel";
import PrintPreview from "./components/PrintPreview";
import RecentActivityWidget from "./components/RecentActivityWidget";
import { 
  Briefcase, Receipt, Users, Layers, Sparkles, Send, 
  TrendingUp, Clock, FilePlus, RefreshCw, Layers3, Activity, 
  ArrowUpRight, AlertCircle, CheckCircle2, ShieldAlert, Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // --- Persistent Storage Hook Loader ---
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(() => {
    const saved = localStorage.getItem("v_brand_config");
    return saved ? JSON.parse(saved) : DEFAULT_BRAND_CONFIG;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem("v_clients");
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [templates, setTemplates] = useState<ProposalTemplate[]>(() => {
    const saved = localStorage.getItem("v_templates");
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem("v_proposals");
    return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
  });

  const [detailings, setDetailings] = useState<Detailing[]>(() => {
    const saved = localStorage.getItem("v_detailings");
    return saved ? JSON.parse(saved) : INITIAL_DETAILINGS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem("v_invoices");
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [messageLogs, setMessageLogs] = useState<MessageLog[]>(() => {
    const saved = localStorage.getItem("v_message_logs");
    return saved ? JSON.parse(saved) : INITIAL_MESSAGE_LOGS;
  });

  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>(() => {
    const saved = localStorage.getItem("v_audit_trails");
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_TRAILS;
  });

  // --- Synchronization Effects ---
  useEffect(() => {
    localStorage.setItem("v_brand_config", JSON.stringify(brandConfig));
  }, [brandConfig]);

  useEffect(() => {
    localStorage.setItem("v_clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("v_templates", JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem("v_proposals", JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem("v_detailings", JSON.stringify(detailings));
  }, [detailings]);

  useEffect(() => {
    localStorage.setItem("v_invoices", JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem("v_message_logs", JSON.stringify(messageLogs));
  }, [messageLogs]);

  useEffect(() => {
    localStorage.setItem("v_audit_trails", JSON.stringify(auditTrails));
  }, [auditTrails]);

  // --- UI Controls ---
  const [currentTab, setCurrentTab] = useState<"dashboard" | "workflow" | "templates" | "clients">("dashboard");
  const [showProposalWizard, setShowProposalWizard] = useState(false);
  const [printPreview, setPrintPreview] = useState<{ type: "proposal" | "invoice"; id: string } | null>(null);

  // --- Global Navbar Search & Workspace Synchronizer ---
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [globalSearchDropdownOpen, setGlobalSearchDropdownOpen] = useState(false);
  const [globalSelectedProposalId, setGlobalSelectedProposalId] = useState<string>("");
  const [globalActiveStageTab, setGlobalActiveStageTab] = useState<"stage1" | "stage2" | "stage3" | "stage4" | undefined>(undefined);

  // For Client view input
  const [selectedClientId, setSelectedClientId] = useState<string>(INITIAL_CLIENTS[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [newCName, setNewCName] = useState("");
  const [newCEmail, setNewCEmail] = useState("");
  const [newCContact, setNewCContact] = useState("");
  const [newCPhone, setNewCPhone] = useState("");
  const [newCAddress, setNewCAddress] = useState("");

  const handleResetData = () => {
    if (confirm("Reset application workspace to original factory seed data?")) {
      setBrandConfig(DEFAULT_BRAND_CONFIG);
      setClients(INITIAL_CLIENTS);
      setTemplates(INITIAL_TEMPLATES);
      setProposals(INITIAL_PROPOSALS);
      setDetailings(INITIAL_DETAILINGS);
      setInvoices(INITIAL_INVOICES);
      setMessageLogs(INITIAL_MESSAGE_LOGS);
      setAuditTrails(INITIAL_AUDIT_TRAILS);
    }
  };

  // --- Color Theme Mapping ---
  const getBrandColors = (theme: BrandConfig["themeColor"]) => {
    switch (theme) {
      case "amber": return { 
        bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-500/30", glow: "shadow-amber-500/20", hover: "hover:text-amber-700", rawHex: "#d97706" 
      };
      case "teal": return { 
        bg: "bg-teal-600", text: "text-teal-700", border: "border-teal-500/30", glow: "shadow-teal-500/20", hover: "hover:text-teal-800", rawHex: "#0f766e" 
      };
      case "indigo": return { 
        bg: "bg-indigo-600", text: "text-indigo-700", border: "border-indigo-500/30", glow: "shadow-indigo-500/20", hover: "hover:text-indigo-800", rawHex: "#4338ca" 
      };
      case "crimson": return { 
        bg: "bg-rose-600", text: "text-rose-700", border: "border-rose-500/30", glow: "shadow-rose-500/20", hover: "hover:text-rose-800", rawHex: "#be123c" 
      };
      case "violet": return { 
        bg: "bg-purple-600", text: "text-purple-700", border: "border-purple-500/30", glow: "shadow-purple-500/20", hover: "hover:text-purple-800", rawHex: "#7e22ce" 
      };
    }
  };

  const brandColors = getBrandColors(brandConfig.themeColor);

  // --- Metric Calculations ---
  const activeProposalsVal = proposals.reduce((sum, p) => {
    const pSum = p.items.reduce((pSub, item) => pSub + (item.quantity * item.price), 0);
    return sum + pSum;
  }, 0);

  const approvedProposals = proposals.filter((p) => p.status === ProposalStatus.APPROVED).length;
  const conversionRate = proposals.length > 0 ? Math.round((approvedProposals / proposals.length) * 100) : 0;
  const totalReminders = proposals.reduce((sum, p) => sum + p.reminderCount, 0);

  const outstandingInvoiceSum = invoices
    .filter((inv) => inv.status !== InvoiceStatus.PAID)
    .reduce((sum, inv) => {
      const sub = inv.items.reduce((s, it) => s + (it.quantity * it.price), 0);
      const tax = Math.floor(sub * inv.taxRate);
      return sum + (sub - inv.discount + tax);
    }, 0);

  return (
    <div className={`min-h-screen text-slate-100 flex flex-col relative overflow-hidden font-sans`}>
      {/* Dynamic 3D Parallax Canvas Background */}
      <ParallaxBackground />

      {/* Floating abstract decorative geometric mesh (glowing pseudo 3D effect) */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-gradient-to-tr from-amber-500/5 to-transparent rounded-full filter blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-10 w-[450px] h-[450px] bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full filter blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Top Application Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo brand block */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${brandColors.bg} flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/10 hover:scale-105 transition-transform duration-200`}>
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-md font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  {brandConfig.logoText}
                </span>
                <span className="text-[10px] tracking-widest uppercase text-amber-500 font-mono font-bold bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10">
                  AUTOMATION
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Corporate Proposal & Invoice Orchestration</p>
            </div>
          </div>

          {/* Global Navbar Search Bar with Dropdown */}
          <div className="flex-1 max-w-sm mx-4 relative hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setGlobalSearchDropdownOpen(true);
                }}
                onFocus={() => setGlobalSearchDropdownOpen(true)}
                placeholder="Global search client entity, ID, or invoice..."
                className="w-full bg-slate-900/60 hover:bg-slate-900/80 focus:bg-slate-950/90 border border-slate-800/80 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-200 placeholder-slate-500 outline-none transition duration-200"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => {
                    setGlobalSearchQuery("");
                    setGlobalSearchDropdownOpen(false);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[10px] font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {globalSearchDropdownOpen && globalSearchQuery.trim() !== "" && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 border border-slate-800/90 rounded-2xl p-3 shadow-2xl z-50 max-h-[360px] overflow-y-auto backdrop-blur-xl text-left">
                {(() => {
                  const matchedProposals = globalSearchQuery.trim() === "" ? [] : proposals.filter((p) => {
                    const client = clients.find((c) => c?.id === p.clientId);
                    const q = globalSearchQuery.toLowerCase();
                    return (
                      p.id.toLowerCase().includes(q) ||
                      p.title.toLowerCase().includes(q) ||
                      (client && client.name.toLowerCase().includes(q))
                    );
                  });

                  const matchedInvoices = globalSearchQuery.trim() === "" ? [] : invoices.filter((inv) => {
                    const relatedP = proposals.find((prop) => prop.id === inv.proposalId);
                    const client = relatedP ? clients.find((c) => c?.id === relatedP.clientId) : null;
                    const q = globalSearchQuery.toLowerCase();
                    return (
                      inv.id.toLowerCase().includes(q) ||
                      inv.invoiceNumber.toLowerCase().includes(q) ||
                      inv.proposalId.toLowerCase().includes(q) ||
                      (client && client.name.toLowerCase().includes(q))
                    );
                  });

                  const hasMatches = matchedProposals.length > 0 || matchedInvoices.length > 0;

                  return (
                    <>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-900 pb-1.5 px-1">
                        Search Results ({matchedProposals.length + matchedInvoices.length} matched)
                      </div>

                      {!hasMatches ? (
                        <p className="text-[10px] text-slate-500 text-center py-4">No matching proposals or invoices found.</p>
                      ) : (
                        <div className="space-y-3">
                          {/* Proposals Section */}
                          {matchedProposals.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[8px] font-extrabold text-amber-500 uppercase tracking-wider px-1">Proposals</span>
                              {matchedProposals.map((p) => {
                                const client = clients.find((c) => c?.id === p.clientId);
                                return (
                                  <button
                                    key={p.id}
                                    onClick={() => {
                                      setGlobalSelectedProposalId(p.id);
                                      // Set relevant stage
                                      if (p.status === "draft" || p.status === "verified") setGlobalActiveStageTab("stage1");
                                      else if (p.status === "sent" || p.status === "viewed") setGlobalActiveStageTab("stage2");
                                      else if (p.status === "approved") setGlobalActiveStageTab("stage3");
                                      else setGlobalActiveStageTab("stage4");
                                      setCurrentTab("workflow");
                                      setGlobalSearchQuery("");
                                      setGlobalSearchDropdownOpen(false);
                                    }}
                                    className="w-full text-left p-2 hover:bg-slate-900/80 border border-transparent hover:border-slate-850 rounded-xl transition flex justify-between items-center cursor-pointer font-sans"
                                  >
                                    <div>
                                      <h5 className="text-[11px] font-semibold text-slate-200 line-clamp-1">{p.title}</h5>
                                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{p.id} • {client ? client.name : "Unregistered"}</p>
                                    </div>
                                    <span className="text-[9px] text-amber-400 font-bold uppercase bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 shrink-0">
                                      {p.status}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Invoices Section */}
                          {matchedInvoices.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[8px] font-extrabold text-emerald-400 uppercase tracking-wider px-1">Invoices</span>
                              {matchedInvoices.map((inv) => {
                                const relatedP = proposals.find((prop) => prop.id === inv.proposalId);
                                const client = relatedP ? clients.find((c) => c?.id === relatedP.clientId) : null;
                                return (
                                  <button
                                    key={inv.id}
                                    onClick={() => {
                                      setGlobalSelectedProposalId(inv.proposalId);
                                      setGlobalActiveStageTab("stage4");
                                      setCurrentTab("workflow");
                                      setGlobalSearchQuery("");
                                      setGlobalSearchDropdownOpen(false);
                                    }}
                                    className="w-full text-left p-2 hover:bg-slate-900/80 border border-transparent hover:border-slate-850 rounded-xl transition flex justify-between items-center cursor-pointer font-sans"
                                  >
                                    <div>
                                      <h5 className="text-[11px] font-semibold text-slate-200 line-clamp-1">{inv.invoiceNumber}</h5>
                                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{inv.id} • {client ? client.name : "Unregistered"}</p>
                                    </div>
                                    <span className="text-[9px] text-emerald-400 font-bold uppercase bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 shrink-0">
                                      {inv.status}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Persistent Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Quick Theme Changer */}
            <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-850/80 px-2.5 py-1.5 rounded-xl">
              <span className="text-[8px] font-extrabold uppercase text-slate-500 tracking-wider mr-1 hidden sm:inline">Theme</span>
              {(["amber", "teal", "indigo", "crimson", "violet"] as const).map((color) => {
                const themeClasses = {
                  amber: "bg-amber-500 border-amber-600/30",
                  teal: "bg-teal-500 border-teal-600/30",
                  indigo: "bg-indigo-500 border-indigo-600/30",
                  crimson: "bg-rose-500 border-rose-600/30",
                  violet: "bg-purple-500 border-purple-600/30",
                };
                const isActive = brandConfig.themeColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setBrandConfig({ ...brandConfig, themeColor: color })}
                    className={`w-3 h-3 rounded-full ${themeClasses[color]} border transition duration-200 cursor-pointer ${
                      isActive ? "ring-2 ring-offset-1 ring-offset-slate-950 ring-amber-500 scale-110" : "opacity-50 hover:opacity-100 hover:scale-105"
                    }`}
                    title={`Switch Theme to ${color.toUpperCase()}`}
                  />
                );
              })}
            </div>

            <button
              onClick={handleResetData}
              className="p-2.5 bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Reset Workspace"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Seed
            </button>
            
            <button
              onClick={() => setShowProposalWizard(true)}
              className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <FilePlus className="w-4 h-4 fill-slate-950" />
              Add Proposal Wizard
            </button>
          </div>

        </div>
      </header>

      {/* Primary Navigation Tabs */}
      <nav className="bg-slate-950/40 border-b border-slate-900/60 sticky top-[73px] z-30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex gap-4 overflow-x-auto">
          {[
            { id: "dashboard", label: "Dashboard Metrics", icon: Briefcase },
            { id: "workflow", label: "Automation Work panel", icon: Layers3 },
            { id: "templates", label: "Branding Studio", icon: Layers },
            { id: "clients", label: "Client Database", icon: Users },
          ].map((tab) => {
            const active = currentTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`py-4 px-3 text-xs font-semibold uppercase tracking-wider relative flex items-center gap-2 border-b-2 transition duration-300 shrink-0 ${
                  active 
                    ? "text-amber-400 border-amber-500" 
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-amber-400" : "text-slate-500"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {currentTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="space-y-8"
            >
              {/* Bento Grid Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                
                {/* 1. Outstanding Proposals Value */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full -mr-6 -mt-6" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Pipeline</span>
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-slate-100 font-mono">${activeProposalsVal.toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <span className="text-emerald-400 font-bold">+{proposals.length} active</span> documents under draft
                    </p>
                  </div>
                </div>

                {/* 2. Proposal Conversion Rate */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full -mr-6 -mt-6" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Conversion Rate</span>
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-slate-100 font-mono">{conversionRate}%</h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {approvedProposals} approved proposals settled
                    </p>
                  </div>
                </div>

                {/* 3. Outstanding Invoices value */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/5 to-transparent rounded-full -mr-6 -mt-6" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Pending Authorized Invoices</span>
                    <Receipt className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-slate-100 font-mono">${outstandingInvoiceSum.toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Tax & discount compliant sequential balance
                    </p>
                  </div>
                </div>

                {/* 4. Automated Reminders sent */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full -mr-6 -mt-6" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Reminders Sent (24h Queue)</span>
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-bold text-slate-100 font-mono">{totalReminders}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Cron job loops checking response pending
                    </p>
                  </div>
                </div>

                {/* 5. Recent Activity D3 Sparkline Widget */}
                <RecentActivityWidget
                  auditTrails={auditTrails}
                  messageLogs={messageLogs}
                  themeColorHex={brandColors.rawHex}
                />

              </div>

              {/* Lower Dashboard Section: Workspace Activity & Live Pipeline Status */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Side: Recent Audit Trail Logs */}
                <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">System Audit Trail logs</h3>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/10">
                      Synchronized
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {auditTrails.slice().reverse().map((a) => (
                      <div key={a.id} className="relative pl-6 pb-4 border-l border-slate-800 last:pb-0">
                        <div className={`absolute -left-[4.5px] top-1 w-2.5 h-2.5 rounded-full ${brandColors.bg} border-2 border-slate-950`} />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-200">{a.action}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(a.timestamp).toLocaleDateString()} {new Date(a.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{a.details}</p>
                        <span className="text-[9px] text-slate-500 font-mono block mt-1">Responsible Operator: {a.user}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Quick Action Widgets & Reminders alert */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Quick Action list */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Quick Actions</h3>
                    
                    <button
                      onClick={() => {
                        setShowProposalWizard(true);
                      }}
                      className="w-full py-3 px-4 bg-slate-950 border border-slate-850 hover:border-amber-500/40 rounded-xl text-left text-xs text-slate-300 flex items-center justify-between group transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        Generate Proposal with AI
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </button>

                    <button
                      onClick={() => setCurrentTab("workflow")}
                      className="w-full py-3 px-4 bg-slate-950 border border-slate-850 hover:border-amber-500/40 rounded-xl text-left text-xs text-slate-300 flex items-center justify-between group transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Layers3 className="w-4 h-4 text-amber-500 shrink-0" />
                        Access Lifecycle Work panel
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </button>

                    <button
                      onClick={() => setCurrentTab("templates")}
                      className="w-full py-3 px-4 bg-slate-950 border border-slate-850 hover:border-amber-500/40 rounded-xl text-left text-xs text-slate-300 flex items-center justify-between group transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-500 shrink-0" />
                        Customize Brand & Logos
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </button>
                  </div>

                  {/* 24-hour compliance alert panel */}
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 space-y-3">
                    <div className="flex gap-2 text-amber-500">
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Meta API Regulatory Alert</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      WhatsApp Business policies limit arbitrary text message dispatch to active <strong className="text-slate-300">24-hour session windows</strong>. Proactive 24h reminders must leverage pre-approved, certified Meta templates.
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {currentTab === "workflow" && (
            <motion.div
              key="workflow"
              initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="animate-fadeIn"
            >
              <WorkflowPanel
                proposals={proposals}
                invoices={invoices}
                clients={clients}
                detailings={detailings}
                messageLogs={messageLogs}
                auditTrails={auditTrails}
                onUpdateProposal={(p) => {
                  const updated = proposals.map((item) => (item.id === p.id ? p : item));
                  setProposals(updated);
                }}
                onUpdateInvoice={(inv) => {
                  const exists = invoices.some((i) => i.id === inv.id);
                  if (exists) {
                    setInvoices(invoices.map((i) => (i.id === inv.id ? inv : i)));
                  } else {
                    setInvoices([...invoices, inv]);
                  }
                }}
                onAddDetailing={(det) => setDetailings([...detailings, det])}
                onAddMessageLog={(log) => setMessageLogs([...messageLogs, log])}
                onAddAuditTrail={(trail) => setAuditTrails([...auditTrails, trail])}
                brandColors={brandColors}
                onOpenPrintPreview={(type, id) => setPrintPreview({ type, id })}
                parentSelectedProposalId={globalSelectedProposalId}
                onSelectProposalId={(id) => setGlobalSelectedProposalId(id)}
                parentActiveStageTab={globalActiveStageTab}
                onSelectStageTab={(tab) => setGlobalActiveStageTab(tab)}
              />
            </motion.div>
          )}

          {currentTab === "templates" && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <TemplateStudio
                brandConfig={brandConfig}
                onUpdateBrand={setBrandConfig}
                templates={templates}
                onUpdateTemplates={setTemplates}
              />
            </motion.div>
          )}

          {currentTab === "clients" && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="space-y-6"
            >
              {/* Clients Base List & Form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Create Client Form (3/12) */}
                <div className="lg:col-span-3 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Register Entity</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Client Company</label>
                      <input
                        type="text"
                        placeholder="E.g., Stellar Systems"
                        value={newCName}
                        onChange={(e) => setNewCName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-slate-200 outline-none focus:border-amber-500/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Contact Email</label>
                      <input
                        type="email"
                        placeholder="contact@stellar.io"
                        value={newCEmail}
                        onChange={(e) => setNewCEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-slate-200 outline-none focus:border-amber-500/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Representative</label>
                      <input
                        type="text"
                        placeholder="Evelyn Sterling"
                        value={newCContact}
                        onChange={(e) => setNewCContact(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-slate-200 outline-none focus:border-amber-500/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">WhatsApp</label>
                      <input
                        type="text"
                        placeholder="+1 (555) 902-1234"
                        value={newCPhone}
                        onChange={(e) => setNewCPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-slate-200 outline-none focus:border-amber-500/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Address</label>
                      <textarea
                        placeholder="200 Broad St, Floor 14..."
                        value={newCAddress}
                        onChange={(e) => setNewCAddress(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-slate-200 outline-none focus:border-amber-500/40 font-sans"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!newCName || !newCEmail) return;
                        const newClient: Client = {
                          id: "c_" + Date.now(),
                          name: newCName,
                          contactName: newCContact || newCName,
                          email: newCEmail,
                          whatsappNumber: newCPhone || "+1 (555) 000-0000",
                          optInConsent: true,
                          address: newCAddress || "Not specified",
                          createdAt: new Date().toISOString()
                        };
                        setClients([...clients, newClient]);
                        setSelectedClientId(newClient.id);
                        setNewCName("");
                        setNewCEmail("");
                        setNewCContact("");
                        setNewCPhone("");
                        setNewCAddress("");

                        // Log action
                        const newAudit: AuditTrail = {
                          id: "au_" + Date.now(),
                          entityType: "client",
                          entityId: newClient.id,
                          action: "CLIENT_REGISTERED",
                          user: "Sarah Jenkins (Senior Strategist)",
                          timestamp: new Date().toISOString(),
                          details: `Registered new client company: ${newClient.name} (${newClient.contactName}).`,
                        };
                        setAuditTrails([...auditTrails, newAudit]);
                      }}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Save Client
                    </button>
                  </div>
                </div>

                {/* Middle Side: Search & Directory Table (5/12) */}
                <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Registered Directory</h3>
                    <input
                      type="text"
                      placeholder="Filter directory..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-850 text-[11px] text-slate-200 py-1 px-2.5 rounded-lg outline-none focus:border-amber-500/50 w-full sm:w-auto"
                    />
                  </div>

                  <div className="overflow-x-auto max-h-[360px] overflow-y-auto pr-1">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 uppercase font-semibold text-[10px]">
                          <th className="py-2">Company</th>
                          <th className="py-2">Contact</th>
                          <th className="py-2">Consent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {clients
                          .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((c) => {
                            const isSelected = selectedClientId === c.id;
                            return (
                              <tr 
                                key={c.id} 
                                onClick={() => setSelectedClientId(c.id)}
                                className={`text-slate-300 hover:bg-slate-800/20 cursor-pointer transition-colors ${
                                  isSelected ? "bg-amber-500/5" : ""
                                }`}
                              >
                                <td className="py-3 font-bold text-slate-200">
                                  <div>{c.name}</div>
                                  <div className="text-[10px] text-slate-500 font-mono font-normal mt-0.5">{c.id}</div>
                                </td>
                                <td className="py-3">
                                  <div className="font-medium">{c.contactName}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">{c.email}</div>
                                </td>
                                <td className="py-3">
                                  {c.optInConsent ? (
                                    <span className="text-emerald-400 uppercase text-[8px] font-bold bg-emerald-500/10 py-0.5 px-1.5 rounded-full border border-emerald-500/10">Opt In</span>
                                  ) : (
                                    <span className="text-slate-500 uppercase text-[8px] font-bold bg-slate-950 py-0.5 px-1.5 rounded-full border border-slate-800">None</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Side: Selected Client Profile & Interaction Timeline (4/12) */}
                <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
                  {(() => {
                    const client = clients.find((c) => c.id === selectedClientId);
                    if (!client) {
                      return (
                        <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center space-y-2 h-full">
                          <Users className="w-8 h-8 text-slate-700" />
                          <h4 className="text-xs font-bold text-slate-300">No Selected Client</h4>
                          <p className="text-[10px] max-w-xs leading-normal">Select a corporate client from the directory grid to view interaction streams.</p>
                        </div>
                      );
                    }

                    // Extract timeline items
                    const clientProposals = proposals.filter((p) => p.clientId === client.id);
                    const cpIds = clientProposals.map((p) => p.id);
                    const clientInvoices = invoices.filter((inv) => cpIds.includes(inv.proposalId));
                    const ciIds = clientInvoices.map((inv) => inv.id);

                    const clientLogs = messageLogs.filter(
                      (log) =>
                        (log.entityType === "proposal" && cpIds.includes(log.entityId)) ||
                        (log.entityType === "invoice" && ciIds.includes(log.entityId))
                    );

                    const clientAudits = auditTrails.filter(
                      (a) =>
                        (a.entityType === "client" && a.entityId === client.id) ||
                        (a.entityType === "proposal" && cpIds.includes(a.entityId)) ||
                        (a.entityType === "invoice" && ciIds.includes(a.entityId))
                    );

                    const timelineEvents = [
                      ...clientLogs.map((log) => ({
                        id: log.id,
                        timestamp: log.timestamp,
                        type: "message",
                        title: `Sent ${log.channel.toUpperCase()}`,
                        description: log.messageContent,
                        badge: log.status,
                        user: "System Outbox",
                      })),
                      ...clientAudits.map((a) => ({
                        id: a.id,
                        timestamp: a.timestamp,
                        type: "audit",
                        title: a.action,
                        description: a.details,
                        badge: a.user,
                        user: a.user,
                      })),
                    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                    return (
                      <div className="space-y-4 flex flex-col h-full justify-between">
                        {/* Dossier info */}
                        <div className="space-y-2">
                          <div className="border-b border-slate-800/80 pb-2">
                            <span className="text-[9px] uppercase font-bold text-amber-500 tracking-wider">Client Dossier</span>
                            <h3 className="text-sm font-extrabold text-slate-100 truncate mt-0.5">{client.name}</h3>
                            <p className="text-[10px] text-slate-400">Primary Contact: {client.contactName}</p>
                          </div>

                          <div className="space-y-1 text-xs text-slate-400">
                            <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                              <span className="text-slate-500 text-[9px]">Email</span>
                              <span className="text-slate-200 text-[10px] truncate max-w-[150px]">{client.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-900/40">
                              <span className="text-slate-500 text-[9px]">WhatsApp</span>
                              <span className="text-slate-200 text-[10px]">{client.whatsappNumber}</span>
                            </div>
                            <div className="flex justify-between items-start py-1">
                              <span className="text-slate-500 text-[9px] shrink-0">Address</span>
                              <span className="text-slate-300 text-[10px] text-right font-medium leading-normal max-w-[160px] truncate" title={client.address}>{client.address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Miniature Timeline Stream */}
                        <div className="pt-3 border-t border-slate-800/80 flex flex-col">
                          <h4 className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                            Interaction Timeline ({timelineEvents.length})
                          </h4>
                          
                          <div className="space-y-3.5 max-h-[190px] overflow-y-auto pr-1">
                            {timelineEvents.length === 0 ? (
                              <p className="text-[10px] text-slate-600 text-center py-6 font-mono">No interactions logged. Create proposals to seed client events.</p>
                            ) : (
                              timelineEvents.map((evt) => (
                                <div key={evt.id} className="relative pl-3.5 pb-1 border-l border-slate-800 last:pb-0 text-left">
                                  {/* Timeline marker */}
                                  <span className={`absolute -left-[4.5px] top-1 w-2 h-2 rounded-full ${
                                    evt.type === "message" ? "bg-amber-500" : "bg-teal-400"
                                  }`} />

                                  <div className="space-y-0.5">
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="text-[10px] font-bold text-slate-200 leading-tight">{evt.title}</span>
                                      <span className="text-[8px] text-slate-500 shrink-0">{new Date(evt.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 leading-normal line-clamp-2">{evt.description}</p>
                                    <div className="flex items-center gap-1 text-[8px] text-slate-600 font-mono mt-0.5">
                                      <span>Actor: {evt.user}</span>
                                      {evt.badge && (
                                        <>
                                          <span>•</span>
                                          <span className="uppercase text-amber-500/80 font-bold">{evt.badge}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/70 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-500">
          <p>© 2026 Vinshare Proposal and Invoice Automation. All rights reserved.</p>
          <p className="text-[10px] text-slate-600 mt-1">
            Built for enterprise-scale auto-marketing pipeline verification. Deployed securely on Cloud Nodes.
          </p>
        </div>
      </footer>

      {/* --- WIZARD POPUP MODAL --- */}
      {showProposalWizard && (
        <ProposalWizard
          clients={clients}
          templates={templates}
          onAddClient={(newC) => setClients([...clients, newC])}
          onSaveProposal={(newP) => {
            setProposals([...proposals, newP]);
            
            // Log creation audit
            const newAudit: AuditTrail = {
              id: "au_" + Date.now(),
              entityType: "proposal",
              entityId: newP.id,
              action: "PROPOSAL_CREATED",
              user: "Sarah Jenkins (Senior Strategist)",
              timestamp: new Date().toISOString(),
              details: `Initiated proposal draft '${newP.title}' with itemized pricing: $${newP.items.reduce((sum, item) => sum + (item.quantity*item.price), 0).toLocaleString()}.`,
            };
            setAuditTrails([...auditTrails, newAudit]);
            
            // Redirect to workflow panel tab automatically to view the newly added document
            setCurrentTab("workflow");
          }}
          onClose={() => setShowProposalWizard(false)}
          brandColors={brandColors}
        />
      )}

      {/* --- PRINT PREVIEW POPUP MODAL --- */}
      {printPreview && (
        <PrintPreview
          type={printPreview.type}
          documentId={printPreview.id}
          proposals={proposals}
          invoices={invoices}
          clients={clients}
          brandConfig={brandConfig}
          onClose={() => setPrintPreview(null)}
        />
      )}
    </div>
  );
}
