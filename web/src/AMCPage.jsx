import { useState } from "react";
import {
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Headphones,
  Laptop,
  Network,
  Power,
  Server,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap
} from "lucide-react";
import UnifiedHeader from "./UnifiedHeader";
import { PublicFooter } from "./RentalPages";
import AIQuotationModal from "./AIQuotationModal";

export default function AMCPage() {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [assetsCount, setAssetsCount] = useState(30);
  const [contractType, setContractType] = useState("Comprehensive");
  const [slaTier, setSlaTier] = useState("15-Min Critical");

  const amcTiers = [
    {
      name: "Non-Comprehensive AMC",
      badge: "ESSENTIAL PREVENTIVE CARE",
      price: "From AED 45 / device / month",
      desc: "Ideal for businesses wanting scheduled preventive maintenance, health audits, and discounted labor for emergencies.",
      features: [
        "Monthly on-site preventive health inspection",
        "Unlimited remote helpdesk & ticket management",
        "OS patching, antivirus & firmware updates",
        "Backup verification & restore testing",
        "Hardware repair labor included (parts charged separately)",
        "Guaranteed 2-hour emergency response SLA"
      ],
      cta: "Select Non-Comprehensive"
    },
    {
      name: "Comprehensive AMC",
      badge: "MOST POPULAR FOR ENTERPRISES",
      price: "From AED 85 / device / month",
      highlight: true,
      desc: "Complete peace of mind with all replacement spare parts, labor, unlimited visits, and critical 15-minute SLA included.",
      features: [
        "All hardware spare parts & replacement modules included",
        "Unlimited emergency on-site engineer visits",
        "24/7/365 round-the-clock priority helpdesk",
        "Critical 15-minute remote response SLA",
        "Free standby replacement devices during repairs",
        "Quarterly IT strategy & cybersecurity reviews",
        "Dedicated UAE account manager"
      ],
      cta: "Select Comprehensive"
    },
    {
      name: "Dedicated Resident Engineer AMC",
      badge: "FULL-TIME ON-SITE STAFF",
      price: "From AED 6,500 / engineer / month",
      desc: "A full-time, certified Wefyx IT engineer stationed permanently at your Dubai/UAE office, backed by our senior NOC team.",
      features: [
        "Full-time (8 hrs/day, 5-6 days/week) resident engineer",
        "Instant in-person desk-side user support",
        "On-premise server, network, and printer administration",
        "Immediate VIP & board-room meeting support",
        "Full backup engineer replacement during annual leave",
        "Level 2 & Level 3 senior architect escalation support"
      ],
      cta: "Request Resident Engineer"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <UnifiedHeader onOpenQuote={() => setShowQuoteModal(true)} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#09482e] via-[#0c5d3b] to-[#09482e] py-16 text-white lg:py-24">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <ShieldCheck size={13} /> GUARANTEED UPTIME &amp; PREVENTIVE CARE
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Annual Maintenance Contracts (AMC)
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Protect your business computers, servers, networking, and data center assets with transparent, SLA-backed Annual Maintenance Contracts across the UAE.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setShowQuoteModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#00a86b] px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-[#008c59]"
              >
                <span>Calculate AMC Proposal</span>
                <ArrowRight size={15} />
              </button>
              <a
                href="/services#requirement"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold text-white transition hover:bg-white/20"
              >
                <span>Request Custom AMC Contract</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* AMC Tiers */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {amcTiers.map(tier => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-7 transition ${
                  tier.highlight
                    ? "border-emerald-500 bg-white shadow-2xl ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:shadow-lg"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3.5 right-6 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow">
                    RECOMMENDED
                  </span>
                )}

                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  {tier.badge}
                </div>
                <h3 className="mt-2 text-xl font-extrabold text-slate-900">{tier.name}</h3>
                <div className="mt-3 text-lg font-bold text-emerald-700">{tier.price}</div>
                <p className="mt-3 text-xs text-slate-600 leading-relaxed">{tier.desc}</p>

                <div className="mt-6 flex-1 space-y-3 border-t border-slate-200/80 pt-6">
                  {tier.features.map(f => (
                    <div key={f} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(true)}
                    className={`w-full rounded-xl py-3 text-xs font-bold transition ${
                      tier.highlight
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-700"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assets Covered */}
      <section className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-[#09482e] sm:text-3xl">
              Equipment &amp; Assets Covered Under AMC
            </h2>
            <p className="mt-2 text-xs text-slate-600">
              Single unified contract covering all workplace and server room hardware across the UAE.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              [Laptop, "Laptops & Desktops", "Dell, HP, Lenovo, Apple"],
              [Server, "Servers & Storage", "Rack servers, NAS, SAN"],
              [Network, "Firewalls & Switches", "Cisco, Fortinet, UniFi"],
              [ShieldCheck, "CCTV & Access Control", "Hikvision, Dahua, ZKTeco"],
              [Power, "UPS & Power Systems", "APC, Eaton, CyberPower"],
              [Boxes, "Printers & Scanners", "Canon, HP, Epson Network"]
            ].map(([Icon, title, sub]) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon size={20} />
                </div>
                <div className="mt-3 text-xs font-bold text-slate-900">{title}</div>
                <div className="mt-1 text-[10px] text-slate-500">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
      <AIQuotationModal isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} />
    </div>
  );
}
