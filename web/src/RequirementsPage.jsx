import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, MessageCircle, Paperclip, RefreshCw, Search, Send, User, X, Sparkles } from "lucide-react";
import { downloadFile, get, send } from "./api";

const badge = {
  SUBMITTED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border border-amber-200",
  SENT_TO_VENDOR: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  VENDOR_ACCEPTED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  IN_PROGRESS: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-600 border border-slate-200",
  DECLINED: "bg-red-50 text-red-700 border border-red-200",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
};

const roleStyles = {
  SUPER_ADMIN: "bg-amber-100 text-amber-800 border border-amber-300",
  EMPLOYEE: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  CUSTOMER: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  VENDOR: "bg-purple-100 text-purple-800 border border-purple-300",
};

const niceRole = (role = "") => {
  const r = role.toUpperCase();
  if (r.includes("SUPER") || r.includes("ADMIN")) return "Super Admin";
  if (r.includes("EMPLOYEE")) return "Support Specialist";
  if (r.includes("VENDOR")) return "Vendor Partner";
  if (r.includes("CUSTOMER")) return "Customer";
  return role;
};

const niceStatus = (status = "") =>
  status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function RequirementsPage({ user }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState();
  const [vendors, setVendors] = useState([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [quotes, setQuotes] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [notes, setNotes] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [quote, setQuote] = useState({ amount: "", leadTimeDays: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => get("/requirements").then((x) => setRows(Array.isArray(x) ? x : []));

  useEffect(() => {
    load();
  }, []);

  // Real-time polling when a requirement modal is open
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(() => {
      get(`/requirements/${selected.id}/messages`)
        .then((chat) => setMessages(chat || []))
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [selected?.id]);

  const shown = useMemo(
    () =>
      rows.filter((r) =>
        `${r.reference} ${r.title} ${r.organization} ${r.vendorName || ""}`
          .toLowerCase()
          .includes(q.toLowerCase())
      ),
    [rows, q]
  );

  const eligibleVendors = useMemo(
    () =>
      vendors.filter((v) =>
        `${v.name || ""} ${v.organization || ""} ${v.location || ""}`
          .toLowerCase()
          .includes(vendorSearch.toLowerCase())
      ),
    [vendors, vendorSearch]
  );

  const quoteValue = rows.reduce((n, r) => n + Number(r.agreedAmount || 0), 0);

  async function open(item) {
    setSelected(item);
    setNotes(item.employeeNotes || "");
    setError("");
    setSelectedVendorIds([]);
    setQuote({ amount: "", leadTimeDays: "", notes: "" });
    setVendorSearch("");
    const [offers, chat, directory, docs] = await Promise.all([
      get(`/requirements/${item.id}/quotations`).catch(() => []),
      get(`/requirements/${item.id}/messages`).catch(() => []),
      get("/users?role=VENDOR&status=ACTIVE").catch(() => []),
      get(`/requirements/${item.id}/attachments`).catch(() => []),
    ]);
    setQuotes(offers || []);
    setMessages(chat || []);
    setVendors(directory || []);
    setAttachments(docs || []);
  }

  async function refreshDetail() {
    if (!selected) return;
    const [current, offers, chat, docs] = await Promise.all([
      get(`/requirements/${selected.id}`),
      get(`/requirements/${selected.id}/quotations`).catch(() => []),
      get(`/requirements/${selected.id}/messages`).catch(() => []),
      get(`/requirements/${selected.id}/attachments`).catch(() => []),
    ]);
    setSelected(current);
    setQuotes(offers || []);
    setMessages(chat || []);
    setAttachments(docs || []);
  }

  async function act(action) {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      if (action === "accept")
        await send(`/requirements/${selected.id}/accept`, "PATCH", {
          employeeName: user?.name || "Wefyx Support Team",
          notes,
        });
      if (action === "review")
        await send(`/requirements/${selected.id}/review`, "PATCH", {
          employeeName: user?.name || "Wefyx Support Team",
          notes,
        });
      if (action === "decline")
        await send(`/requirements/${selected.id}/decline`, "PATCH", {
          employeeName: user?.name || "Wefyx Support Team",
          notes,
        });
      if (action === "invite")
        await send(`/requirements/${selected.id}/quotations/invite`, "POST", {
          vendorIds: selectedVendorIds,
        });
      if (action === "share")
        await send(`/requirements/${selected.id}/quotations/share`, "PATCH", {});
      await load();
      await refreshDetail();
      if (action === "invite") setSelectedVendorIds([]);
    } catch (e) {
      setError(e.message || "Unable to update requirement");
    } finally {
      setBusy(false);
    }
  }

  async function sendDirectQuote() {
    if (!selected || !quote.amount || !quote.leadTimeDays || !quote.notes.trim()) return;
    setBusy(true);
    setError("");
    try {
      await send(`/requirements/${selected.id}/quotations/employee`, "POST", {
        ...quote,
        employeeName: user?.name || "Wefyx Support Team",
      });
      setQuote({ amount: "", leadTimeDays: "", notes: "" });
      await load();
      await refreshDetail();
    } catch (e) {
      setError(e.message || "Unable to send quotation");
    } finally {
      setBusy(false);
    }
  }

  async function reviewQuote(item, action) {
    if (!selected) return;
    const reviewNotes = notes;
    if (action !== "APPROVE" && !reviewNotes.trim()) {
      setError("Review notes are required for this action");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await send(`/requirements/${selected.id}/quotations/${item.id}/review`, "PATCH", {
        action,
        notes: reviewNotes,
      });
      await load();
      await refreshDetail();
    } catch (e) {
      setError(e.message || "Unable to review quotation");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage(e) {
    e?.preventDefault();
    if (!message.trim() || !selected) return;
    setError("");
    try {
      const senderRole = user?.role || "SUPER_ADMIN";
      const senderName = user?.name || "System Administrator";
      const saved = await send(`/requirements/${selected.id}/messages`, "POST", {
        message: message.trim(),
        senderName,
        senderRole,
      });
      setMessages((prev) => [...prev, saved]);
      setMessage("");
    } catch (e) {
      setError(e.message || "Unable to send message");
    }
  }

  const scrollToConversation = () =>
    document.getElementById("live-conversation")?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="space-y-4 p-4 lg:p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Requirements", rows.length],
          ["Awaiting review", rows.filter((r) => r.status === "SUBMITTED").length],
          ["Active", rows.filter((r) => !["SUBMITTED", "DECLINED", "REJECTED", "CLOSED"].includes(r.status)).length],
          ["Awarded value", `AED ${quoteValue.toLocaleString()}`],
        ].map(([label, value]) => (
          <div className="card p-4" key={label}>
            <span className="text-xs text-slate-500">{label}</span>
            <b className="mt-1 block text-xl font-bold">{value}</b>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div>
            <h2 className="font-bold text-slate-900">Requirements & quotations</h2>
            <p className="text-xs text-slate-500">Review requests, prepare quotations and invite vendors.</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border px-3 bg-slate-50">
            <Search size={15} className="text-slate-400" />
            <input
              className="h-9 w-56 bg-transparent text-xs outline-none"
              placeholder="Search requirements"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button onClick={load} aria-label="Refresh requirements">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-xs">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Requirement</th>
                <th>Customer</th>
                <th>Category</th>
                <th>Status</th>
                <th>Quotation stage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr className="border-t hover:bg-slate-50/70 transition" key={r.id}>
                  <td className="px-4 py-3">
                    <b className="text-slate-900">{r.title}</b>
                    <div className="text-[10px] text-brand font-semibold">{r.reference}</div>
                  </td>
                  <td>{r.organization || r.customerName}</td>
                  <td>{r.category || "—"}</td>
                  <td>
                    <span className={`pill ${badge[r.status] || "bg-slate-50"}`}>
                      {niceStatus(r.status)}
                    </span>
                  </td>
                  <td>{r.quotationRequested ? niceStatus(r.quotationStatus) : "Not requested"}</td>
                  <td>
                    <button
                      className="rounded-lg bg-[#00a86b] px-3 py-1.5 font-semibold text-white shadow-xs hover:bg-[#00965f] transition"
                      onClick={() => open(r)}
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Requirement Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(undefined);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="requirement-title"
            className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-7">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold tracking-wide text-brand">{selected.reference}</span>
                  <span className={`pill ${badge[selected.status] || "bg-slate-50"}`}>
                    {niceStatus(selected.status)}
                  </span>
                </div>
                <h3 id="requirement-title" className="mt-1 text-xl font-bold text-slate-900">
                  {selected.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Submitted by {selected.customerName || selected.organization || "Customer"}
                  {selected.createdAt ? ` · ${new Date(selected.createdAt).toLocaleDateString()}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={scrollToConversation}
                  className="hidden items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium sm:flex hover:bg-slate-50"
                >
                  <MessageCircle size={16} />
                  Live Chat ({messages.length})
                </button>
                <button
                  onClick={() => setSelected(undefined)}
                  aria-label="Close details"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={19} />
                </button>
              </div>
            </header>

            <main className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 space-y-5">
              {/* Requester Info */}
              <section className="grid gap-3 rounded-xl border bg-slate-50/70 p-4 sm:grid-cols-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Requester
                  </span>
                  <p className="mt-1 text-sm font-semibold">{selected.customerName || "—"}</p>
                  {selected.organization && <p className="text-xs text-slate-500">{selected.organization}</p>}
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </span>
                  <p className="mt-1 text-sm font-semibold">{selected.category || "Uncategorized"}</p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Estimated budget
                  </span>
                  <p className="mt-1 text-sm font-semibold">
                    {selected.estimatedAmount
                      ? `AED ${Number(selected.estimatedAmount).toLocaleString()}`
                      : "Not specified"}
                  </p>
                </div>
              </section>

              {/* Request Details */}
              <section>
                <h4 className="text-sm font-bold text-slate-900">Request details</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selected.description || "No additional description provided."}
                </p>
              </section>

              {error && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {/* Decision Section */}
              <section className="rounded-xl border p-4 sm:p-5">
                <h4 className="text-sm font-bold text-slate-900">Review & Workflow Status</h4>
                <textarea
                  className="mt-3 min-h-20 w-full rounded-lg border p-3 text-sm outline-none focus:border-[#00a86b]"
                  placeholder="Internal notes or reason for return"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.status === "SUBMITTED" && (
                    <>
                      <button
                        disabled={busy}
                        className="rounded-lg bg-[#00a86b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00965f] disabled:opacity-50"
                        onClick={() => act("accept")}
                      >
                        <CheckCircle2 className="mr-2 inline" size={16} />
                        Accept request
                      </button>
                      <button
                        disabled={busy || !notes.trim()}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
                        onClick={() => act("decline")}
                      >
                        Return / decline
                      </button>
                    </>
                  )}
                  {selected.status === "ACCEPTED" && (
                    <button
                      disabled={busy}
                      className="rounded-lg bg-[#00a86b] px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => act("review")}
                    >
                      Start review
                    </button>
                  )}
                </div>
              </section>

              {/* Vendor RFQ Configuration */}
              {selected.quotationRequested && (
                <section className="rounded-xl border p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">RFQ Configuration · Vendor Invites</h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Choose registered vendors to request competitive quotations.
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {quotes.length} invited
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border px-3">
                      <Search size={15} className="text-slate-400" />
                      <input
                        className="h-10 min-w-0 flex-1 text-sm outline-none"
                        placeholder="Search registered vendors"
                        value={vendorSearch}
                        onChange={(e) => setVendorSearch(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedVendorIds(
                          selectedVendorIds.length === eligibleVendors.length
                            ? []
                            : eligibleVendors.map((v) => v.id)
                        )
                      }
                      disabled={!eligibleVendors.length}
                      className="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40"
                    >
                      Select all results
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {eligibleVendors.map((v) => {
                      const invited = quotes.some(
                        (item) => item.vendorId === v.id || item.vendorEmail === v.email
                      );
                      return (
                        <label
                          key={v.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                            selectedVendorIds.includes(v.id)
                              ? "border-[#00a86b] bg-emerald-50/40"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedVendorIds.includes(v.id)}
                            disabled={invited}
                            onChange={() =>
                              setSelectedVendorIds((ids) =>
                                ids.includes(v.id) ? ids.filter((id) => id !== v.id) : [...ids, v.id]
                              )
                            }
                            className="h-4 w-4 accent-[#00a86b]"
                          />
                          <span className="min-w-0 flex-1">
                            <b className="block truncate text-sm text-slate-900">
                              {v.name || v.organization || "Registered vendor"}
                            </b>
                            <span className="block truncate text-xs text-slate-500">
                              {v.organization || v.email || "Verified vendor"}
                            </span>
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              invited ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {invited ? "Invited" : "Registered"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => act("invite")}
                      disabled={!selectedVendorIds.length || busy}
                      className="rounded-lg bg-[#00a86b] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 shadow-sm"
                    >
                      <Send className="mr-2 inline" size={15} />
                      {busy ? "Sending invites…" : "Invite selected vendors"}
                    </button>
                  </div>

                  {/* Vendor Responses List */}
                  <div className="mt-5 border-t pt-4">
                    <h5 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Vendor Quotations & Responses ({quotes.length})
                    </h5>
                    <div className="mt-3 space-y-2">
                      {quotes.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200"
                        >
                          <div>
                            <b className="text-sm text-slate-900">{item.vendorName || "Vendor"}</b>
                            <p className="text-xs text-slate-500">
                              {item.amount
                                ? `AED ${Number(item.amount).toLocaleString()} · ${item.leadTimeDays} days delivery`
                                : "Awaiting quotation submission"}
                              {item.notes ? ` · Note: ${item.notes}` : ""}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {item.status === "SUBMITTED" && (
                              <>
                                <button
                                  disabled={busy}
                                  onClick={() => reviewQuote(item, "REQUEST_REVISION")}
                                  className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-100"
                                >
                                  Request revision
                                </button>
                                <button
                                  disabled={busy}
                                  onClick={() => reviewQuote(item, "REJECT")}
                                  className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                                >
                                  Decline
                                </button>
                                <button
                                  disabled={busy}
                                  onClick={() => reviewQuote(item, "APPROVE")}
                                  className="rounded-lg bg-[#00a86b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#00965f]"
                                >
                                  Approve
                                </button>
                              </>
                            )}
                            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 border border-slate-200">
                              {niceStatus(item.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ======================================================== */}
              {/* LIVE CONVERSATION (Admin + Customer + Employee + Vendor) */}
              {/* ======================================================== */}
              <section id="live-conversation" className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <MessageCircle size={18} className="text-[#00a86b]" />
                    <span>Live Multi-Party Conversation</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {messages.length} message{messages.length === 1 ? "" : "s"} · Real-time
                  </span>
                </div>

                <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1">
                  {messages.map((m) => {
                    const isMe = m.senderEmail?.toLowerCase() === user?.email?.toLowerCase();
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
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
                          className={`rounded-2xl px-4 py-2.5 text-xs max-w-lg shadow-xs leading-relaxed ${
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
                    <div className="p-6 text-center text-xs text-slate-400">
                      No messages yet. Send a message to communicate with the customer, employees, and vendors.
                    </div>
                  )}
                </div>

                <form onSubmit={sendMessage} className="mt-4 flex gap-2">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message to all stakeholders..."
                    className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 text-xs outline-none focus:border-[#00a86b]"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#00a86b] px-5 text-xs font-bold text-white shadow-sm hover:bg-[#00965f] disabled:opacity-40 transition"
                  >
                    <Send size={14} />
                    <span>Send</span>
                  </button>
                </form>
              </section>
            </main>

            <footer className="flex items-center justify-between border-t bg-white px-5 py-3.5 sm:px-7">
              <span className="text-xs text-slate-500">Live multi-party conversation enabled.</span>
              <button
                onClick={() => setSelected(undefined)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
