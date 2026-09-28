import { useState } from "react";
import { ArrowRight, Bot, Check, CheckCircle2, Download, FileText, HelpCircle, Layers, RefreshCw, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import { sendPublic } from "./api";

export default function AIQuotationModal({ isOpen, onClose, onOpenRequirement }) {
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState("Corporate Office");
  const [usersCount, setUsersCount] = useState(25);
  const [selectedServices, setSelectedServices] = useState([
    "IT Support & 24/7 Helpdesk",
    "Network & Wi-Fi Management",
    "Cloud & Microsoft 365",
    "Cybersecurity & Endpoint Protection"
  ]);
  const [hasServer, setHasServer] = useState("yes");
  const [slaSpeed, setSlaSpeed] = useState("15min");
  const [generating, setGenerating] = useState(false);
  const [estimatedQuote, setEstimatedQuote] = useState(null);

  if (!isOpen) return null;

  const toggleService = (srv) => {
    setSelectedServices(prev =>
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
    );
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      // Calculate realistic enterprise estimation in AED
      let baseSupport = usersCount * 85;
      if (businessType === "Healthcare" || businessType === "Financial Services") baseSupport *= 1.25;
      if (businessType === "Hospitality" || businessType === "Retail") baseSupport *= 1.15;

      let serverCost = hasServer === "yes" ? 650 : hasServer === "hybrid" ? 950 : 0;
      let serviceMultiplier = selectedServices.length * 280;
      let slaFactor = slaSpeed === "15min" ? 1.2 : slaSpeed === "1hr" ? 1.0 : 0.85;

      let subtotal = Math.round((baseSupport + serverCost + serviceMultiplier) * slaFactor);
      let vat = Math.round(subtotal * 0.05);
      let total = subtotal + vat;

      const quote = {
        quoteNumber: `WFX-AI-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        businessType,
        usersCount,
        selectedServices,
        sla: slaSpeed === "15min" ? "Critical 15-Minute Response" : slaSpeed === "1hr" ? "Standard 1-Hour Response" : "Same-Day 4-Hour Response",
        subtotal,
        vat,
        total,
        recommendedTier: usersCount > 50 ? "Enterprise Dedicated NOC" : usersCount > 15 ? "Pro Managed IT + SLA" : "Essential Business Support",
        includedBenefits: [
          "Unlimited Remote Helpdesk (24/7)",
          "Scheduled Monthly Preventive Maintenance",
          "Endpoint Protection (EDR) & Antivirus",
          "Cloud Backup & Health Monitoring",
          "Dedicated UAE Account Manager",
          "Emergency On-Site Engineer Dispatch"
        ]
      };

      setEstimatedQuote(quote);
      setGenerating(false);
      setStep(3);
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/30">
              <Sparkles size={20} className="animate-pulse text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">Wefyx AI Instant Quotation</h3>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/40">
                  AI ASSISTED
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Get an instant estimated IT solution & pricing in minutes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[calc(85vh-120px)] overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                  <Bot size={16} className="text-blue-600" /> Step 1: Tell us about your organization
                </div>
                <p className="mt-1 text-xs text-blue-700/80">
                  Our AI engine uses UAE industry standards to optimize coverage and cost.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Industry / Business Type</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    "Corporate Office",
                    "Healthcare & Clinic",
                    "Hospitality & Hotel",
                    "Retail & Showroom",
                    "Warehousing & Logistics",
                    "Financial Services",
                    "Construction & Real Estate",
                    "Education & School",
                    "Other Business"
                  ].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBusinessType(t)}
                      className={`rounded-xl border p-2.5 text-left text-xs font-medium transition ${
                        businessType === t
                          ? "border-blue-600 bg-blue-50/80 font-bold text-blue-900 ring-1 ring-blue-500"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Number of Users / Laptops / Workstations</label>
                  <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                    {usersCount} Users
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="250"
                  step="5"
                  value={usersCount}
                  onChange={(e) => setUsersCount(Number(e.target.value))}
                  className="mt-3 w-full accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>5 Users (Startup)</span>
                  <span>50 Users (Mid-Size)</span>
                  <span>250+ Users (Enterprise)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Do you have on-premise servers or data center racks?</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    ["no", "No Server (Cloud Only)"],
                    ["yes", "1-3 Local Servers"],
                    ["hybrid", "Multiple Racks / Hybrid"]
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setHasServer(val)}
                      className={`rounded-xl border p-2.5 text-center text-xs transition ${
                        hasServer === val
                          ? "border-blue-600 bg-blue-50 font-bold text-blue-900 ring-1 ring-blue-500"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                >
                  Next: Select Services <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                  <Layers size={16} className="text-blue-600" /> Step 2: Select required IT modules & SLA
                </div>
                <p className="mt-1 text-xs text-blue-700/80">
                  Select the services you require. You can adjust these anytime.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Services & Infrastructure</label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    "IT Support & 24/7 Helpdesk",
                    "Network & Wi-Fi Management",
                    "Cloud & Microsoft 365",
                    "Cybersecurity & Endpoint Protection",
                    "Data Center & Server Maintenance",
                    "CCTV & Biometric Access",
                    "Annual Maintenance Contract (AMC)",
                    "Backup & Disaster Recovery"
                  ].map(srv => {
                    const active = selectedServices.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleService(srv)}
                        className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs transition ${
                          active
                            ? "border-blue-600 bg-blue-50/70 font-semibold text-blue-900 ring-1 ring-blue-500"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{srv}</span>
                        <div className={`grid h-5 w-5 place-items-center rounded-md border ${
                          active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"
                        }`}>
                          {active && <Check size={13} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Required Response SLA</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    ["15min", "15-Min Response", "Critical 24/7 SLA"],
                    ["1hr", "1-Hour Response", "Standard Business Hours"],
                    ["4hr", "4-Hour Response", "Scheduled Support"]
                  ].map(([val, title, sub]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSlaSpeed(val)}
                      className={`rounded-xl border p-2.5 text-left text-xs transition ${
                        slaSpeed === val
                          ? "border-blue-600 bg-blue-50 font-bold text-blue-900 ring-1 ring-blue-500"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div>{title}</div>
                      <div className="mt-0.5 text-[10px] font-normal text-slate-500">{sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={generating || selectedServices.length === 0}
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> AI Analyzing Requirements...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Calculate AI Quotation
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && estimatedQuote && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/50 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      ESTIMATED QUOTATION READY
                    </span>
                    <h4 className="mt-1 text-lg font-extrabold text-slate-900">
                      {estimatedQuote.recommendedTier}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Ref: <span className="font-mono font-semibold">{estimatedQuote.quoteNumber}</span> · For {estimatedQuote.businessType} ({estimatedQuote.usersCount} users)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-medium text-slate-500">Estimated Monthly</div>
                    <div className="text-2xl font-black text-blue-700">
                      AED {estimatedQuote.total.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Subtotal: AED {estimatedQuote.subtotal.toLocaleString()} + 5% VAT (AED {estimatedQuote.vat})
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-200/80 pt-3">
                  <div className="text-[11px] font-bold text-slate-700">Included Core Enterprise Benefits:</div>
                  <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {estimatedQuote.includedBenefits.map(b => (
                      <div key={b} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Selected Services:</span>
                  <span className="font-semibold text-slate-800">{selectedServices.length} Modules</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedServices.map(s => (
                    <span key={s} className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Adjust Parameters
                </button>
                <div className="flex gap-2">
                  <a
                    href="/services#requirement"
                    onClick={() => {
                      onClose();
                      if (onOpenRequirement) onOpenRequirement();
                    }}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                  >
                    Request Official Proposal <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
