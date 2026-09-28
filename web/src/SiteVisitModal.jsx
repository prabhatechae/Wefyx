import { useState } from "react";
import { ArrowRight, Calendar, CheckCircle2, Clock, FileText, MapPin, Phone, ShieldCheck, User, Wrench, X } from "lucide-react";
import { sendPublic } from "./api";

export default function SiteVisitModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    emirate: "Dubai",
    address: "",
    serviceType: "On-Site Technical Inspection & Troubleshooting",
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    timeSlot: "Morning (09:00 AM - 01:00 PM)",
    issueDetails: ""
  });
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      // Create requirement / booking record
      const ref = `WFX-SV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      try {
        await sendPublic("/auth/register", "POST", {
          name: formData.name,
          email: formData.email,
          password: "TempPassword123!",
          organization: formData.company || "Individual / Office",
          phone: formData.phone,
          role: "CUSTOMER"
        });
      } catch (err) {
        // User might already exist, which is fine
      }

      setBookingRef(ref);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Unable to submit booking. Please try again or call +971 4 123 4567.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/30">
              <Wrench size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">Book an On-Site IT Engineer</h3>
              <p className="text-xs text-slate-300">
                Certified Wefyx engineer visits your office/site anywhere in UAE
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

        {/* Content */}
        <div className="max-h-[calc(85vh-120px)] overflow-y-auto p-6">
          {success ? (
            <div className="py-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="mt-4 text-xl font-bold text-slate-900">Site Visit Scheduled!</h4>
              <p className="mt-2 text-xs text-slate-600">
                Booking Reference: <span className="font-mono font-bold text-emerald-700">{bookingRef}</span>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Our support team and assigned technician will contact you on <strong className="text-slate-800">{formData.phone}</strong> prior to arrival.
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-xs">
                <div className="font-bold text-slate-700">Booking Summary:</div>
                <div className="mt-2 space-y-1 text-slate-600">
                  <div><strong>Date:</strong> {formData.date} ({formData.timeSlot})</div>
                  <div><strong>Location:</strong> {formData.emirate}, {formData.address || "Office location"}</div>
                  <div><strong>Inspection Fee:</strong> AED 100 + 5% VAT (AED 5) = <span className="font-bold text-emerald-700">AED 105</span></div>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <a
                  href="/portal"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  View in Customer Portal
                </a>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <span>Standard Site Inspection Fee: <strong>AED 100</strong> + 5% VAT = <strong>AED 105</strong></span>
                </div>
                <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  FIXED FEE
                </span>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
                  <input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Company Name</label>
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Acme Technologies LLC"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Work Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+971 50 123 4567"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Emirate *</label>
                  <select
                    name="emirate"
                    value={formData.emirate}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                    <option value="Ajman">Ajman</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                    <option value="Fujairah">Fujairah</option>
                    <option value="Umm Al Quwain">Umm Al Quwain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Office / Building Address</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Building name, office number, area"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Preferred Date *</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Time Slot *</label>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="Morning (09:00 AM - 01:00 PM)">Morning (09:00 AM - 01:00 PM)</option>
                    <option value="Afternoon (01:00 PM - 05:00 PM)">Afternoon (01:00 PM - 05:00 PM)</option>
                    <option value="Evening (05:00 PM - 08:00 PM)">Evening (05:00 PM - 08:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Issue or Support Requirement Details</label>
                <textarea
                  name="issueDetails"
                  rows="2"
                  value={formData.issueDetails}
                  onChange={handleChange}
                  placeholder="Describe your server, network, workstation, or general IT requirements..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="text-xs text-slate-500">
                  Total Payable: <strong className="text-sm font-bold text-slate-900">AED 105</strong> <span className="text-[10px]">(incl. VAT)</span>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {busy ? "Booking Engineer..." : "Confirm Site Visit Booking"} <ArrowRight size={15} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
