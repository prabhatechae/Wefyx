import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  FileCheck,
  FileClock,
  FilePlus2,
  FileText,
  Headphones,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MoreVertical,
  Package,
  PanelLeftClose,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Ticket,
  User,
  Wrench,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { downloadFile, get, send, uploadFiles } from "./api";
import { clearDraftFiles, loadDraftFiles } from "./draftFiles";

const initialRequest = {
  title: "",
  description: "",
  category: "General service",
  priority: "Medium",
  quotationRequested: true,
};

const statusStyle = {
  SUBMITTED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border border-amber-200",
  SENT_TO_VENDOR: "bg-purple-50 text-purple-700 border border-purple-200",
  VENDOR_ACCEPTED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  IN_PROGRESS: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-600 border border-slate-200",
  DECLINED: "bg-red-50 text-red-700 border border-red-200",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
};

const priorityColors = {
  Urgent: "bg-red-50 text-red-700 border border-red-200",
  High: "bg-amber-50 text-amber-700 border border-amber-200",
  Medium: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Low: "bg-slate-100 text-slate-600 border border-slate-200",
};

const roleStyles = {
  SUPER_ADMIN: "bg-amber-100 text-amber-800 border border-amber-300",
  EMPLOYEE: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  CUSTOMER: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  VENDOR: "bg-purple-100 text-purple-800 border border-purple-300",
};

const niceRole = (role = "") => {
  const r = String(role || "").toUpperCase();
  if (r.includes("SUPER") || r.includes("ADMIN")) return "Super Admin";
  if (r.includes("EMPLOYEE")) return "Support Specialist";
  if (r.includes("VENDOR")) return "Vendor Partner";
  if (r.includes("CUSTOMER")) return "Customer";
  return role || "User";
};

const readable = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (x) => x.toUpperCase());

const fmt = (n) => Number(n || 0).toLocaleString();

export default function CustomerPortal({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [requests, setRequests] = useState([]);
  const [ticketFilter, setTicketFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);
  const [selected, setSelected] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [files, setFiles] = useState([]);
  const [draftFiles, setDraftFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(initialRequest);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const rows = await get("/requirements?view=customer");
      setRequests(Array.isArray(rows) ? rows : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = () => {
    get("/notifications")
      .then((rows) => setNotifications(Array.isArray(rows) ? rows : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadDraftFiles().then(setDraftFiles).catch(() => {});
    load();
    loadNotifications();
    const timer = setInterval(() => {
      load();
      loadNotifications();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Real-time live conversation polling
  useEffect(() => {
    if (!selected) return;
    const pollTimer = setInterval(() => {
      get(`/requirements/${selected.id}/messages`)
        .then((chat) => setMessages(chat || []))
        .catch(() => {});
    }, 3000);
    return () => clearInterval(pollTimer);
  }, [selected?.id]);

  const stats = useMemo(() => {
    const total = requests.length;
    const underReview = requests.filter(
      (x) => x.status === "SUBMITTED" || x.status === "UNDER_REVIEW"
    ).length;
    const quotesCount = requests.filter(
      (x) => x.quotationStatus === "SHARED_WITH_CUSTOMER" || x.quotationStatus === "SUBMITTED"
    ).length;
    const inProgress = requests.filter(
      (x) => x.status === "IN_PROGRESS" || x.status === "SENT_TO_VENDOR" || x.status === "ACCEPTED"
    ).length;
    const resolved = requests.filter(
      (x) => x.status === "RESOLVED" || x.status === "CLOSED"
    ).length;

    return { total, underReview, quotes: quotesCount, inProgress, resolved };
  }, [requests]);

  const chartData = useMemo(() => {
    const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];
    const baseValues = [4, 7, 9, 14, 19, Math.max(22, requests.length || 24)];
    return months.map((m, i) => ({
      m,
      v: baseValues[i],
    }));
  }, [requests.length]);

  const pieData = useMemo(() => {
    return [
      { name: "In Progress", value: Math.max(1, stats.inProgress), color: "#00a86b" },
      { name: "Under Review", value: Math.max(1, stats.underReview), color: "#008553" },
      { name: "Quotes Ready", value: Math.max(1, stats.quotes), color: "#66ecb4" },
      { name: "Resolved", value: Math.max(1, stats.resolved), color: "#10b981" },
    ];
  }, [stats]);

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        `${item.title} ${item.reference} ${item.category} ${item.description} ${item.priority} ${item.status}`
          .toLowerCase()
          .includes(q);

      const matchesTab =
        ticketFilter === "All" ||
        (ticketFilter === "Open" && ["SUBMITTED", "UNDER_REVIEW"].includes(item.status)) ||
        (ticketFilter === "In Progress" &&
          ["IN_PROGRESS", "ACCEPTED", "SENT_TO_VENDOR"].includes(item.status)) ||
        (ticketFilter === "Quotes" &&
          item.quotationStatus === "SHARED_WITH_CUSTOMER") ||
        (ticketFilter === "Resolved" && ["RESOLVED", "CLOSED"].includes(item.status));

      return matchesSearch && matchesTab;
    });
  }, [requests, searchQuery, ticketFilter]);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  async function create(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setBusy(true);
    setFormError("");
    try {
      const saved = await send("/requirements", "POST", {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        customerName: user?.name || "Customer",
        organization: user?.organization || "Acme Trading LLC",
      });
      const pending = [...draftFiles, ...files];
      if (pending.length) await uploadFiles(`/requirements/${saved.id}/attachments`, pending);
      await clearDraftFiles().catch(() => {});
      setDraftFiles([]);
      setFiles([]);
      setForm(initialRequest);
      setOpenNew(false);
      showToast("Requirement submitted successfully!");
      await load();
    } catch (error) {
      setFormError(error.message || "Unable to submit this requirement.");
    } finally {
      setBusy(false);
    }
  }

  async function view(item) {
    setSelected(item);
    try {
      const [offers, chat, docs] = await Promise.all([
        get(`/requirements/${item.id}/quotations?view=customer`).catch(() => []),
        get(`/requirements/${item.id}/messages`).catch(() => []),
        get(`/requirements/${item.id}/attachments`).catch(() => []),
      ]);
      setQuotes(offers || []);
      setMessages(chat || []);
      setAttachments(docs || []);
    } catch {
      // fallback
    }
  }

  async function chooseQuote(quote) {
    if (!selected) return;
    setBusy(true);
    try {
      const updated =
        quote.status === "STAFF_APPROVED"
          ? await send(`/requirements/${selected.id}/quotations/${quote.id}/confirm`, "PATCH", {
              decision: "CONFIRM",
            })
          : await send(`/requirements/${selected.id}/quotations/${quote.id}/select`, "PATCH", {});
      showToast("Quotation accepted & order confirmed!");
      await load();
      await view(updated.requirementId ? selected : updated);
    } catch (e) {
      showToast(e.message || "Failed to confirm quotation.");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage(e) {
    e?.preventDefault();
    if (!selected || !message.trim()) return;
    setBusy(true);
    try {
      const saved = await send(`/requirements/${selected.id}/messages`, "POST", {
        message: message.trim(),
        senderName: user?.name || "Customer",
        senderRole: "CUSTOMER",
      });
      setMessage("");
      setMessages((prev) => [...prev, saved]);
    } catch (err) {
      showToast(err?.message || "Failed to send message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8fcfa] text-slate-900 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in">
          <CheckCircle2 size={16} className="text-[#00a86b]" />
          <span>{toast}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR (Dark Navy with #00a86b Green Active)     */}
      {/* ======================================================== */}
      <aside
        className={`${
          sidebarOpen ? "w-[220px]" : "w-0 lg:w-[70px]"
        } fixed inset-y-0 left-0 z-40 flex flex-col bg-[#09482e] text-white transition-all duration-300 ease-in-out lg:static shadow-xl`}
      >
        <div className="flex h-20 min-w-[220px] items-center border-b border-white/10 px-5">
          <div className="leading-tight">
            <div className="text-2xl font-bold tracking-tight text-white">
              wefyx<span className="text-[#00a86b]">.pro</span>
            </div>
            <div className="text-[10px] text-slate-300">
              IT Support | Asset Rental | NOC
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 text-xs font-semibold">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            CUSTOMER PORTAL
          </div>

          {[
            { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "Requirements", label: "My Requirements", icon: ClipboardList },
            { id: "Tickets", label: "Support Tickets", icon: Ticket },
            { id: "Rentals", label: "Asset Rentals", icon: Package },
            { id: "Contracts", label: "Contracts (AMC)", icon: FileClock },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveNav(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition ${
                  isActive
                    ? "bg-[#00a86b] text-white font-bold shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
              </button>
            );
          })}

          <div className="mt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            COMMUNICATION
          </div>

          {[
            {
              id: "Notifications",
              label: "Notifications",
              icon: Bell,
              badge: notifications.filter((x) => !x.read).length,
            },
            { id: "Messages", label: "Messages", icon: Mail },
            { id: "Help", label: "Help Center", icon: HelpCircle },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveNav(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition ${
                  isActive
                    ? "bg-[#00a86b] text-white font-bold shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
                {sidebarOpen && item.badge > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <PanelLeftClose size={15} />
            {sidebarOpen && <span>Collapse Menu</span>}
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN HEADER & BODY                                    */}
      {/* ======================================================== */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6 shadow-xs">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                {activeNav === "Dashboard" ? "Customer Dashboard" : activeNav}
              </h1>
              <p className="text-[11px] text-slate-500">
                {user?.organization || "Wefyx Technologies"} › {activeNav}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <div className="hidden h-9 w-52 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs xl:flex lg:w-64">
              <Search size={14} className="text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everything..."
                className="w-full bg-transparent outline-none text-xs"
              />
            </div>

            {/* Org Badge */}
            <div className="hidden items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 lg:flex">
              <Building2 size={15} className="text-[#00a86b]" />
              <span>{user?.organization || "Acme Trading LLC"}</span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setActiveNav("Notifications")}
              title="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                {notifications.filter((x) => !x.read).length || 6}
              </span>
            </button>

            {/* Messages */}
            <button
              type="button"
              onClick={() => setActiveNav("Messages")}
              title="Messages"
              className="relative hidden h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:grid"
            >
              <Mail size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#00a86b]" />
            </button>

            {/* Help */}
            <button
              type="button"
              onClick={() => setActiveNav("Help")}
              title="Help Center"
              className="hidden h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:grid"
            >
              <HelpCircle size={18} />
            </button>

            {/* Profile & Logout */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 font-bold text-[#00a86b]">
                {(user?.name || "Customer")[0].toUpperCase()}
              </div>
              <div className="hidden text-left xl:block">
                <b className="block text-xs font-semibold text-slate-900 leading-tight">
                  {user?.name || "Ahmed Khan"}
                </b>
                <span className="block text-[10px] text-slate-500">Customer Account</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Sign out"
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] w-full">
          {activeNav === "Dashboard" && (
            <>
              {/* ======================================================== */}
              {/* 3. METRIC CARDS ROW (Exact Admin Dashboard Theme)        */}
              {/* ======================================================== */}
              <div className="flex gap-3 overflow-x-auto pb-1">
                {/* Total Requests */}
                <div className="flex min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ClipboardList size={21} />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Total Requests</div>
                    <div className="text-xl font-bold text-slate-900">{fmt(stats.total || requests.length)}</div>
                    <div className="mt-1 text-[10px] text-emerald-500 font-semibold">
                      + 8.8% <span className="text-slate-400 font-normal">vs last week</span>
                    </div>
                  </div>
                </div>

                {/* Under Review */}
                <div className="flex min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
                    <Clock3 size={21} />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Under Review</div>
                    <div className="text-xl font-bold text-slate-900">{fmt(stats.underReview)}</div>
                    <div className="mt-1 text-[10px] text-emerald-500 font-semibold">
                      + 8.6% <span className="text-slate-400 font-normal">vs last week</span>
                    </div>
                  </div>
                </div>

                {/* Quotes to Review */}
                <div className="flex min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-purple-50 text-purple-600">
                    <Sparkles size={21} />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Quotes Ready</div>
                    <div className="text-xl font-bold text-slate-900">{fmt(stats.quotes)}</div>
                    <div className="mt-1 text-[10px] text-emerald-500 font-semibold">
                      + 8.6% <span className="text-slate-400 font-normal">vs last week</span>
                    </div>
                  </div>
                </div>

                {/* In Progress */}
                <div className="flex min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Headphones size={21} />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">In Progress</div>
                    <div className="text-xl font-bold text-slate-900">{fmt(stats.inProgress)}</div>
                    <div className="mt-1 text-[10px] text-emerald-500 font-semibold">
                      + 8.8% <span className="text-slate-400 font-normal">vs last week</span>
                    </div>
                  </div>
                </div>

                {/* Resolved / Active Tickets */}
                <div className="flex min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-[#00a86b]">
                    <CheckCircle2 size={21} />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Resolved</div>
                    <div className="text-xl font-bold text-slate-900">{fmt(stats.resolved)}</div>
                    <div className="mt-1 text-[10px] text-emerald-500 font-semibold">
                      + 12.4% <span className="text-slate-400 font-normal">vs last week</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* 4. CHARTS ROW (Line Chart & Donut Chart)                 */}
              {/* ======================================================== */}
              <div className="grid gap-4 xl:grid-cols-3">
                {/* Line Chart */}
                <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm xl:col-span-2">
                  <div className="mb-4 text-sm font-bold text-slate-900">
                    Request Growth{" "}
                    <span className="text-[10px] font-normal text-slate-400">
                      (Last 6 Months)
                    </span>
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid stroke="#edf7f3" vertical={false} />
                        <XAxis dataKey="m" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="v"
                          stroke="#008553"
                          strokeWidth={3}
                          dot={{ fill: "white", stroke: "#008553", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div className="mb-2 text-sm font-bold text-slate-900">Requests by Status</div>
                  <div className="h-52 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={54}
                          outerRadius={78}
                          dataKey="value"
                        >
                          {pieData.map((x) => (
                            <Cell key={x.name} fill={x.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <b className="text-xl font-black text-slate-900">{fmt(requests.length || 1)}</b>
                      <span className="text-[10px] text-slate-400">Total</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 text-[9px] pt-2">
                    {pieData.map((x) => (
                      <span key={x.name} className="flex items-center gap-1 font-semibold text-slate-700">
                        <i
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: x.color }}
                        />
                        {x.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* 5. REQUIREMENTS MANAGEMENT TABLE (Exact Admin Style)      */}
              {/* ======================================================== */}
              <div className="rounded-xl border border-slate-200/70 bg-white shadow-sm overflow-hidden">
                {/* Table Header & Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Requirements Management</h2>
                    <p className="text-[11px] text-slate-500">
                      Manage all platform requirements, track quotations and live fulfillment status.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 lg:max-w-[260px]">
                      <Search size={14} className="text-slate-400" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-xs outline-none"
                        placeholder="Search requirements..."
                      />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                      {["All", "Open", "Quotes", "In Progress", "Resolved"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setTicketFilter(tab)}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                            ticketFilter === tab
                              ? "bg-white text-slate-900 shadow-xs font-bold"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* + New Requirement */}
                    <button
                      type="button"
                      onClick={() => setOpenNew(true)}
                      className="flex h-9 items-center gap-2 rounded-lg bg-[#00a86b] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#00965f] transition"
                    >
                      <Plus size={16} />
                      <span>New Requirement</span>
                    </button>

                    {/* Refresh */}
                    <button
                      type="button"
                      onClick={load}
                      title="Refresh"
                      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#00a86b] transition"
                    >
                      <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-xs text-left">
                    <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Requirement</th>
                        <th>Category</th>
                        <th>Organization</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Quotation</th>
                        <th>Created On</th>
                        <th className="pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedRequests.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => view(item)}
                          className="cursor-pointer transition hover:bg-slate-50/70"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-[#00a86b] font-bold shrink-0">
                                <ClipboardList size={16} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <b className="truncate font-semibold text-slate-900">{item.title}</b>
                                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                    {item.reference}
                                  </span>
                                </div>
                                <div className="truncate text-[10px] text-slate-400 max-w-xs">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="font-medium text-slate-700">{item.category || "General"}</span>
                          </td>
                          <td>
                            <b className="font-medium text-slate-800">{item.organization || user?.organization || "Wefyx"}</b>
                            <div className="text-[10px] text-slate-400">Dubai, UAE</div>
                          </td>
                          <td>
                            <span
                              className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                priorityColors[item.priority] || priorityColors.Medium
                              }`}
                            >
                              {item.priority || "Medium"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                statusStyle[item.status] || "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {readable(item.status)}
                            </span>
                          </td>
                          <td>
                            {item.quotationStatus === "SHARED_WITH_CUSTOMER" ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                <Sparkles size={11} /> Quote Ready
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                {readable(item.quotationStatus || "Pending")}
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="text-slate-600">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "May 26, 2026"}
                            </span>
                          </td>
                          <td className="pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => view(item)}
                                title="View details"
                                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-[#00a86b] hover:border-[#00a86b]"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => view(item)}
                                title="Messages"
                                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:border-emerald-300"
                              >
                                <MessageCircle size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {!loading && filteredRequests.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-10 text-center text-slate-400">
                            No requirements found. Click &ldquo;New Requirement&rdquo; to submit a request.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
                  <div>
                    Showing 1 to {Math.min(paginatedRequests.length, pageSize)} of {filteredRequests.length} requirements
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                    >
                      &lt;
                    </button>
                    <span className="font-semibold text-slate-800">{currentPage}</span>
                    <button
                      disabled={currentPage * pageSize >= filteredRequests.length}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
                    >
                      &gt;
                    </button>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="ml-2 h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none"
                    >
                      <option value={5}>5 / page</option>
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* REQUIREMENTS STANDALONE VIEW                            */}
          {/* ======================================================== */}
          {activeNav === "Requirements" && (
            <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">My Requirements</h2>
                  <p className="text-xs text-slate-500">
                    Track quotations, review SLA milestones, and communicate with support engineers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenNew(true)}
                  className="flex h-9 items-center gap-2 rounded-lg bg-[#00a86b] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#00965f] transition"
                >
                  <Plus size={16} />
                  <span>New Requirement</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {requests.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => view(item)}
                    className="flex cursor-pointer items-center justify-between gap-4 p-4 transition hover:bg-slate-50/80 rounded-xl"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#00a86b]">
                        <ClipboardList size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <b className="truncate text-sm font-bold text-slate-900">{item.title}</b>
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            {item.reference}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${
                          statusStyle[item.status] || "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {readable(item.status)}
                      </span>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TICKETS VIEW                                            */}
          {/* ======================================================== */}
          {activeNav === "Tickets" && (
            <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Support Tickets</h2>
                  <p className="text-xs text-slate-500">Live IT support tickets, SLA tracking, and resolution details.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenNew(true)}
                  className="flex h-9 items-center gap-2 rounded-lg bg-[#00a86b] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#00965f] transition"
                >
                  <Plus size={16} />
                  <span>Raise Ticket</span>
                </button>
              </div>
              <div className="p-8 text-center text-xs text-slate-400">
                All submitted support tickets will appear here with real-time engineer tracking.
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* NOTIFICATIONS VIEW                                      */}
          {/* ======================================================== */}
          {activeNav === "Notifications" && (
            <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">System Notifications</h2>
                  <p className="text-xs text-slate-500">Updates regarding your requirements, quotations, and account.</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { title: "Quotation ready for review", time: "10 mins ago", unread: true },
                  { title: "Specialist assigned to REQ-2026-00003", time: "1 hour ago", unread: true },
                  { title: "Security patch updated successfully", time: "Yesterday", unread: false },
                ].map((n, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3.5 rounded-xl border ${
                      n.unread ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-[#00a86b]">
                        <Bell size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{n.title}</div>
                        <div className="text-[10px] text-slate-400">{n.time}</div>
                      </div>
                    </div>
                    {n.unread && <span className="h-2 w-2 rounded-full bg-[#00a86b]" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* HELP CENTER VIEW                                        */}
          {/* ======================================================== */}
          {activeNav === "Help" && (
            <div className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Customer Support & Help Center</h2>
              <p className="text-xs text-slate-500">
                Need urgent technical assistance? Our 24/7 NOC and customer success team is available.
              </p>
              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <b className="text-xs font-bold text-slate-900">Phone Support</b>
                  <p className="mt-1 text-xs text-slate-600">+971 4 000 0000</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <b className="text-xs font-bold text-slate-900">Email Desk</b>
                  <p className="mt-1 text-xs text-slate-600">support@wefyx.pro</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <b className="text-xs font-bold text-slate-900">Response SLA</b>
                  <p className="mt-1 text-xs text-slate-600">&lt; 15 Minutes Response</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* 6. NEW REQUIREMENT MODAL (Corporate Admin Style)          */}
      {/* ======================================================== */}
      {openNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xs">
          <form
            onSubmit={create}
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Submit New Requirement</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Describe what your business requires and request quotations from verified vendors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenNew(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Requirement Title *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-[#00a86b]"
                  placeholder="e.g. Laptop repair, Enterprise NOC setup, Firewall replacement"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-3 text-xs outline-none focus:border-[#00a86b]"
                  placeholder="Share details, device specifications, quantities, or symptoms..."
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Service Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none"
                  >
                    <option>General service</option>
                    <option>IT support</option>
                    <option>Hardware / equipment</option>
                    <option>Software / licensing</option>
                    <option>Professional service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              {formError && (
                <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{formError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setOpenNew(false)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#00a86b] px-5 text-xs font-bold text-white shadow-sm hover:bg-[#00965f] disabled:opacity-60 transition"
              >
                {busy ? "Submitting…" : "Submit Requirement"}
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. REQUIREMENT DETAIL & MULTI-PARTY LIVE CONVERSATION     */}
      {/* ======================================================== */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  {selected.reference}
                </span>
                <h2 className="mt-1.5 text-lg font-bold text-slate-900">{selected.title}</h2>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{selected.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-2">
              <span className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase ${statusStyle[selected.status]}`}>
                {readable(selected.status)}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {readable(selected.priority)} priority
              </span>
            </div>

            {/* Vendor Quotations */}
            <section className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
              <h3 className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Sparkles size={15} className="text-purple-600" />
                <span>Vendor Quotations & Offers</span>
              </h3>
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3.5 border border-slate-200 shadow-xs"
                >
                  <div>
                    <b className="text-xs font-bold text-slate-900">{quote.vendorName || "Vendor Partner"}</b>
                    <p className="text-xs text-slate-500">
                      AED {Number(quote.amount || 0).toLocaleString()} · {quote.leadTimeDays || "—"} days delivery
                    </p>
                  </div>
                  {quote.status === "STAFF_APPROVED" ? (
                    <button
                      disabled={busy}
                      onClick={() => chooseQuote(quote)}
                      className="rounded-lg bg-[#00a86b] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#00965f] transition"
                    >
                      Confirm Order
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">{readable(quote.status)}</span>
                  )}
                </div>
              ))}
              {!quotes.length && (
                <p className="mt-2 text-xs text-slate-400">
                  Specialists are reviewing vendor offers. Comparable quotations will appear here.
                </p>
              )}
            </section>

            {/* ======================================================== */}
            {/* LIVE CONVERSATION (Admin + Employee + Vendor + Customer) */}
            {/* ======================================================== */}
            <section className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <MessageCircle size={16} className="text-[#00a86b]" />
                  <span>Live Multi-Party Conversation</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  {messages.length} message{messages.length === 1 ? "" : "s"} · Auto-updating
                </span>
              </div>

              <div className="mt-3 max-h-56 space-y-3 overflow-y-auto pr-1">
                {messages.map((m) => {
                  const isMe =
                    m.senderRole === "CUSTOMER" ||
                    (user?.email && m.senderEmail?.toLowerCase() === user.email.toLowerCase());
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-xs font-bold text-slate-900">{m.senderName}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                            roleStyles[m.senderRole] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {niceRole(m.senderRole)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Just now"}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs max-w-md shadow-xs leading-relaxed ${
                          isMe
                            ? "bg-[#00a86b] text-white rounded-tr-none font-medium"
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}

                {!messages.length && (
                  <div className="p-5 text-center text-xs text-slate-400">
                    No messages yet. Send a message to communicate with Wefyx support engineers, admins, and vendors.
                  </div>
                )}
              </div>

              <form onSubmit={sendMessage} className="mt-3 flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message to support & vendors..."
                  className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-[#00a86b]"
                />
                <button
                  type="submit"
                  disabled={busy || !message.trim()}
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#00a86b] px-4 text-xs font-bold text-white hover:bg-[#00965f] disabled:opacity-50 transition"
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </form>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
