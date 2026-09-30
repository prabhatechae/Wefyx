import { useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck,
  Flame,
  HardHat,
  Headphones,
  Layers,
  Lock,
  Network,
  Power,
  RefreshCw,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Wrench,
  Zap
} from "lucide-react";
import UnifiedHeader from "./UnifiedHeader";
import { PublicFooter } from "./RentalPages";
import SiteVisitModal from "./SiteVisitModal";
import AIQuotationModal from "./AIQuotationModal";

export default function DataCenterPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const phases = [
    {
      step: "01",
      title: "CONSULTATION & ASSESSMENT",
      subtitle: "Strategy, Site Feasibility & Capacity Planning",
      icon: Building2,
      points: [
        "On-site civil, power, and structural feasibility audit",
        "Tier III & Tier IV compliance architecture planning",
        "Heat load, airflow, and kW-per-rack capacity modeling",
        "Business continuity and disaster recovery risk assessment"
      ]
    },
    {
      step: "02",
      title: "PROJECT DESIGN & ENGINEERING",
      subtitle: "3D CAD, Thermal Dynamics & Electrical BOQ",
      icon: Cpu,
      points: [
        "Modular rack layout and hot/cold aisle containment design",
        "Redundant N+1 & 2N electrical distribution and UPS engineering",
        "Precision in-row & perimeter DX cooling schematics",
        "High-density optical fiber (MPO/MTP) & copper pathway routes"
      ]
    },
    {
      step: "03",
      title: "BUILD & CIVIL INFRASTRUCTURE",
      subtitle: "Raised Flooring, Power, Cooling & Fire Suppression",
      icon: HardHat,
      points: [
        "Anti-static heavy-load raised flooring and ceiling containment",
        "Modular 42U/48U high-density server rack enclosure installation",
        "Precision cooling HVAC, chiller pipes, and humidity control",
        "FM-200 / NOVEC 1230 gas fire suppression & VESDA smoke detection"
      ]
    },
    {
      step: "04",
      title: "DEPLOYMENT & INTEGRATION",
      subtitle: "Compute, Storage, Switching & Fiber Matrix",
      icon: Server,
      points: [
        "Enterprise server, SAN/NAS storage, and spine-leaf switch rack-and-stack",
        "Structured CAT6A/CAT7 copper & multi-strand fiber termination and testing",
        "Intelligent networked PDU configuration with per-outlet metering",
        "Biometric multi-factor access control and 4K CCTV surveillance"
      ]
    },
    {
      step: "05",
      title: "TESTING & COMMISSIONING",
      subtitle: "Full Load Bank, Failover & Thermal Stress Testing",
      icon: FileCheck,
      points: [
        "Heater load bank stress testing up to 100% simulated thermal capacity",
        "Mains power blackout simulation and seamless UPS-to-generator transfer",
        "Cooling failure and thermal runaway containment verification",
        "Comprehensive commissioning report and SIRA compliance sign-off"
      ]
    },
    {
      step: "06",
      title: "24/7 OPERATION & NOC MONITORING",
      subtitle: "DCIM Environmental Telemetry & Preventive AMC",
      icon: Headphones,
      points: [
        "Real-time DCIM monitoring for temperature, humidity, power draw, and airflow",
        "24/7/365 Network Operations Center (NOC) with 15-minute emergency SLA",
        "Scheduled preventive maintenance for UPS batteries, chillers, and filters",
        "Emergency on-site certified engineering team dispatch across UAE"
      ]
    }
  ];

  const standards = [
    { title: "Tier III / IV Architecture", desc: "99.982% to 99.995% uptime availability with concurrent maintainability." },
    { title: "UAE Regulatory Compliance", desc: "Aligned with TDRA, Civil Defense fire codes, SIRA security, and DEWA power standards." },
    { title: "Eco-Efficient PUE < 1.3", desc: "Advanced airflow containment and variable-speed cooling to slash operating costs." },
    { title: "Turnkey Accountability", desc: "Single vendor contract from initial slab inspection through ongoing operations." }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <UnifiedHeader
        onOpenQuote={() => setShowQuoteModal(true)}
        onOpenVisit={() => setShowSurveyModal(true)}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#09482e] via-[#0c5d3b] to-[#09482e] py-16 text-white lg:py-24">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#008553_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <Sparkles size={13} /> MISSION-CRITICAL DATA CENTER ENGINEERING
              </div>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-5xl">
                Data Center Design &amp; Construction
              </h1>
              <p className="mt-2 text-xl font-medium text-emerald-300">
                From Concept to Mission-Critical Infrastructure.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Wefyx delivers end-to-end data center solutions across Dubai, Abu Dhabi, and the UAE. We engineer high-density, energy-efficient server rooms with redundant power, precision thermal management, optical cabling, and 24/7 NOC oversight.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00a86b] px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-[#008c59]"
                >
                  <span>Book Free Site Survey</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <span>Request BOQ &amp; Estimate</span>
                  <FileCheck size={15} />
                </button>
              </div>

              {/* Badges */}
              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
                {[
                  ["Tier III & IV", "Uptime Standard"],
                  ["SIRA & Civil Defense", "UAE Approved"],
                  ["N+1 / 2N", "Redundant Power"],
                  ["24/7 NOC", "Telemetry SLA"]
                ].map(([val, label]) => (
                  <div key={val}>
                    <div className="text-lg font-bold text-white">{val}</div>
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-900/80 p-6 backdrop-blur shadow-2xl">
                <img
                  src="/images/wefyx-data-center-v2.png"
                  alt="Wefyx Data Center Construction"
                  className="h-56 w-full rounded-xl object-cover object-center shadow"
                />
                <div className="mt-5 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Core Technical Systems:
                  </div>
                  {[
                    "Precision In-Row DX & Chilled Water Cooling",
                    "Modular Server Racks & Aisle Containment",
                    "Dual-Bus Modular UPS & Emergency Generators",
                    "Structured High-Density MPO/CAT6A Cabling",
                    "Gas Fire Suppression (FM-200 / NOVEC 1230)",
                    "Biometric Access & Environmental DCIM"
                  ].map(s => (
                    <div key={s} className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Phase Lifecycle Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              TURNKEY LIFECYCLE METHODOLOGY
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-[#09482e] sm:text-4xl">
              Complete Data Center Project Lifecycle
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
              Every phase is executed by certified data center architects and engineers to guarantee compliance, efficiency, and zero unplanned downtime.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {phases.map(phase => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.step}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-emerald-400 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Icon size={22} />
                    </div>
                    <span className="font-mono text-2xl font-black text-slate-200 group-hover:text-emerald-200 transition">
                      {phase.step}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-extrabold text-slate-900">
                    {phase.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-emerald-600">
                    {phase.subtitle}
                  </p>

                  <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
                    {phase.points.map(pt => (
                      <li key={pt} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Engineering Standards Strip */}
      <section className="bg-slate-50 border-y border-slate-200 py-12">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {standards.map(std => (
              <div key={std.title} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="text-sm font-extrabold text-[#09482e]">{std.title}</div>
                <div className="mt-2 text-xs text-slate-600 leading-relaxed">{std.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#09482e] py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Planning a Server Room or Data Center Facility?
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Schedule a comprehensive on-site engineering survey with our certified data center specialists anywhere in the UAE.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setShowSurveyModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00a86b] px-6 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-[#008c59]"
            >
              <span>Book Site Survey (AED 105)</span>
              <ArrowRight size={15} />
            </button>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-xs font-bold text-white transition hover:bg-white/10"
            >
              <span>Speak with an Architect</span>
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />

      <SiteVisitModal isOpen={showSurveyModal} onClose={() => setShowSurveyModal(false)} />
      <AIQuotationModal isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} />
    </div>
  );
}
