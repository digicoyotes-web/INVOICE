import React, { useState } from "react";
import { Client, Proposal, ProposalTemplate, LineItem, ProposalSection, ProposalStatus } from "../types";
import { Sparkles, Loader2, Plus, Trash2, CheckCircle2, DollarSign, FileText, Globe, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProposalWizardProps {
  clients: Client[];
  templates: ProposalTemplate[];
  onAddClient: (client: Client) => void;
  onSaveProposal: (proposal: Proposal) => void;
  onClose: () => void;
  brandColors: { bg: string; text: string; border: string; glow: string };
}

export default function ProposalWizard({
  clients,
  templates,
  onAddClient,
  onSaveProposal,
  onClose,
  brandColors,
}: ProposalWizardProps) {
  // Wizard view: "form" or "ai"
  const [activeTab, setActiveTab] = useState<"form" | "ai">("ai");

  // Client Selection & Inline creation
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientContact, setNewClientContact] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");

  // Template Selection
  const [templateId, setTemplateId] = useState(templates[0]?.id || "");

  // Proposal main states
  const [title, setTitle] = useState("");
  const [terms, setTerms] = useState("");
  const [sections, setSections] = useState<ProposalSection[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);

  // AI Inputs
  const [proposalGoal, setProposalGoal] = useState("");
  const [industry, setIndustry] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const steps = [
    "Analyzing project goal...",
    "Formulating premium business narrative...",
    "Aligning structural chapters & timeline...",
    "Assembling itemized pricing schema...",
    "Polishing legal clauses and payment terms...",
  ];

  // Apply template defaults
  const handleApplyTemplate = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    setTemplateId(id);
    
    // Auto populate sections & terms from active template
    const defaultSections = template.sections.map((sec) => ({
      title: sec.title,
      content: sec.defaultContent,
    }));
    setSections(defaultSections);
    setTerms(template.defaultTerms);
  };

  // Inline Client Add
  const handleCreateClient = () => {
    if (!newClientName || !newClientEmail) return;
    const newC: Client = {
      id: "c_" + Date.now(),
      name: newClientName,
      contactName: newClientContact || newClientName,
      email: newClientEmail,
      whatsappNumber: newClientPhone || "+1 (555) 000-0000",
      optInConsent: true,
      address: newClientAddress || "Corporate HQ Address",
      createdAt: new Date().toISOString(),
    };
    onAddClient(newC);
    setClientId(newC.id);
    setShowNewClientForm(false);
    
    // Reset fields
    setNewClientName("");
    setNewClientEmail("");
    setNewClientContact("");
    setNewClientPhone("");
    setNewClientAddress("");
  };

  // Pricing items controls
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: "i_" + Date.now(),
      description: "Service Phase Deliverable Name",
      quantity: 1,
      price: 1500,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof LineItem, val: any) => {
    const updated = items.map((it) => {
      if (it.id === id) {
        return { ...it, [field]: val };
      }
      return it;
    });
    setItems(updated);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  // Section details controls
  const handleUpdateSectionContent = (index: number, content: string) => {
    const updated = [...sections];
    updated[index].content = content;
    setSections(updated);
  };

  const handleUpdateSectionTitle = (index: number, secTitle: string) => {
    const updated = [...sections];
    updated[index].title = secTitle;
    setSections(updated);
  };

  const handleAddSection = () => {
    setSections([...sections, { title: "New Section Chapter", content: "Details..." }]);
  };

  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  // Live total calculation
  const subtotal = items.reduce((sum, it) => sum + (it.quantity * it.price), 0);

  // Call server-side Gemini generation
  const handleAIGenerate = async () => {
    if (!proposalGoal.trim()) {
      setErrorMsg("Please provide a proposal goal so Gemini has context.");
      return;
    }
    setErrorMsg("");
    setIsGenerating(true);
    setGenerationStep(0);

    // Dynamic stage messages during wait
    const interval = setInterval(() => {
      setGenerationStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1400);

    try {
      const selectedClientObj = clients.find((c) => c.id === clientId);
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: selectedClientObj ? selectedClientObj.name : "Valued Corporate Client",
          proposalGoal,
          industry,
          additionalNotes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Server failed to process proposal.");
      }

      const generatedData = await res.json();
      
      // Seed results back into form wizard
      setTitle(generatedData.title || "Custom Enterprise Proposal");
      setSections(generatedData.sections || []);
      setTerms(generatedData.terms || "");
      
      // Standard line item parsing
      const mappedItems = (generatedData.items || []).map((it: any, index: number) => ({
        id: `gen_i_${index}_${Date.now()}`,
        description: it.description || "Project Milestone Phase",
        quantity: it.quantity || 1,
        price: it.price || 1000,
      }));
      setItems(mappedItems);

      // Successfully processed, switch to editor tab to verify details
      setActiveTab("form");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Could not connect with Gemini. Verify server is running.");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMsg("Please provide a title for the proposal.");
      return;
    }
    if (sections.length === 0) {
      setErrorMsg("Please include at least one proposal narrative section.");
      return;
    }

    const finalProposal: Proposal = {
      id: "p_" + Date.now(),
      clientId,
      templateId,
      title,
      sections,
      items,
      terms,
      status: ProposalStatus.DRAFT, // Always starts as draft
      createdBy: "Sarah Jenkins (Senior Strategist)",
      reminderCount: 0,
      createdAt: new Date().toISOString(),
    };
    onSaveProposal(finalProposal);
    onClose();
  };

  return (
    <div id="proposal-wizard" className="fixed inset-0 w-full h-full z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/40 to-slate-900 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-amber-500/10 border border-amber-500/20`}>
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-md font-bold text-slate-100 font-sans tracking-wide">Vinshare Intelligent Wizard</h2>
              <p className="text-xs text-slate-400">Generate high-converting business contracts natively</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm py-1.5 px-3 rounded-lg hover:bg-slate-800 transition"
          >
            Cancel
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 py-2">
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "ai" ? "bg-slate-800 text-amber-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            AI Generator
          </button>
          <button
            onClick={() => {
              // Ensure we apply standard template defaults if we have zero sections
              if (sections.length === 0) {
                handleApplyTemplate(templateId);
              }
              setActiveTab("form");
            }}
            className={`py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "form" ? "bg-slate-800 text-amber-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4 text-amber-500" />
            Manual Editor & Reviewer
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {activeTab === "ai" ? (
            /* AI GENERATOR MODULE */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/90 z-20 rounded-xl flex flex-col items-center justify-center space-y-4"
                  >
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-100">{steps[generationStep]}</p>
                      <p className="text-[10px] text-slate-400">Gemini is writing custom layouts using professional branding models...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Form Column */}
              <div className="md:col-span-7 space-y-5">
                {/* Client Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Target Corporate Client
                    </label>
                    <button
                      onClick={() => setShowNewClientForm(!showNewClientForm)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> New Client
                    </button>
                  </div>

                  {showNewClientForm ? (
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-200">Register New Client</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Client Company Name"
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                          className="bg-slate-900 text-xs border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                        <input
                          type="email"
                          placeholder="Contact Email Address"
                          value={newClientEmail}
                          onChange={(e) => setNewClientEmail(e.target.value)}
                          className="bg-slate-900 text-xs border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                        <input
                          type="text"
                          placeholder="Contact Human Name"
                          value={newClientContact}
                          onChange={(e) => setNewClientContact(e.target.value)}
                          className="bg-slate-900 text-xs border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                        <input
                          type="text"
                          placeholder="WhatsApp (intl format)"
                          value={newClientPhone}
                          onChange={(e) => setNewClientPhone(e.target.value)}
                          className="bg-slate-900 text-xs border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>
                      <textarea
                        placeholder="Corporate Headquarters Address"
                        value={newClientAddress}
                        onChange={(e) => setNewClientAddress(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-900 text-xs border border-slate-800 rounded-lg p-2 text-slate-200"
                      />
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          onClick={() => setShowNewClientForm(false)}
                          className="py-1 px-3 text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateClient}
                          className="py-1 px-3 bg-amber-500 text-slate-950 rounded-lg font-bold"
                        >
                          Save Client
                        </button>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-3 text-sm text-slate-300 outline-none"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.contactName})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Base Template */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Core Template Reference Theme
                  </label>
                  <select
                    value={templateId}
                    onChange={(e) => handleApplyTemplate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-3 text-sm text-slate-300 outline-none"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Active: v{t.version})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Goals and Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Core Project Goal & Objectives (Context)
                  </label>
                  <textarea
                    value={proposalGoal}
                    onChange={(e) => setProposalGoal(e.target.value)}
                    rows={4}
                    placeholder="E.g., Design and architect a modern full-stack web application with secure proxy nodes, beautiful glass charts, and automated SMS reminders for their luxury real estate services..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 focus:outline-none rounded-xl p-4 text-xs text-slate-200 leading-relaxed font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                      Industry Sector
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., PropTech, FinTech, Logistics"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-3 text-xs text-slate-200 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                      Budget Context / Target Size
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., Enterprise Premium"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-3 text-xs text-slate-200 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAIGenerate}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  Generate Proposal with Gemini AI
                </button>
              </div>

              {/* Explanation/Benefits Column */}
              <div className="md:col-span-5 bg-slate-950/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    How AI Automation Works
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-mono text-[10px] shrink-0 mt-0.5">
                        1
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Context Capture:</strong> Gemini parses the target client profile, industry metrics, and your detailed project specifications.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-mono text-[10px] shrink-0 mt-0.5">
                        2
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Semantic Modeling:</strong> Matches requirements with active brand templates to produce realistic, top-tier pricing items and narrative scope.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-mono text-[10px] shrink-0 mt-0.5">
                        3
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Structured Response:</strong> Returns a verified schema containing custom timeline landmarks, pricing line items, and SLA clauses.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/80">
                  <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Powered securely by server-side <strong className="text-slate-300">gemini-3.5-flash</strong> model. Your API keys are private and hidden from public clients.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* MANUAL WIZARD FORM */
            <div className="space-y-6">
              {/* Proposal Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Proposal Project Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Executive Logistics Portal"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-3 text-sm text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Client Selection
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-3 text-sm text-slate-300 outline-none animate-fadeIn"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive Chapters (Sections) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Proposal Chapters (Narrative Scope)
                  </h3>
                  <button
                    onClick={handleAddSection}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Chapter
                  </button>
                </div>

                <div className="space-y-4">
                  {sections.map((sec, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3 relative group">
                      <button
                        onClick={() => handleRemoveSection(idx)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-1"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="max-w-[80%]">
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => handleUpdateSectionTitle(idx, e.target.value)}
                          className="bg-transparent border-b border-transparent focus:border-slate-800 text-xs font-bold text-slate-200 uppercase tracking-wider outline-none pb-0.5"
                        />
                      </div>

                      <textarea
                        value={sec.content}
                        onChange={(e) => handleUpdateSectionContent(idx, e.target.value)}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-800/60 focus:outline-none rounded-lg p-3 text-xs text-slate-400 leading-relaxed font-sans"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Itemized Pricing Section */}
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Itemized Pricing & Deliverables
                  </h3>
                  <button
                    onClick={handleAddItem}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Price Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.length === 0 ? (
                    <div className="p-6 bg-slate-950/40 border border-slate-800/60 rounded-xl text-center text-slate-500 text-xs">
                      No pricing items specified yet. Click "Add Price Item" to define project scope costs.
                    </div>
                  ) : (
                    items.map((it) => (
                      <div key={it.id} className="grid grid-cols-12 gap-2 bg-slate-950 border border-slate-800/50 p-3 rounded-xl items-center">
                        <div className="col-span-6 md:col-span-7">
                          <input
                            type="text"
                            value={it.description}
                            onChange={(e) => handleUpdateItem(it.id, "description", e.target.value)}
                            placeholder="Deliverable component..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 outline-none"
                          />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <input
                            type="number"
                            value={it.quantity}
                            onChange={(e) => handleUpdateItem(it.id, "quantity", parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-center text-xs text-slate-200 outline-none"
                            title="Qty"
                          />
                        </div>
                        <div className="col-span-3 md:col-span-3 relative">
                          <span className="absolute left-3 top-2.5 text-[10px] text-slate-500 font-mono">$</span>
                          <input
                            type="number"
                            value={it.price}
                            onChange={(e) => handleUpdateItem(it.id, "price", parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-7 pr-2 text-xs text-slate-200 outline-none font-mono"
                            title="Price per unit"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            onClick={() => handleRemoveItem(it.id)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotal Panel */}
                <div className="flex justify-end pt-2">
                  <div className="bg-slate-950 border border-slate-800/80 py-3 px-5 rounded-xl flex items-center gap-4">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Subtotal:</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">${subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Custom Terms */}
              <div className="space-y-2 pt-4 border-t border-slate-800/80">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Custom Terms & Conditions
                </label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 focus:outline-none rounded-xl p-4 text-xs text-slate-400 leading-relaxed"
                  placeholder="Insert payment milestones, SLA schedules, intellectual property clauses..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Workspace status:</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Offline-ready local-cache
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="py-2 px-4 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs text-slate-300 font-semibold"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className={`py-2 px-5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center gap-1.5 transition`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Draft Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
