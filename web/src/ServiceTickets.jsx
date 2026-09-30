import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileCheck,
  FileText,
  Headphones,
  Image,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  User,
  UserRound,
  Wrench,
  X
} from "lucide-react";
import { downloadFile, get, send, uploadFiles } from "./api";
import {
  Back,
  BookingLayout,
  Empty,
  ErrorMessage,
  Field,
  Heading,
  Primary,
  SignIn,
  StatusBadge,
  Summary,
  supportNames,
  useRoute,
  useSession
} from "./BookingUI";

export default function ServiceTickets({ employee = false, notification = false }) {
  const [path, navigate] = useRoute();
  const { user, loading: sessionLoading } = useSession();
  const [filter, setFilter] = useState("All Tickets");
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(notification);

  // Demo ticket data matching Image 2
  const [tickets, setTickets] = useState([
    {
      id: "WFX-20250912-001",
      reference: "#WFX-20250912-001",
      supportType: "SITE_VISIT",
      status: "COMPLETED",
      company: "Acme Trading LLC",
      contactName: "Ahmed Khan",
      phone: "+971 50 123 4567",
      subject: "Office internet not working",
      category: "Network Issue",
      description: "Our office internet is not working since morning. Please check and fix.",
      date: "12 Sep 2025",
      time: "11:00 AM - 12:00 PM",
      address: "Office 1204, Business Bay, Dubai, UAE",
      emirate: "Dubai",
      engineerName: "Kareem Mansour",
      engineerRole: "Senior Network Engineer",
      raisedAt: "12 Sep 2025, 09:15 AM",
      assignedAt: "12 Sep 2025, 09:30 AM",
      onSiteAt: "12 Sep 2025, 11:00 AM",
      completedAt: "12 Sep 2025, 12:30 PM",
      workSummary: "Reconfigured the router and fixed the internet issue. All systems working now.",
      actionsTaken: [
        "Checked router and cables",
        "Reconfigured network settings",
        "Tested internet connectivity",
        "Verified all systems"
      ],
      photos: ["/images/product-switch.png", "/images/product-access-point-v2.png"]
    }
  ]);

  const [selectedTicket, setSelectedTicket] = useState(tickets[0]);
  const [reportForm, setReportForm] = useState({
    status: "Completed",
    summary: "Reconfigured the router and fixed the internet issue. All systems working now.",
    actions: [
      "Checked router and cables",
      "Reconfigured network settings",
      "Tested internet connectivity",
      "Verified all systems"
    ]
  });

  const filteredTickets = tickets.filter((t) => {
    if (filter === "All Tickets") return true;
    if (filter === "Completed") return t.status === "COMPLETED";
    if (filter === "In Progress") return t.status === "IN_PROGRESS";
    if (filter === "Open") return t.status === "ASSIGNED" || t.status === "OPEN";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <BookingLayout
        title={employee ? "Technician Service Portal" : "My Support Tickets"}
        breadcrumb={employee ? "Tasks & Reports" : "My Tickets"}
      >
        {/* Client Ticket View (Matching Image 2 Client View) */}
        {!employee && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  My Support Tickets
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track your support requests and view updates.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Smartphone size={14} className="text-emerald-600" />
                  <span>Preview Notification</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                >
                  <Wrench size={14} />
                  <span>Technician View</span>
                </button>
                <a
                  href="/book-support"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a86b] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#008c59]"
                >
                  <Plus size={14} />
                  <span>Book Service</span>
                </a>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-5 flex items-center gap-2 border-b border-slate-200 pb-3">
              {["All Tickets", "Open", "In Progress", "Completed"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                    filter === tab
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tickets List */}
            <div className="mt-6 space-y-6">
              {filteredTickets.map((t) => (
                <div
                  key={t.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  {/* Ticket Header & Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                        <Wrench size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-900">
                            {t.reference}
                          </span>
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            {supportNames[t.supportType] || "Site Visit"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {t.date}, {t.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                        Completed
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(t);
                          setShowReportModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700"
                      >
                        <span>View Report</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Ticket Info */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span>
                        <strong>{t.contactName}</strong> · {t.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-slate-400" />
                      <span>{t.subject}</span>
                    </div>
                  </div>

                  {/* 4-Stage Progress Timeline Bar Matching Image 2 */}
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {/* Stage 1 */}
                      <div className="flex flex-col items-center">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                          ✓
                        </div>
                        <div className="mt-1.5 font-bold text-slate-900 text-[11px]">
                          Ticket Raised
                        </div>
                        <div className="text-[10px] text-slate-400">{t.raisedAt}</div>
                      </div>

                      {/* Stage 2 */}
                      <div className="flex flex-col items-center">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                          ✓
                        </div>
                        <div className="mt-1.5 font-bold text-slate-900 text-[11px]">
                          Assigned to Engineer
                        </div>
                        <div className="text-[10px] text-slate-400">{t.assignedAt}</div>
                      </div>

                      {/* Stage 3 */}
                      <div className="flex flex-col items-center">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                          ✓
                        </div>
                        <div className="mt-1.5 font-bold text-slate-900 text-[11px]">
                          Engineer On Site
                        </div>
                        <div className="text-[10px] text-slate-400">{t.onSiteAt}</div>
                      </div>

                      {/* Stage 4 */}
                      <div className="flex flex-col items-center">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                          ✓
                        </div>
                        <div className="mt-1.5 font-bold text-slate-900 text-[11px]">
                          Service Completed
                        </div>
                        <div className="text-[10px] text-slate-400">{t.completedAt}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technician / Employee View (Matching Image 2 Employee Screen) */}
        {employee && (
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                <span className="text-emerald-700 border-b-2 border-emerald-600 pb-2">
                  My Tasks
                </span>
                <span className="hover:text-slate-900 cursor-pointer">Calendar</span>
                <span className="hover:text-slate-900 cursor-pointer">Clients</span>
                <span className="hover:text-slate-900 cursor-pointer">Reports</span>
              </div>
              <a
                href="/my-tickets"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Switch to Customer View
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Site Visit
                  </span>
                  <h3 className="mt-2 text-lg font-black text-slate-900">
                    New Assigned Ticket #WFX-20250912-001
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="rounded-xl bg-[#00a86b] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#008c59]"
                >
                  Update Report
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div>
                  <span className="text-slate-400">Client:</span>{" "}
                  <strong>Acme Trading LLC</strong>
                </div>
                <div>
                  <span className="text-slate-400">Contact:</span>{" "}
                  <strong>Ahmed Khan (+971 50 123 4567)</strong>
                </div>
                <div>
                  <span className="text-slate-400">Issue:</span>{" "}
                  <strong>Office internet not working</strong>
                </div>
                <div>
                  <span className="text-slate-400">Date &amp; Time:</span>{" "}
                  <strong>12 Sep 2025, 11:00 AM</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Address:</span>{" "}
                  <strong>Office 1204, Business Bay, Dubai, UAE</strong>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-slate-700">Update Service Status:</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-600">
                      1 Accepted
                    </span>
                    <span>&rarr;</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-600">
                      2 In Progress
                    </span>
                    <span>&rarr;</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
                      3 Completed
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 1: Employee App - Update Report (Matching Image 2 Mobile Report Screen) */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setShowReportModal(false)}
            />
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
              {/* Phone Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-5 py-4 text-white">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">
                    Update Service Report
                  </h3>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Service Status
                  </label>
                  <select
                    value={reportForm.status}
                    onChange={(e) =>
                      setReportForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Parts Needed">Parts Needed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Work Summary
                  </label>
                  <textarea
                    rows={3}
                    value={reportForm.summary}
                    onChange={(e) =>
                      setReportForm((prev) => ({ ...prev, summary: e.target.value }))
                    }
                    placeholder="Reconfigured the router and fixed the internet issue. All systems working now."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs leading-relaxed focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-2">
                    Actions Taken
                  </label>
                  <div className="space-y-2">
                    {[
                      "Checked router and cables",
                      "Reconfigured network settings",
                      "Tested internet connectivity",
                      "Verified all systems"
                    ].map((act) => (
                      <label
                        key={act}
                        className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          defaultChecked
                          className="accent-emerald-600 rounded"
                        />
                        <span className="text-slate-700 font-medium">{act}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Upload Photos (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                      <img
                        src="/images/product-switch.png"
                        alt="Router inspection"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="h-16 w-16 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                      <img
                        src="/images/product-access-point-v2.png"
                        alt="Cables testing"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      className="h-16 w-16 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-500 hover:text-emerald-600"
                    >
                      <Plus size={16} />
                      <span className="text-[10px] font-bold mt-1">+ Add</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="w-full rounded-xl bg-[#00a86b] py-3 font-bold text-white shadow-md shadow-emerald-600/25 hover:bg-[#008c59]"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Customer Notification (Matching Image 2 Mobile Notification View) */}
        {showNotificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setShowNotificationModal(false)}
            />
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>

              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-[#00a86b]">
                <CheckCircle2 size={32} />
              </div>

              <div className="mt-4 font-bold text-slate-900 text-base">
                Wefyx Support Update
              </div>
              <p className="mt-1 font-mono text-xs font-bold text-emerald-700">
                #WFX-20250912-001
              </p>

              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                Your support request has been completed. Our technician has resolved the issue. Please check the service report for full details.
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotificationModal(false);
                    setShowReportModal(true);
                  }}
                  className="w-full rounded-xl bg-[#00a86b] py-2.5 text-xs font-bold text-white shadow hover:bg-[#008c59]"
                >
                  View Service Report
                </button>
                <div className="text-[10px] text-slate-400 mt-2">
                  Thank you, Wefyx Support Team
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Quick Switch to Technician View from Customer View */}
        {showEmployeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setShowEmployeeModal(false)}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h3 className="text-base font-black text-slate-900">
                Technician / Employee Mode
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                You can switch between client ticket tracker and the employee on-site task app.
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href="/service-tasks"
                  className="flex-1 text-center rounded-xl bg-[#00a86b] py-2.5 text-xs font-bold text-white hover:bg-[#008c59]"
                >
                  Open Employee App
                </a>
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </BookingLayout>
    </div>
  );
}
