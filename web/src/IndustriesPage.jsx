import { useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  HardHat,
  HeartPulse,
  Hotel,
  Landmark,
  Scale,
  ShoppingBag,
  Sparkles,
  Truck,
  UtensilsCrossed,
  Warehouse
} from "lucide-react";
import UnifiedHeader from "./UnifiedHeader";
import { PublicFooter } from "./RentalPages";
import AIQuotationModal from "./AIQuotationModal";

export default function IndustriesPage() {
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const industries = [
    { title: "Corporate Offices", icon: Building2, desc: "End-to-end IT, Wi-Fi 6, Microsoft 365, conference AV and 24/7 helpdesk." },
    { title: "Financial & Banking", icon: Landmark, desc: "Fintech infrastructure, ISO 27001 cybersecurity, DLP and zero-trust VPN." },
    { title: "Healthcare & Clinics", icon: HeartPulse, desc: "DHA-compliant networks, PACS/EMR server reliability and immutable backup." },
    { title: "Hospitality & Resorts", icon: Hotel, desc: "High-density guest Wi-Fi, IP telephony, POS and central SIRA CCTV." },
    { title: "Retail & Multi-Branch", icon: ShoppingBag, desc: "Store SD-WAN interconnectivity, barcode POS and remote camera feeds." },
    { title: "Education & Universities", icon: GraduationCap, desc: "Smart campus Wi-Fi, student content filtering and computer labs." },
    { title: "Warehousing & Logistics", icon: Warehouse, desc: "Industrial high-bay Wi-Fi, handheld scanners and asset tracking." },
    { title: "Construction & Site Offices", icon: HardHat, desc: "Rapid site trailer setup, 4G/5G failover and high-spec CAD workstations." },
    { title: "Legal & Professional Services", icon: Scale, desc: "Encrypted document archives, secure client portals and audit trails." },
    { title: "Restaurants & F&B Chains", icon: UtensilsCrossed, desc: "Cloud POS resilience, kitchen display systems and customer guest portals." },
    { title: "Real Estate & Developers", icon: Building2, desc: "Central ERP servers, multi-office VPN and digital showroom displays." },
    { title: "Government & Public Sector", icon: Landmark, desc: "Strict adherence to UAE digital standards, data sovereignty and high availability." }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <UnifiedHeader onOpenQuote={() => setShowQuoteModal(true)} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#071b4a] via-[#0b245e] to-[#071b4a] py-16 text-white lg:py-24">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-300">
            <Sparkles size={13} /> UAE REGULATORY &amp; OPERATIONAL EXPERTISE
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Industries We Support Across the UAE
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Tailored technology solutions designed to address the specific security, compliance, and uptime challenges of every key industry sector.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setShowQuoteModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00a86b] px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-[#008c59]"
            >
              <span>Get Tailored Industry Quote</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {industries.map((ind) => {
              const Icon = ind.icon;
              return (
                <div
                  key={ind.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-xl"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition">
                    {ind.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {ind.desc}
                  </p>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <a
                      href="/services#requirement"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <span>Explore Stack</span>
                      <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PublicFooter />
      <AIQuotationModal isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} />
    </div>
  );
}
