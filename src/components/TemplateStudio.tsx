import React, { useState } from "react";
import { BrandConfig, ProposalTemplate } from "../types";
import { Palette, Sliders, Type as TypeIcon, Save, Layers, Archive, CheckCircle, RefreshCw, AlertCircle, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface TemplateStudioProps {
  brandConfig: BrandConfig;
  onUpdateBrand: (config: BrandConfig) => void;
  templates: ProposalTemplate[];
  onUpdateTemplates: (templates: ProposalTemplate[]) => void;
}

export default function TemplateStudio({
  brandConfig,
  onUpdateBrand,
  templates,
  onUpdateTemplates,
}: TemplateStudioProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || "");
  const [activeTab, setActiveTab] = useState<"brand" | "templates">("brand");
  
  // Local states for editing template
  const currentTemplate = templates.find((t) => t.id === selectedTemplateId);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const updateTemplateField = (field: keyof ProposalTemplate, value: any) => {
    if (!selectedTemplateId) return;
    const updated = templates.map((t) => {
      if (t.id === selectedTemplateId) {
        return { ...t, [field]: value };
      }
      return t;
    });
    onUpdateTemplates(updated);
  };

  const updateSectionText = (index: number, content: string) => {
    if (!currentTemplate) return;
    const updatedSections = [...currentTemplate.sections];
    updatedSections[index] = { ...updatedSections[index], defaultContent: content };
    updateTemplateField("sections", updatedSections);
  };

  const updateSectionTitle = (index: number, title: string) => {
    if (!currentTemplate) return;
    const updatedSections = [...currentTemplate.sections];
    updatedSections[index] = { ...updatedSections[index], title: title };
    updateTemplateField("sections", updatedSections);
  };

  const addSection = () => {
    if (!currentTemplate || !newSectionTitle.trim()) return;
    const updatedSections = [
      ...currentTemplate.sections,
      { title: newSectionTitle, defaultContent: "Enter default template content for this section..." },
    ];
    updateTemplateField("sections", updatedSections);
    setNewSectionTitle("");
    setIsAddingSection(false);
  };

  const removeSection = (index: number) => {
    if (!currentTemplate) return;
    const updatedSections = currentTemplate.sections.filter((_, i) => i !== index);
    updateTemplateField("sections", updatedSections);
  };

  const createNewTemplate = (type: "proposal" | "invoice") => {
    const id = "pt_" + Date.now();
    const newT: ProposalTemplate = {
      id,
      name: `New ${type === "proposal" ? "Proposal" : "Invoice"} Template ${templates.length + 1}`,
      type,
      isActive: true,
      version: "1.0",
      sections: type === "proposal" ? [
        { title: "Executive Summary", defaultContent: "Executive summary details..." },
        { title: "The Problem", defaultContent: "Client difficulties..." },
        { title: "Proposed Solution", defaultContent: "How we solve it..." }
      ] : [
        { title: "Payment Terms", defaultContent: "Standard corporate terms apply." }
      ],
      defaultTerms: "Standard net 15 terms apply.",
    };
    onUpdateTemplates([...templates, newT]);
    setSelectedTemplateId(id);
  };

  const getColorClasses = (theme: BrandConfig["themeColor"]) => {
    switch (theme) {
      case "amber": return { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/30", glow: "shadow-amber-500/20" };
      case "teal": return { bg: "bg-teal-500", text: "text-teal-400", border: "border-teal-500/30", glow: "shadow-teal-500/20" };
      case "indigo": return { bg: "bg-indigo-500", text: "text-indigo-400", border: "border-indigo-500/30", glow: "shadow-indigo-500/20" };
      case "crimson": return { bg: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/30", glow: "shadow-rose-500/20" };
      case "violet": return { bg: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/30", glow: "shadow-purple-500/20" };
    }
  };

  const colors = getColorClasses(brandConfig.themeColor);

  return (
    <div id="template-studio-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Configuration Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full -mr-6 -mt-6 pointer-events-none" />
          
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-3 mb-6">
            <Sliders className={`w-5 h-5 ${colors.text}`} />
            Studio Controls
          </h2>

          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800 mb-6">
            <button
              onClick={() => setActiveTab("brand")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "brand" ? "bg-slate-800 text-amber-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Brand Styling
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === "templates" ? "bg-slate-800 text-amber-400 shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Reusable Templates
            </button>
          </div>

          {activeTab === "brand" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Brand Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase block">
                  Brand Name / Logo Text
                </label>
                <div className="relative">
                  <TypeIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={brandConfig.logoText}
                    onChange={(e) => onUpdateBrand({ ...brandConfig, logoText: e.target.value })}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500/50 hover:border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-200 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Color Themes */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase block">
                  Accent Color Theme
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(["amber", "teal", "indigo", "crimson", "violet"] as const).map((color) => {
                    const active = brandConfig.themeColor === color;
                    const meta = getColorClasses(color);
                    return (
                      <button
                        key={color}
                        onClick={() => onUpdateBrand({ ...brandConfig, themeColor: color })}
                        className={`group relative aspect-square rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                          active ? "border-slate-100 scale-105" : "border-slate-800 hover:border-slate-600 hover:scale-102"
                        }`}
                        title={`Theme: ${color}`}
                      >
                        <div className={`w-6 h-6 rounded-lg ${meta.bg} shadow-md group-hover:scale-110 transition-transform`} />
                        {active && (
                          <div className="absolute inset-0 bg-white/10 rounded-xl" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fonts */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase block">
                  Typography Profile
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["sans", "serif", "mono"] as const).map((font) => (
                    <button
                      key={font}
                      onClick={() => onUpdateBrand({ ...brandConfig, fontFamily: font })}
                      className={`py-2.5 px-2 border rounded-xl text-center text-xs font-medium transition-all duration-300 ${
                        brandConfig.fontFamily === font
                          ? "bg-slate-800 border-amber-500 text-slate-100 font-bold"
                          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className="block text-lg font-semibold mb-0.5">
                        {font === "sans" ? "Aa" : font === "serif" ? "Ab" : "A_"}
                      </span>
                      {font === "sans" ? "Inter Sans" : font === "serif" ? "Playfair" : "Fira Mono"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Export & Import Brand Assets */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase block">
                  Theme Configuration Backup
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(brandConfig, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `${brandConfig.logoText.toLowerCase().replace(/\s+/g, '_')}_theme_assets.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all duration-200"
                    title="Export Theme as JSON File"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                    Export Brand
                  </button>
                  <label
                    className="py-2 px-3 bg-slate-950/50 hover:bg-slate-950 border border-slate-800/50 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer text-center"
                    title="Upload Theme JSON File"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                    Import Brand
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const config = JSON.parse(event.target?.result as string);
                            if (config && typeof config.logoText === "string" && typeof config.themeColor === "string" && typeof config.fontFamily === "string") {
                              onUpdateBrand(config);
                            } else {
                              alert("Invalid theme JSON structure. Ensure logoText, themeColor, and fontFamily are present.");
                            }
                          } catch (err) {
                            alert("Error parsing theme JSON file.");
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Quick Visual Sandbox */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Live UI Sandbox</span>
                  <div className={`flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg`}>
                    <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center text-slate-950 font-bold text-xs shadow`}>
                      V
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{brandConfig.logoText}</h4>
                      <p className="text-[10px] text-slate-400">Automated Enterprise Suite</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-4 animate-fadeIn">
              <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase block">
                Select Template to Configure
              </label>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                      selectedTemplateId === t.id
                        ? "bg-slate-800 border-amber-500/50 text-slate-100"
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="block text-xs font-semibold truncate">{t.name}</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500">
                        {t.type} · v{t.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {t.isActive ? (
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      ) : (
                        <span className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => createNewTemplate("proposal")}
                  className="py-2 px-3 bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-500" />
                  + Proposal
                </button>
                <button
                  onClick={() => createNewTemplate("invoice")}
                  className="py-2 px-3 bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-500" />
                  + Invoice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Main Content */}
      <div className="lg:col-span-8">
        {currentTemplate ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-6"
          >
            {/* Header Settings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Template Builder</span>
                <input
                  type="text"
                  value={currentTemplate.name}
                  onChange={(e) => updateTemplateField("name", e.target.value)}
                  className="text-xl font-bold text-slate-100 bg-transparent border-b border-transparent focus:border-slate-700 focus:outline-none w-full max-w-md"
                />
              </div>

              <div className="flex items-center gap-4">
                {/* Version config */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Ver:</span>
                  <input
                    type="text"
                    value={currentTemplate.version}
                    onChange={(e) => updateTemplateField("version", e.target.value)}
                    className="w-12 bg-slate-950 text-slate-300 text-xs rounded border border-slate-800 py-1 text-center font-mono outline-none focus:border-amber-500"
                  />
                </div>

                {/* Toggle Active status */}
                <button
                  onClick={() => updateTemplateField("isActive", !currentTemplate.isActive)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                    currentTemplate.isActive
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {currentTemplate.isActive ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Active
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5" />
                      Archived
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Editing proposal sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Template Content Sections (Merge Fields)
                </h3>
                <button
                  onClick={() => setIsAddingSection(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Section
                </button>
              </div>

              {isAddingSection && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="E.g., Methodology"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 outline-none"
                  />
                  <button
                    onClick={addSection}
                    className="py-1.5 px-3 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setIsAddingSection(false)}
                    className="text-xs text-slate-400 hover:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {currentTemplate.sections.map((sec, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3 relative group">
                    <button
                      onClick={() => removeSection(idx)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-rose-400 p-1"
                      title="Remove section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="max-w-[80%]">
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => updateSectionTitle(idx, e.target.value)}
                        className="text-xs font-bold text-slate-300 uppercase tracking-wider bg-transparent border-b border-transparent focus:border-slate-800 outline-none pb-0.5"
                      />
                    </div>

                    <textarea
                      value={sec.defaultContent}
                      onChange={(e) => updateSectionText(idx, e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950/60 border border-slate-800/80 focus:border-amber-500/30 focus:outline-none rounded-lg p-3 text-xs text-slate-400 leading-relaxed font-sans"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Default terms and conditions */}
            <div className="space-y-2 pt-4 border-t border-slate-800/80">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Standard Terms & Conditions Contract Clause
              </label>
              <textarea
                value={currentTemplate.defaultTerms}
                onChange={(e) => updateTemplateField("defaultTerms", e.target.value)}
                rows={3}
                className="w-full bg-slate-950/40 border border-slate-800 focus:border-amber-500/30 focus:outline-none rounded-xl p-4 text-xs text-slate-400 leading-relaxed"
                placeholder="Payment terms, SLAs, intellectual property clauses..."
              />
            </div>
          </motion.div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-slate-700 mb-3" />
            <p className="text-sm">No active templates found. Click "+ Proposal" to start designing one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
