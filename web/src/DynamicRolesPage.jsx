import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  ShieldCheck,
  Pencil,
  Trash2,
  Users,
  CheckCircle2,
  Shield,
  MoreVertical,
} from "lucide-react";
import { get, send } from "./api";
import {
  ORGANIZATIONS,
  selectedOrganization,
} from "./organizationContext";

const emptyRole = {
  name: "",
  code: "",
  type: "Custom",
  users: 0,
  description: "",
  organization: "",
  active: true,
};

function RoleModal({ role, onClose, onSave }) {
  const [form, setForm] = useState(() =>
    role || { ...emptyRole, organization: selectedOrganization() },
  );
  const set = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close role form"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45"
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
        className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {role ? "Edit role" : "Add new role"}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Configure role details, type and availability.
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
          <label className="text-xs font-semibold">
            Role name
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border px-3 font-normal outline-none focus:border-brand"
            />
          </label>
          <label className="text-xs font-semibold">
            Role code
            <input
              required
              value={form.code}
              onChange={(e) =>
                set("code", e.target.value.toUpperCase().replace(/\s+/g, "_"))
              }
              className="mt-2 h-11 w-full rounded-lg border px-3 font-normal outline-none focus:border-brand"
            />
          </label>
          <label className="text-xs font-semibold">
            Role type
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border px-3 font-normal"
            >
              <option>System</option>
              <option>Custom</option>
            </select>
          </label>
          <label className="text-xs font-semibold">
            Organization
            <select required value={form.organization || ""} onChange={(e) => set("organization", e.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3 font-normal">
              <option value="" disabled>Select organization</option>
              {ORGANIZATIONS.map((organization) => <option key={organization}>{organization}</option>)}
            </select>
          </label>
          <div className="rounded-lg border bg-slate-50 p-3 text-xs">
            <b>Assigned users</b>
            <p className="mt-1 text-slate-500">
              Calculated automatically from employee role assignments.
            </p>
          </div>
          <label className="text-xs font-semibold sm:col-span-2">
            Description
            <textarea
              required
              rows="3"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="mt-2 w-full rounded-lg border p-3 font-normal outline-none focus:border-brand"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
            />{" "}
            Active role
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
            {role ? "Save changes" : "Add role"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DynamicRolesPage() {
  const [roles, setRoles] = useState([]),
    [employees, setEmployees] = useState([]),
    [loading, setLoading] = useState(true),
    [query, setQuery] = useState(""),
    [type, setType] = useState("All"),
    [page, setPage] = useState(1),
    [size, setSize] = useState(10),
    [editing, setEditing] = useState(undefined);
  useEffect(() => {
    Promise.all([get("/roles"), get("/users")]).then(([roleData, userData]) => {
      setRoles(Array.isArray(roleData) ? roleData : []);
      setEmployees(Array.isArray(userData) ? userData : []);
      setLoading(false);
    });
  }, []);
  const assignedUsers = (roleName) =>
    employees.filter((employee) => employee.role === roleName).length;
  const filtered = useMemo(
    () =>
      roles.filter(
        (role) =>
          (type === "All" || role.type === type) &&
          `${role.name} ${role.code} ${role.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [roles, type, query],
  );
  useEffect(() => setPage(1), [query, type, size]);
  const pages = Math.max(1, Math.ceil(filtered.length / size)),
    visible = filtered.slice((page - 1) * size, page * size);
  async function save(form) {
    if (editing?.id) {
      const saved = await send(`/roles/${editing.id}`, "PUT", {
        ...editing,
        ...form,
      });
      setRoles((current) =>
        current.map((role) => (role.id === saved.id ? saved : role)),
      );
    } else {
      const saved = await send("/roles", "POST", form);
      setRoles((current) => [saved, ...current]);
    }
    setEditing(undefined);
  }
  async function remove(role) {
    if (!window.confirm(`Delete role ${role.name}?`)) return;
    await send(`/roles/${role.id}`, "DELETE");
    setRoles((current) => current.filter((item) => item.id !== role.id));
  }
  const cards = [
    ["Total Roles", roles.length, Users],
    ["Active Roles", roles.filter((x) => x.active).length, CheckCircle2],
    ["Inactive Roles", roles.filter((x) => !x.active).length, Shield],
    [
      "System Roles",
      roles.filter((x) => x.type === "System").length,
      ShieldCheck,
    ],
    [
      "Custom Roles",
      roles.filter((x) => x.type === "Custom").length,
      ShieldCheck,
    ],
  ];
  return (
    <div className="space-y-4 p-4 lg:p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, Icon]) => (
          <div className="card flex items-center gap-3 p-4" key={label}>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-brand">
              <Icon size={19} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500">{label}</span>
              <b className="block text-xl">{value}</b>
            </div>
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex gap-2">
            {["All", "System", "Custom"].map((value) => (
              <button
                onClick={() => setType(value)}
                key={value}
                className={`rounded-lg px-3 py-2 text-[10px] font-semibold ${type === value ? "bg-brand text-white" : "bg-slate-50 text-slate-500"}`}
              >
                {value} Roles
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex h-9 items-center gap-2 rounded-lg border px-3">
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-56 text-xs outline-none"
                placeholder="Search roles..."
              />
            </div>
            <button
              onClick={() => setEditing(null)}
              className="flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-white"
            >
              <Plus size={15} /> Add New Role
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-xs">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Role Name</th>
                <th>Type</th>
                <th>Users</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((role) => (
                <tr key={role.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-50 text-violet-600">
                        <ShieldCheck size={17} />
                      </div>
                      <div>
                        <b>{role.name}</b>
                        <div className="text-[9px] text-slate-400">
                          {role.code}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`pill ${role.type === "System" ? "bg-blue-50 text-brand" : "bg-violet-50 text-violet-600"}`}
                    >
                      {role.type}
                    </span>
                  </td>
                  <td>
                    <b>{assignedUsers(role.name)}</b>
                  </td>
                  <td className="max-w-sm text-slate-500">
                    {role.description}
                  </td>
                  <td>
                    <span
                      className={`pill ${role.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                    >
                      {role.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditing(role)}
                        title="Edit role"
                        className="icon-btn h-8 w-8"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => remove(role)}
                        title="Delete role"
                        className="icon-btn h-8 w-8 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button className="icon-btn h-8 w-8">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="p-10 text-center text-sm text-slate-400">
              Loading roles...
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-[11px] text-slate-500">
          <span>
            Showing {filtered.length ? (page - 1) * size + 1 : 0}–
            {Math.min(page * size, filtered.length)} of {filtered.length} roles
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
              className="icon-btn h-8 w-8 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: pages }, (_, index) => index + 1).map(
              (value) => (
                <button
                  onClick={() => setPage(value)}
                  key={value}
                  className={`icon-btn h-8 w-8 ${page === value ? "border-brand text-brand" : ""}`}
                >
                  {value}
                </button>
              ),
            )}
            <button
              disabled={page === pages}
              onClick={() => setPage((value) => value + 1)}
              className="icon-btn h-8 w-8 disabled:opacity-40"
            >
              ›
            </button>
          </div>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="rounded-lg border px-3 py-2"
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>
      </div>
      {editing !== undefined && (
        <RoleModal
          role={editing?.id ? editing : null}
          onClose={() => setEditing(undefined)}
          onSave={save}
        />
      )}
    </div>
  );
}
