import { useState } from "react";
import {
  ORGANIZATIONS,
  selectedOrganization,
} from "./organizationContext";

const DEFAULT_ROLES = [
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

export default function UserModal({ user, availableRoles = DEFAULT_ROLES, onClose, onSave }) {
  const [form, setForm] = useState(() =>
    user || {
      name: "",
      email: "",
      role: "Customer", // Default role is Customer as per standard application flow
      organization: selectedOrganization() || "ACME Trading LLC",
      location: "Dubai, UAE",
      status: "ACTIVE",
      password: "",
    },
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm({ ...form, [k]: v });

  const roleList = availableRoles && availableRoles.length > 0 ? availableRoles : DEFAULT_ROLES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close user form"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
      />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true); setError("");
          try { await onSave(form); } catch (err) { setError(err.message || "Unable to save user."); } finally { setBusy(false); }
        }}
        className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {user ? "Edit User & Role" : "Add New User"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Configure account credentials, organization, assigned role, and status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-600 transition"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["Full name", "name", "e.g. John Smith"],
            ["Email address", "email", "e.g. user@company.com"],
            ["Mobile number", "phone", "+91 or +971 mobile number"],
            ["Location", "location", "Dubai, UAE"],
          ].map(([l, k, p]) => (
            <label key={k} className="text-xs font-semibold text-slate-700">
              {l}
              <input
                required={k !== "phone" || !user || Boolean(user.phone)}
                type={k === "email" ? "email" : k === "phone" ? "tel" : "text"}
                value={form[k] || ""}
                onChange={(e) => set(k, e.target.value)}
                placeholder={p}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
              />
            </label>
          ))}

          <label className="text-xs font-semibold text-slate-700">
            {user ? "New password (optional)" : "Login password"}
            <input
              required={!user}
              minLength={8}
              type="password"
              value={form.password || ""}
              onChange={(e) => set("password", e.target.value)}
              placeholder={user ? "Leave blank to keep current password" : "Minimum 8 characters"}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition"
            />
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Organization
            <select
              required
              value={form.organization}
              onChange={(e) => set("organization", e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-brand transition"
            >
              <option value="" disabled>Select organization</option>
              {ORGANIZATIONS.map((organization) => (
                <option key={organization} value={organization}>{organization}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Assigned Role
            <select
              value={form.role || "Customer"}
              onChange={(e) => set("role", e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-semibold text-slate-800 outline-none focus:border-brand transition bg-slate-50"
            >
              <optgroup label="Standard Roles">
                {roleList.map((r) => (
                  <option key={r} value={r}>
                    {r === "Customer" ? "👤 Customer (Default)" : r}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-700">
            Status
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 font-normal outline-none focus:border-brand transition"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </label>
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="h-10 rounded-lg bg-brand px-5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition"
          >
            {user ? "Save Changes" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}

