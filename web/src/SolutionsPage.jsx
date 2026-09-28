import { useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Hotel,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Store,
  Truck,
  Wrench,
  Zap
} from "lucide-react";
import UnifiedHeader from "./UnifiedHeader";
import { PublicFooter } from "./RentalPages";
import AIQuotationModal from "./AIQuotationModal";
import SiteVisitModal from "./SiteVisitModal";

export default function SolutionsPage() {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const solutions = [
    {
      id: "corporate",
      title: "Corporate Office IT Infrastructure",
      subtitle: "Turnkey technology for modern workplaces in Dubai & Abu Dhabi",
      icon: Building2,
      desc: "From CAT6A structured cabling and enterprise Wi-Fi 6 to cloud telephony, Microsoft 365, meeting room video conference systems, and 24/7 helpdesk.",
      modules: [
        "High-density Wi-Fi 6 (Aruba / UniFi) with zero dead-zones",
        "Conference room 4K cameras, touch panels, and soundbars",
        "Managed firewall (Fortinet / Sophos) with secure VPN for remote staff",
        "Desktop, laptop, and printer fleet management with automated patching"
      ]
    },
    {
      id: "hospitality",
      title: "Hospitality & Hotel Technology",
      subtitle: "Seamless guest Wi-Fi, IP telephony & PMS integration",
      icon: Hotel,
      desc: "Engineered for hotels, resorts, and restaurants across the UAE requiring reliable high-bandwidth guest networks and point-of-sale uptime.",
      modules: [
        "Captive portal guest Wi-Fi with SMS / PMS authentication",
        "IP-PBX telephone systems for guest rooms and administration",
        "SIRA-compliant CCTV surveillance and central NVR storage",
        "High availability POS network failover to 4G/5G backup"
      ]
    },
    {
      id: "healthcare",
      title: "Healthcare & Clinic IT Systems",
      subtitle: "Secure EMR, DHA compliance & reliable medical backup",
      icon: Stethoscope,
      desc: "Compliant technology infrastructure for dental centers, polyclinics, and hospitals adhering to UAE health data regulations.",
      modules: [
        "Immutable patient data backup & disaster recovery",
        "Encrypted Wi-Fi separating clinical devices from guest access",
        "High-availability server infrastructure for EMR / PACS software",
        "Strict role-based access control and cyber threat defense"
      ]
    },
    {
      id: "retail",
      title: "Retail & Multi-Store IT Systems",
      subtitle: "Centralized networking, POS uptime & inventory sync",
      icon: Store,
      desc: "Connect multi-branch retail stores to your central ERP with zero-latency SD-WAN and automated night backups.",
      modules: [
        "SD-WAN site-to-site tunnels linking branches to headquarters",
        "Thermal receipt printer, barcode scanner & cash drawer setup",
        "Store CCTV surveillance with remote mobile viewing",
        "Rapid replacement hardware SLA within 2 hours"
      ]
    },
    {
      id: "logistics",
      title: "Warehousing & Logistics IT",
      subtitle: "Rugged Wi-Fi, handheld scanners & long-range CCTV",
      icon: Truck,
      desc: "Robust technology designed for high-ceiling warehouses in JAFZA, DIC, KIZAD, and industrial zones.",
      modules: [
        "Narrow-beam directional Wi-Fi penetrating high metal racking",
        "Zebra & Honeywell industrial handheld scanner integration",
        "Long-range perimeter AI security cameras and license plate recognition",
        "UPS battery power backup resilient against power fluctuations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <UnifiedHeader
        onOpenQuote={() => setShowQuoteModal(true)}
        onOpenVisit={() => setShowVisitModal(true)}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#071b4a] via-[#0b245e] to-[#071b4a] py-16 text-white lg:py-24">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-300">
            <Sparkles size={13} /> TURNKEY ENTERPRISE BLUEPRINTS
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Business Technology Solutions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Engineered specifically for UAE operating environments. One accountable partner for design, procurement, deployment, and ongoing management.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setShowQuoteModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00a86b] px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-[#008c59]"
            >
              <span>Get AI Solution Quote</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => setShowVisitModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold text-white transition hover:bg-white/20"
            >
              <span>Book Site Inspection (AED 105)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 space-y-12">
          {solutions.map((sol, index) => {
            const Icon = sol.icon;
            const isEven = index % 2 === 1;
            return (
              <div
                key={sol.id}
                id={sol.id}
                className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-blue-300 hover:shadow-xl lg:grid-cols-12 lg:gap-12"
              >
                <div className={`lg:col-span-7 ${isEven ? "lg:order-2" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-[#071b4a] sm:text-2xl">{sol.title}</h2>
                      <p className="text-xs font-semibold text-emerald-600">{sol.subtitle}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {sol.desc}
                  </p>

                  <div className="mt-6 space-y-2.5">
                    {sol.modules.map(mod => (
                      <div key={mod} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{mod}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setShowQuoteModal(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                    >
                      <span>Request Proposal</span>
                      <ArrowRight size={14} />
                    </button>
                    <a
                      href="/services#requirement"
                      className="text-xs font-bold text-slate-700 hover:text-blue-600"
                    >
                      Custom Specs &rarr;
                    </a>
                  </div>
                </div>

                <div className={`lg:col-span-5 ${isEven ? "lg:order-1" : ""}`}>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <div className="font-bold text-slate-900 text-sm">Included Deliverables:</div>
                    <div className="mt-3 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span>Hardware Supply</span>
                        <span className="font-bold text-slate-900">Tier-1 Brands</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span>Installation &amp; Cable Testing</span>
                        <span className="font-bold text-slate-900">Fluke Certified</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span>Warranty &amp; Support</span>
                        <span className="font-bold text-slate-900">1-3 Years SLA</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span>Deployment SLA</span>
                        <span className="font-bold text-emerald-600">Fast Turnaround</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <PublicFooter />
      <AIQuotationModal isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} />
      <SiteVisitModal isOpen={showVisitModal} onClose={() => setShowVisitModal(false)} />
    </div>
  );
}
