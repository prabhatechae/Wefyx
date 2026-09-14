import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  MapPin,
  ShieldCheck,
  Building2,
  CalendarDays,
  Clock3,
  Monitor,
  KeyRound,
  CheckCircle2,
  UserRound,
} from "lucide-react";
import { get } from "./api";

function Info({ label, value }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <span className="text-[10px] text-slate-400">{label}</span>
      <b className="mt-1 block text-xs">{value || "—"}</b>
    </div>
  );
}

export default function AdminProfilePage({ onBack }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    get("/users").then((users) =>
      setUser(
        Array.isArray(users)
          ? users.find((item) => item.email === "admin@wefyx.pro") || null
          : null,
      ),
    );
  }, []);
  const admin = user || {
    name: "System Administrator",
    email: "admin@wefyx.pro",
    role: "Super Admin",
    organization: "Wefyx Technologies",
    location: "Dubai, UAE",
    status: "ACTIVE",
    joinedOn: "2026-04-21T09:00:00",
    lastLogin: new Date().toISOString(),
  };
  return (
    <div className="space-y-4 p-4 lg:p-5">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand"
      >
        <ArrowLeft size={15} /> Back
      </button>
      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <section className="card flex w-full flex-wrap items-start gap-6 p-6 xl:min-w-0 xl:flex-1">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-blue-100 text-2xl font-bold text-brand">
            SA
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold">{admin.name}</h2>
              <span className="pill bg-emerald-50 text-emerald-600">
                Active
              </span>
            </div>
            <span className="mt-2 inline-flex items-center gap-1 rounded bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-600">
              <ShieldCheck size={12} />
              {admin.role}
            </span>
            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex gap-2">
                <Mail size={14} />
                {admin.email}
              </div>
              <div className="flex gap-2">
                <Building2 size={14} />
                {admin.organization}
              </div>
              <div className="flex gap-2">
                <MapPin size={14} />
                {admin.location}
              </div>
            </div>
          </div>
          <div className="grid min-w-[280px] flex-1 grid-cols-2 gap-5 border-l pl-6 text-xs lg:grid-cols-4">
            <div>
              <span className="text-slate-400">User ID</span>
              <b className="mt-1 block">
                USR-{String(admin.id || 1).padStart(6, "0")}
              </b>
            </div>
            <div>
              <span className="text-slate-400">Account Type</span>
              <b className="mt-1 block">Platform Admin</b>
            </div>
            <div>
              <span className="text-slate-400">Last Login</span>
              <b className="mt-1 block text-emerald-600">Today</b>
            </div>
            <div>
              <span className="text-slate-400">Status</span>
              <b className="mt-1 block text-emerald-600">Active</b>
            </div>
          </div>
        </section>
        <div className="card w-full shrink-0 p-5 xl:w-80">
          <h3 className="text-sm font-bold">Account Security</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <div>
                <b className="block text-xs">Account secured</b>
                <span className="text-[9px] text-slate-500">
                  All security checks passed
                </span>
              </div>
            </div>
            <button className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-xs font-semibold">
              <KeyRound size={14} /> Change Password
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <UserRound size={17} className="text-brand" />
            <h3 className="text-sm font-bold">Personal Information</h3>
          </div>
          <Info label="Full Name" value={admin.name} />
          <Info label="Email Address" value={admin.email} />
          <Info label="Location" value={admin.location} />
          <Info label="Language" value="English" />
        </section>
        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={17} className="text-violet-600" />
            <h3 className="text-sm font-bold">Role & Organization</h3>
          </div>
          <Info label="Primary Role" value={admin.role} />
          <Info label="Organization" value={admin.organization} />
          <Info label="Access Scope" value="All Organizations" />
          <Info label="Permission Level" value="Full System Access" />
        </section>
        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Monitor size={17} className="text-emerald-600" />
            <h3 className="text-sm font-bold">Login Activity</h3>
          </div>
          <Info
            label="Last Login"
            value={
              admin.lastLogin
                ? new Date(admin.lastLogin).toLocaleString()
                : "Today"
            }
          />
          <Info label="Device" value="Chrome on Windows" />
          <Info label="IP Address" value="196.168.1.22" />
          <Info
            label="Member Since"
            value={
              admin.joinedOn
                ? new Date(admin.joinedOn).toLocaleDateString()
                : "Apr 21, 2026"
            }
          />
        </section>
      </div>
      <section className="card p-5">
        <div className="flex items-center gap-2">
          <Clock3 size={17} className="text-brand" />
          <h3 className="text-sm font-bold">Recent Account Activity</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["Signed in", "Current session", CheckCircle2],
            ["Organization accessed", "All Organizations", Building2],
            ["Permissions verified", "Super Admin access", ShieldCheck],
          ].map(([title, detail, Icon]) => (
            <div
              key={title}
              className="flex items-center gap-3 rounded-lg border p-4"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-brand">
                <Icon size={16} />
              </div>
              <div>
                <b className="block text-xs">{title}</b>
                <span className="text-[9px] text-slate-400">{detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
