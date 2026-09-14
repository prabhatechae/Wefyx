import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Activity,
  CheckCircle2,
  Clock3,
  Shield,
  MoreVertical,
} from "lucide-react";
import { get, send } from "./api";
import {
  ORGANIZATIONS,
  selectedOrganization,
} from "./organizationContext";
const labels = {
  Organizations: "Organization",
  Branches: "Branch",
  Departments: "Department",
  Teams: "Team",
  Technicians: "Technician",
  "Contracts (AMC)": "Contract",
  Assets: "Asset",
  "Asset Rental": "Rental",
  Inventory: "Inventory Item",
  "NOC Monitoring": "Monitor",
  Vendors: "Vendor",
  "Products & Services": "Product",
  "Purchase & RFQ": "RFQ",
  "Vendor Settlements": "Settlement",
  "Invoices & Billing": "Invoice",
  Payments: "Payment",
  "Wallet & Credits": "Wallet",
  Payouts: "Payout",
  "System Settings": "Setting",
  Integrations: "Integration",
  "Reports & Analytics": "Report",
  Permissions: "Permission",
  "Permission Requests": "Access Request",
};
const names = [
  "Primary record",
  "Operations record",
  "Service request",
  "Enterprise account",
  "Regional assignment",
  "Compliance review",
];
const keyOf = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-");
function Modal({ record, entity, onClose, onSave }) {
  const [f, setF] = useState(() =>
    record || {
      name: "",
      owner: selectedOrganization(),
      details: "Dubai, UAE",
      status: "Active",
    },
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button onClick={onClose} className="absolute inset-0 bg-slate-950/45" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(f);
        }}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">
            {record ? "Edit" : "Add"} {entity}
          </h2>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="mt-5 space-y-4">
          {[['Name','name'],['Details','details']].map(([l, k]) => (
            <label key={k} className="block text-xs font-semibold">
              {l}
              <input
                required
                value={f[k] || ""}
                onChange={(e) => setF({ ...f, [k]: e.target.value })}
                className="mt-2 h-11 w-full rounded-lg border px-3 font-normal outline-none focus:border-brand"
              />
            </label>
          ))}
          <label className="block text-xs font-semibold">
            Organization
            <select required value={f.owner || ""} onChange={(e) => setF({...f,owner:e.target.value})} className="mt-2 h-11 w-full rounded-lg border px-3 font-normal">
              <option value="" disabled>Select organization</option>
              {ORGANIZATIONS.map((organization) => <option key={organization}>{organization}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold">
            Status
            <select
              value={f.status}
              onChange={(e) => setF({ ...f, status: e.target.value })}
              className="mt-2 h-11 w-full rounded-lg border px-3 font-normal"
            >
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
              <option>Attention</option>
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border px-4 text-xs"
          >
            Cancel
          </button>
          <button className="h-10 rounded-lg bg-brand px-4 text-xs font-semibold text-white">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
export default function DynamicModulePage({ name }) {
  const entity = labels[name] || name,
    moduleKey = keyOf(name);
  const backendOnly = ["Permissions", "Permission Requests"].includes(name);
  const initial = useMemo(
    () =>
      backendOnly ? [] : names.map((x, i) => ({
        id: `seed-${i}`,
        name: `${entity} ${x}`,
        owner: ["Wefyx Technologies", "ABC Trading LLC", "TechSolutions LLC"][
          i % 3
        ],
        details: ["Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE"][i % 3],
        status: i === 2 ? "Pending" : i === 4 ? "Attention" : "Active",
        local: true,
      })),
    [name, backendOnly],
  );
  const [rows, setRows] = useState(initial),
    [editing, setEditing] = useState(undefined),
    [q, setQ] = useState("");
  useEffect(() => {
    get(`/resources/${moduleKey}`).then(
      (x) => Array.isArray(x) && setRows(backendOnly ? x : [...x, ...initial]),
    );
  }, [moduleKey, backendOnly]);
  async function save(form) {
    if (editing?.id) {
      const next = { ...editing, ...form };
      setRows((v) => v.map((x) => (x.id === editing.id ? next : x)));
      setEditing(undefined);
      if (!editing.local)
        try {
          await send(`/resources/${moduleKey}/${editing.id}`, "PUT", next);
        } catch {}
    } else {
      const temp = { ...form, id: Date.now() };
      setRows((v) => [temp, ...v]);
      setEditing(undefined);
      try {
        const saved = await send(`/resources/${moduleKey}`, "POST", form);
        setRows((v) => v.map((x) => (x.id === temp.id ? saved : x)));
      } catch {}
    }
  }
  async function remove(r) {
    setRows((v) => v.filter((x) => x.id !== r.id));
    if (!r.local)
      try {
        await send(`/resources/${moduleKey}/${r.id}`, "DELETE");
      } catch {}
  }
  const shown = rows.filter((r) =>
    `${r.name} ${r.owner} ${r.details}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="space-y-4 p-4 lg:p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total", rows.length, Activity],
          [
            "Active",
            rows.filter((x) => x.status === "Active").length,
            CheckCircle2,
          ],
          [
            "Pending",
            rows.filter((x) => x.status === "Pending").length,
            Clock3,
          ],
          [
            "Attention",
            rows.filter((x) => x.status === "Attention").length,
            Shield,
          ],
        ].map(([l, n, Icon]) => (
          <div key={l} className="card flex items-center gap-4 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-brand">
              <Icon size={21} />
            </div>
            <div>
              <span className="text-xs text-slate-500">
                {l} {entity}s
              </span>
              <b className="block text-2xl">{n}</b>
            </div>
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <h2 className="text-sm font-bold">{entity} Management</h2>
          <div className="flex gap-2">
            <div className="flex h-9 items-center gap-2 rounded-lg border px-3">
              <Search size={15} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-52 text-xs outline-none"
                placeholder={`Search ${entity.toLowerCase()}s...`}
              />
            </div>
            <button
              onClick={() => setEditing(null)}
              className="flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-xs font-semibold text-white"
            >
              <Plus size={15} /> Add {entity}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-xs">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">{entity}</th>
                <th>Owner / Organization</th>
                <th>Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">
                    <b>{r.name}</b>
                    <div className="text-[9px] text-slate-400">
                      {moduleKey.toUpperCase()}-{1000 + i}
                    </div>
                  </td>
                  <td>{r.owner}</td>
                  <td>{r.details}</td>
                  <td>
                    <select
                      value={r.status}
                      onChange={(e) => {
                        const status = e.target.value;
                        setRows((v) =>
                          v.map((x) => (x.id === r.id ? { ...x, status } : x)),
                        );
                        if (!r.local)
                          send(
                            `/resources/${moduleKey}/${r.id}/status`,
                            "PATCH",
                            { status },
                          ).catch(() => {});
                      }}
                      className="rounded-md border px-2 py-1 text-[10px]"
                    >
                      <option>Active</option>
                      <option>Pending</option>
                      <option>Inactive</option>
                      <option>Attention</option>
                    </select>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button className="icon-btn h-8 w-8">
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => setEditing(r)}
                        className="icon-btn h-8 w-8"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => remove(r)}
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
        </div>
      </div>
      {editing !== undefined && (
        <Modal
          record={editing?.id ? editing : null}
          entity={entity}
          onClose={() => setEditing(undefined)}
          onSave={save}
        />
      )}
    </div>
  );
}
