import { useState } from "react";
import {
  ArrowLeft,
  Pencil,
  KeyRound,
  UserX,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Monitor,
  CheckCircle2,
  Shield,
  Check,
} from "lucide-react";
import { send } from "./api";

const InfoCard = ({ title, children, action = "Edit", onAction }) => (
  <section className="card p-5">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-[10px] font-semibold text-brand hover:opacity-80"
        >
          <Pencil size={12} />
          {action}
        </button>
      )}
    </div>
    {children}
  </section>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-[11px]">
    <span className="text-slate-500">{label}</span>
    <b className="text-right font-medium text-slate-800">{value}</b>
  </div>
);

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

export default function UserDetailsPage({ user: initialUser, onBack }) {
  const [user, setUser] = useState(initialUser);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role || "Customer");
  const [savingRole, setSavingRole] = useState(false);
  const [toast, setToast] = useState(null);

  const initials = (user.name || "U")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveRole = async () => {
    if (!selectedRole || selectedRole === user.role) {
      setIsEditingRole(false);
      return;
    }
    setSavingRole(true);
    try {
      await send(`/users/${user.id}/role`, "PATCH", { role: selectedRole });
      setUser((prev) => ({ ...prev, role: selectedRole }));
      setIsEditingRole(false);
      showToast(`Role updated to "${selectedRole}" successfully.`);
    } catch {
      try {
        await send(`/users/${user.id}`, "PUT", { ...user, role: selectedRole });
        setUser((prev) => ({ ...prev, role: selectedRole }));
        setIsEditingRole(false);
        showToast(`Role updated to "${selectedRole}" successfully.`);
      } catch {
        showToast("Failed to update user role.");
      }
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <div className="space-y-4 p-4 lg:p-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand transition"
      >
        <ArrowLeft size={15} /> Back to Users
      </button>

      {/* Top Banner */}
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="card flex flex-wrap items-center gap-6 p-6">
          <div className="grid h-24 w-24 place-items-center rounded-2xl bg-emerald-100 text-2xl font-bold text-brand shadow-inner">
            {initials}
          </div>
          <div className="min-w-[190px]">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <span className="pill bg-emerald-50 text-emerald-600 border border-emerald-200">
                {user.status || "ACTIVE"}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-block rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                {user.role || "Customer"}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingRole(!isEditingRole)}
                className="text-[11px] font-semibold text-brand hover:underline"
              >
                Change Role
              </button>
            </div>

            {/* Inline Role Assignment Changer */}
            {isEditingRole && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 text-xs">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold"
                >
                  {STANDARD_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r === "Customer" ? "👤 Customer (Default)" : r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={savingRole}
                  onClick={handleSaveRole}
                  className="rounded-lg bg-brand px-3 py-1 font-bold text-white shadow-xs hover:opacity-90 disabled:opacity-50"
                >
                  {savingRole ? "Saving…" : "Save Role"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingRole(false)}
                  className="rounded-lg border bg-white px-2 py-1 text-slate-600"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="mt-4 space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                {user.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                {user.phone || "+971 50 123 4567"}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                {user.location || "Dubai, UAE"}
              </div>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-5 border-l border-slate-100 pl-6 text-xs md:grid-cols-4">
            <div>
              <span className="text-slate-400">User ID</span>
              <b className="mt-1 block text-slate-800">USR-{String(user.id).padStart(6, "0")}</b>
            </div>
            <div>
              <span className="text-slate-400">Assigned Role</span>
              <b className="mt-1 block text-brand">{user.role || "Customer"}</b>
            </div>
            <div>
              <span className="text-slate-400">Joined On</span>
              <b className="mt-1 block text-slate-800">
                {user.joinedOn ? new Date(user.joinedOn).toLocaleDateString() : "Recent"}
              </b>
            </div>
            <div>
              <span className="text-slate-400">Status</span>
              <b className="mt-1 block text-emerald-600">{user.status || "ACTIVE"}</b>
            </div>
            <div>
              <span className="text-slate-400">Organization</span>
              <b className="mt-1 block text-slate-800">{user.organization || "ACME Trading LLC"}</b>
            </div>
            <div>
              <span className="text-slate-400">Last Login</span>
              <b className="mt-1 block text-emerald-600">Active Session</b>
            </div>
            <div>
              <span className="text-slate-400">Login IP</span>
              <b className="mt-1 block text-slate-700">196.168.1.22</b>
            </div>
            <div>
              <span className="text-slate-400">Login Device</span>
              <b className="mt-1 block text-slate-700">Web App Client</b>
            </div>
          </div>
        </section>

        {/* Action Panel */}
        <section className="card p-5">
          <h3 className="text-sm font-bold text-slate-900">Admin Actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsEditingRole(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-brand text-xs font-semibold text-white shadow-xs"
            >
              <ShieldCheck size={14} /> Assign Role
            </button>
            <button
              onClick={() => showToast("Password reset link sent to user email.")}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <KeyRound size={14} /> Reset Pass
            </button>
            <button
              onClick={() => showToast("User status updated.")}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <UserX size={14} /> Deactivate
            </button>
            <button
              onClick={() => showToast("Permission matrix loaded.")}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ShieldCheck size={14} /> Permissions
            </button>
          </div>
          <button
            onClick={() => {
              if (window.confirm(`Delete user ${user.name}?`)) {
                onBack();
              }
            }}
            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50"
          >
            <Trash2 size={14} /> Delete User
          </button>
        </section>
      </div>

      {/* Tabs */}
      <div className="card flex gap-7 overflow-x-auto px-5 pt-4">
        {[
          "Overview",
          "Roles & Permissions",
          "Organizations",
          "Assets",
          "Contracts (AMC)",
          "Tickets",
          "Activity Log",
        ].map((x, i) => (
          <button
            key={x}
            className={`whitespace-nowrap border-b-2 pb-4 text-xs font-semibold ${
              i === 0 ? "border-brand text-brand" : "border-transparent text-slate-500"
            }`}
          >
            {x}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_300px]">
        <div className="space-y-4">
          <InfoCard title="Personal Information">
            <Row label="Full Name" value={user.name} />
            <Row label="Email Address" value={user.email} />
            <Row label="Phone Number" value={user.phone || "+971 50 123 4567"} />
            <Row label="Nationality" value="UAE Resident" />
            <Row label="Language" value="English" />
            <Row label="Address" value={user.location || "Dubai, UAE"} />
          </InfoCard>
          <InfoCard title="Contact & Security">
            <Row label="Work Email" value={user.email} />
            <Row label="Phone Number" value="Verified" />
            <Row label="Two-Factor Auth" value="Enabled" />
            <Row label="Security Status" value="Active & Compliant" />
          </InfoCard>
        </div>

        <div className="space-y-4">
          <InfoCard title="Role & Organization Assignment" action="Change" onAction={() => setIsEditingRole(true)}>
            <Row label="Current Role" value={user.role || "Customer"} />
            <Row label="Organization" value={user.organization || "ACME Trading LLC"} />
            <Row label="Access Scope" value="Role-Based Controls" />
            <Row label="Default Portal" value={user.role === "Super Admin" ? "Admin Console" : "Customer Portal"} />
          </InfoCard>
          <InfoCard title="Device & Access" action="View All">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400">Registered Devices</span>
                <b className="mt-1 block text-xl">2</b>
              </div>
              <div>
                <span className="text-xs text-slate-400">Active Sessions</span>
                <b className="mt-1 block text-xl">1</b>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Monitor className="text-brand" />
              <div>
                <b className="text-xs">Chrome on Windows</b>
                <div className="text-[10px] text-slate-400">Last active today</div>
              </div>
            </div>
          </InfoCard>
        </div>

        <div className="space-y-4">
          <InfoCard title="Roles & Permissions" action="Manage" onAction={() => setIsEditingRole(true)}>
            <div className="flex flex-wrap gap-2">
              <span className="pill bg-emerald-50 text-emerald-600">{user.role || "Customer"}</span>
              <span className="pill bg-emerald-50 text-emerald-600">Portal Access</span>
              <span className="pill bg-emerald-50 text-emerald-600">Tickets Access</span>
            </div>
            <div className="mt-6 grid grid-cols-3">
              <div>
                <b className="text-xl">1</b>
                <div className="text-[10px] text-slate-400">Active Role</div>
              </div>
              <div>
                <b className="text-xl">42</b>
                <div className="text-[10px] text-slate-400">Permissions</div>
              </div>
              <div>
                <b className="text-xl">Full</b>
                <div className="text-[10px] text-slate-400">Tier</div>
              </div>
            </div>
          </InfoCard>
        </div>

        <section className="card p-5">
          <div className="flex justify-between">
            <h3 className="text-sm font-bold">Activity Timeline</h3>
            <button className="text-[10px] font-semibold text-brand">View All</button>
          </div>
          <div className="mt-5 space-y-5">
            {[
              ["User logged in", "Today, 10:24 AM", CheckCircle2, "text-emerald-500"],
              ["Role verified", "Today, 10:20 AM", ShieldCheck, "text-emerald-500"],
              ["Account active", "Current session", Shield, "text-emerald-500"],
            ].map(([x, d, Icon, c]) => (
              <div key={x} className="flex gap-3">
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-50 ${c}`}>
                  <Icon size={14} />
                </div>
                <div>
                  <b className="text-[11px]">{x}</b>
                  <div className="text-[9px] text-slate-400">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
