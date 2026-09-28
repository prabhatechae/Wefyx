import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
  CheckCircle2,
  Clock3,
  Shield,
  ShieldCheck,
  Building2,
  Headphones,
  UserCheck,
  Filter,
  Check,
} from "lucide-react";
import { get, send } from "./api";
import UserModal from "./UserModal";
import UserDetailsPage from "./UserDetailsPage";

const badge = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  SUSPENDED: "bg-red-50 text-red-700 border-red-200",
};

const STANDARD_ROLES = [
  "Customer",
  "Customer Admin",
  "L1 Technician",
  "L2 Engineer",
  "L3 Engineer",
  "NOC Engineer",
  "Support Agent",
  "Operations Manager",
  "Service Delivery Manager",
  "Vendor Manager",
  "Finance Manager",
  "Super Admin",
  "System Administrator",
];

function getRoleBadgeStyle(role) {
  const r = (role || "").toUpperCase();
  if (r.includes("CUSTOMER") || r.includes("CLIENT"))
    return "bg-blue-50 text-blue-700 border border-blue-200";
  if (r.includes("SUPER") || r.includes("ADMIN"))
    return "bg-purple-50 text-purple-700 border border-purple-200";
  if (r.includes("VENDOR") || r.includes("PARTNER"))
    return "bg-amber-50 text-amber-800 border border-amber-200";
  if (r.includes("TECH") || r.includes("ENGINEER") || r.includes("NOC") || r.includes("AGENT"))
    return "bg-indigo-50 text-indigo-700 border border-indigo-200";
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

export default function DynamicUsersPage() {
  const [users, setUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState(STANDARD_ROLES);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [roleCategory, setRoleCategory] = useState("ALL"); // 'ALL' | 'CUSTOMER' | 'EMPLOYEE' | 'VENDOR' | 'ADMIN'
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [editing, setEditing] = useState(undefined);
  const [selected, setSelected] = useState(null);
  const [assigningRoleId, setAssigningRoleId] = useState(null);
  const [toast, setToast] = useState(null);

  const org = localStorage.getItem("wefyx-organization") || "ALL";

  // Load Users and Dynamic Roles from backend
  const loadData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        get("/users"),
        get("/roles").catch(() => []),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      if (Array.isArray(rolesData) && rolesData.length > 0) {
        const customRoleNames = rolesData.map((r) => r.name);
        const combined = Array.from(new Set([...STANDARD_ROLES, ...customRoleNames]));
        setAvailableRoles(combined);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  // Quick Role Assignment directly from Admin Table Row
  async function handleAssignRole(user, newRole) {
    if (!newRole || newRole === user.role) return;
    setAssigningRoleId(user.id);
    const prevRole = user.role;
    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
    );
    try {
      await send(`/users/${user.id}/role`, "PATCH", { role: newRole });
      showToast(`Assigned role "${newRole}" to ${user.name}`);
    } catch {
      try {
        // Fallback to full PUT update
        await send(`/users/${user.id}`, "PUT", { ...user, role: newRole });
        showToast(`Assigned role "${newRole}" to ${user.name}`);
      } catch {
        // Rollback
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: prevRole } : u))
        );
        showToast(`Failed to update role for ${user.name}`);
      }
    } finally {
      setAssigningRoleId(null);
    }
  }

  // Filtered users by Search, Status, and Role Category
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesStatus = status === "ALL" || u.status === status;
      const r = (u.role || "").toUpperCase();
      let matchesRoleCat = true;
      if (roleCategory === "CUSTOMER") {
        matchesRoleCat = r.includes("CUSTOMER") || r.includes("CLIENT");
      } else if (roleCategory === "EMPLOYEE") {
        matchesRoleCat =
          r.includes("TECH") ||
          r.includes("ENGINEER") ||
          r.includes("NOC") ||
          r.includes("AGENT") ||
          r.includes("OPERATIONS") ||
          r.includes("SERVICE DELIVERY");
      } else if (roleCategory === "VENDOR") {
        matchesRoleCat = r.includes("VENDOR") || r.includes("PARTNER");
      } else if (roleCategory === "ADMIN") {
        matchesRoleCat = r.includes("SUPER") || r.includes("ADMIN") || r.includes("SYS_ADMIN");
      }

      const matchesQuery = `${u.name} ${u.email} ${u.role} ${u.organization} ${u.location}`
        .toLowerCase()
        .includes(q.toLowerCase());

      return matchesStatus && matchesRoleCat && matchesQuery;
    });
  }, [users, status, roleCategory, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / size));
  useEffect(() => setPage(1), [q, status, roleCategory, size]);
  const visible = filtered.slice((page - 1) * size, page * size);

  // Stats Counters
  const countRoleCat = (cat) => {
    return users.filter((u) => {
      const r = (u.role || "").toUpperCase();
      if (cat === "CUSTOMER") return r.includes("CUSTOMER") || r.includes("CLIENT");
      if (cat === "EMPLOYEE")
        return (
          r.includes("TECH") ||
          r.includes("ENGINEER") ||
          r.includes("NOC") ||
          r.includes("AGENT") ||
          r.includes("OPERATIONS") ||
          r.includes("SERVICE DELIVERY")
        );
      if (cat === "VENDOR") return r.includes("VENDOR") || r.includes("PARTNER");
      if (cat === "ADMIN") return r.includes("SUPER") || r.includes("ADMIN");
      return true;
    }).length;
  };

  async function save(form) {
    if (editing?.id) {
      const next = { ...editing, ...form };
      setUsers((v) => v.map((x) => (x.id === editing.id ? next : x)));
      setEditing(undefined);
      try {
        const saved = await send(`/users/${editing.id}`, "PUT", next);
        setUsers((v) => v.map((x) => (x.id === saved.id ? saved : x)));
        showToast(`User ${saved.name} updated successfully.`);
      } catch {
        showToast("Failed to update user.");
      }
    } else {
      const temp = { ...form, id: Date.now(), joinedOn: new Date().toISOString() };
      setUsers((v) => [temp, ...v]);
      setEditing(undefined);
      try {
        const saved = await send("/users", "POST", form);
        setUsers((v) => v.map((x) => (x.id === temp.id ? saved : x)));
        showToast(`New user ${saved.name} created with role "${saved.role}".`);
      } catch {
        showToast("Failed to create user.");
      }
    }
  }

  async function remove(u) {
    if (!window.confirm(`Delete user ${u.name}?`)) return;
    setUsers((v) => v.filter((x) => x.id !== u.id));
    try {
      await send(`/users/${u.id}`, "DELETE");
      showToast(`User ${u.name} deleted.`);
    } catch {
      showToast(`Failed to delete ${u.name}.`);
    }
  }

  if (selected) return <UserDetailsPage user={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="space-y-5 p-4 lg:p-6">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Role & Org Context Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-white px-5 py-3.5 text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 font-bold text-white">
            <Shield size={14} />
          </span>
          <div>
            <b className="font-bold text-slate-800">Role-Based Access Management</b>
            <p className="text-[11px] text-slate-500">
              Assign and modify roles for Customers, Engineers, Vendors, and Admins. By default, registrations start as <strong>Customer</strong>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm border border-slate-200">
            {users.length} Total Users
          </span>
        </div>
      </div>

      {/* Metric Cards per Role Category */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "All Users", count: users.length, icon: Users, cat: "ALL", tone: "bg-slate-100 text-slate-700" },
          { label: "Customers (Default)", count: countRoleCat("CUSTOMER"), icon: UserCheck, cat: "CUSTOMER", tone: "bg-blue-100 text-blue-700" },
          { label: "Engineers & Staff", count: countRoleCat("EMPLOYEE"), icon: Headphones, cat: "EMPLOYEE", tone: "bg-indigo-100 text-indigo-700" },
          { label: "Vendors & Partners", count: countRoleCat("VENDOR"), icon: Building2, cat: "VENDOR", tone: "bg-amber-100 text-amber-800" },
          { label: "Administrators", count: countRoleCat("ADMIN"), icon: ShieldCheck, cat: "ADMIN", tone: "bg-purple-100 text-purple-700" },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = roleCategory === item.cat;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setRoleCategory(item.cat)}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div>
                <span className="text-[11px] font-semibold text-slate-500">{item.label}</span>
                <b className="mt-1 block text-2xl font-black text-slate-900">{item.count}</b>
              </div>
              <div className={`grid h-10 w-10 place-items-center rounded-xl font-bold ${item.tone}`}>
                <Icon size={20} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Table Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["ALL", "ACTIVE", "PENDING", "INACTIVE", "SUSPENDED"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  status === s
                    ? "bg-[#0b579f] text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search & Add User */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10">
              <Search size={15} className="text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-48 bg-transparent text-xs outline-none sm:w-60"
                placeholder="Search user, email, role, org..."
              />
            </div>

            <button
              type="button"
              onClick={() => setEditing(null)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#00a86b] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#008c59]"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">User Details</th>
                <th className="px-4 py-3.5">Current Role</th>
                <th className="px-4 py-3.5">Quick Assign Role (Admin)</th>
                <th className="px-4 py-3.5">Organization</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((u) => {
                const initials = (u.name || "U")
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const isAssigning = assigningRoleId === u.id;

                return (
                  <tr key={u.id} className="transition hover:bg-slate-50/80">
                    {/* User Profile */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-100 font-bold text-blue-800 shadow-sm">
                          {initials}
                        </div>
                        <div>
                          <b className="block text-[13px] font-bold text-slate-900">{u.name}</b>
                          <span className="text-[11px] text-slate-500">{u.email}</span>
                          {u.phone && (
                            <span className="block text-[10px] text-slate-400">{u.phone}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Current Role Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-xs ${getRoleBadgeStyle(
                          u.role
                        )}`}
                      >
                        {u.role || "Customer"}
                      </span>
                    </td>

                    {/* Quick Role Assignment Dropdown */}
                    <td className="px-4 py-3.5">
                      <div className="relative inline-block w-48">
                        <select
                          disabled={isAssigning}
                          value={u.role || "Customer"}
                          onChange={(e) => handleAssignRole(u, e.target.value)}
                          className="h-8.5 w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 disabled:opacity-50"
                        >
                          <optgroup label="Standard Roles">
                            <option value="Customer">👤 Customer (Default)</option>
                            <option value="Customer Admin">👤 Customer Admin</option>
                            <option value="L1 Technician">🛠️ L1 Technician</option>
                            <option value="L2 Engineer">⚡ L2 Engineer</option>
                            <option value="L3 Engineer">🚀 L3 Engineer</option>
                            <option value="NOC Engineer">📡 NOC Engineer</option>
                            <option value="Support Agent">🎧 Support Agent</option>
                            <option value="Operations Manager">📊 Operations Manager</option>
                            <option value="Service Delivery Manager">🏆 Service Delivery Manager</option>
                            <option value="Vendor Manager">🏢 Vendor Manager</option>
                            <option value="Finance Manager">💳 Finance Manager</option>
                            <option value="Super Admin">👑 Super Admin</option>
                            <option value="System Administrator">🛡️ System Administrator</option>
                          </optgroup>
                          {availableRoles
                            .filter((r) => !STANDARD_ROLES.includes(r))
                            .map((customRole) => (
                              <option key={customRole} value={customRole}>
                                ✨ {customRole}
                              </option>
                            ))}
                        </select>
                      </div>
                    </td>

                    {/* Organization */}
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-700">{u.organization || "—"}</span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                          badge[u.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {u.status || "ACTIVE"}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3.5 text-slate-500">{u.location || "Dubai, UAE"}</td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelected(u)}
                          title="View user details"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(u)}
                          title="Edit user & role"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(u)}
                          title="Delete user"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {loading && (
            <div className="p-12 text-center text-sm font-semibold text-slate-400">
              Loading users and roles...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center text-sm text-slate-500">
              No users found matching your search and role filters.
            </div>
          )}
        </div>

        {/* Pagination & Per Page */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 text-xs text-slate-500">
          <span>
            Showing {filtered.length ? (page - 1) * size + 1 : 0}–
            {Math.min(page * size, filtered.length)} of {filtered.length} users
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 font-bold transition hover:bg-slate-50 disabled:opacity-30"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const p =
                pages <= 5 ? i + 1 : Math.min(Math.max(1, page - 2) + i, pages);
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`grid h-8 w-8 place-items-center rounded-lg border text-xs font-bold transition ${
                    page === p
                      ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 font-bold transition hover:bg-slate-50 disabled:opacity-30"
            >
              ›
            </button>
          </div>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium outline-none"
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>
      </div>

      {/* User Modal for Add / Edit */}
      {editing !== undefined && (
        <UserModal
          user={editing?.id ? editing : null}
          availableRoles={availableRoles}
          onClose={() => setEditing(undefined)}
          onSave={save}
        />
      )}
    </div>
  );
}
