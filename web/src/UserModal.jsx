import { useState } from "react";
import {
  ORGANIZATIONS,
  selectedOrganization,
} from "./organizationContext";
export default function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(() =>
    user || {
      name: "",
      email: "",
      role: "Customer Admin",
      organization: selectedOrganization(),
      location: "Dubai, UAE",
      status: "ACTIVE",
      password: "",
    },
  );
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close user form"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
        className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {user ? "Edit user" : "Add new user"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Configure account, organization, role and status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-400"
          >
            ×
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[ 
            ["Full name", "name", "John Smith"],
            ["Email address", "email", "user@company.com"],
            ["Location", "location", "Dubai, UAE"],
          ].map(([l, k, p]) => (
            <label key={k} className="text-xs font-semibold">
              {l}
              <input
                required
                type={k === "email" ? "email" : "text"}
                value={form[k]}
                onChange={(e) => set(k, e.target.value)}
                placeholder={p}
                className="mt-2 h-11 w-full rounded-lg border px-3 font-normal outline-none focus:border-brand"
              />
            </label>
          ))}
          <label className="text-xs font-semibold">
            {user ? "New password (optional)" : "Login password"}
            <input
              required={!user}
              minLength={8}
              type="password"
              value={form.password || ""}
              onChange={(e) => set("password", e.target.value)}
              placeholder={user ? "Leave blank to keep current password" : "Minimum 8 characters"}
              className="mt-2 h-11 w-full rounded-lg border px-3 font-normal outline-none focus:border-brand"
            />
          </label>
          <label className="text-xs font-semibold">
            Organization
            <select
              required
              value={form.organization}
              onChange={(e) => set("organization", e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border px-3 font-normal"
            >
              <option value="" disabled>Select organization</option>
              {ORGANIZATIONS.map((organization) => (
                <option key={organization}>{organization}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold">
            Role
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border px-3 font-normal"
            >
              <option>Customer Admin</option>
              <option>L1 Technician</option>
              <option>L2 Engineer</option>
              <option>L3 Engineer</option>
              <option>Vendor Manager</option>
              <option>Support Agent</option>
              <option>NOC Engineer</option>
              <option>Finance Manager</option>
            </select>
          </label>
          <label className="text-xs font-semibold">
            Status
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border px-3 font-normal"
            >
              <option>ACTIVE</option>
              <option>INACTIVE</option>
              <option>PENDING</option>
              <option>SUSPENDED</option>
            </select>
          </label>
        </div>
        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border px-5 text-xs font-semibold"
          >
            Cancel
          </button>
          <button className="h-10 rounded-lg bg-brand px-5 text-xs font-semibold text-white">
            {user ? "Save changes" : "Add user"}
          </button>
        </div>
      </form>
    </div>
  );
}
