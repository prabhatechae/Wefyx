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
  Camera,
} from "lucide-react";
import { get, getProfilePhotoUrl, uploadProfilePhoto } from "./api";

function Info({ label, value }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <span className="text-[10px] text-slate-400">{label}</span>
      <b className="mt-1 block text-xs">{value || "—"}</b>
    </div>
  );
}

export default function AdminProfilePage({ onBack, profile }) {
  const [user, setUser] = useState(profile || null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  useEffect(() => {
    if (profile?.role && profile.role !== "SUPER_ADMIN") {
      get("/auth/me").then(setUser).catch(() => {});
      return;
    }
    get("/users").then((users) => setUser(Array.isArray(users) ? users.find((item) => item.email === (profile?.email || "admin@wefyx.pro")) || profile || null : profile || null)).catch(() => {});
  }, [profile]);
  useEffect(() => {
    let active=true,currentUrl=null;
    getProfilePhotoUrl().then((url)=>{if(active){currentUrl=url;setPhotoUrl(url)}}).catch(()=>{});
    return()=>{active=false;if(currentUrl)URL.revokeObjectURL(currentUrl)};
  }, []);
  const account = user || profile || {
    name: "System Administrator",
    email: "admin@wefyx.pro",
    role: "Super Admin",
    organization: "Wefyx Technologies",
    location: "Dubai, UAE",
    status: "ACTIVE",
    joinedOn: "2026-04-21T09:00:00",
    lastLogin: new Date().toISOString(),
  };
  const roleLabel = { SUPER_ADMIN: "Super Admin", EMPLOYEE: "Employee", VENDOR: "Vendor", CUSTOMER: "Customer" }[account.role] || account.role;
  const initials = String(account.name || "Wefyx User").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const accessScope = account.role === "SUPER_ADMIN" ? "All organizations" : account.organization || "Own account";
  async function changePhoto(event){
    const file=event.target.files?.[0];if(!file)return;
    setPhotoError("");setUploading(true);
    try{await uploadProfilePhoto(file);const next=await getProfilePhotoUrl();setPhotoUrl((previous)=>{if(previous)URL.revokeObjectURL(previous);return next});window.dispatchEvent(new Event("wefyx-profile-photo-updated"));}
    catch(error){setPhotoError(error.message||"Unable to update profile photo.")}
    finally{setUploading(false);event.target.value=""}
  }
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
          <div className="relative shrink-0">
            <div className="relative flex h-24 w-24 min-w-24 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl font-bold text-brand ring-4 ring-white shadow-md">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`${account.name} profile`}
                  draggable={false}
                  className="absolute inset-0 block h-full w-full object-cover object-center"
                />
              ) : (
                <span className="block select-none leading-none">{initials}</span>
              )}
            </div>
            <label title="Upload profile photo" className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-brand text-white shadow-lg transition hover:bg-blue-700"><Camera size={16}/><input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={changePhoto} disabled={uploading}/></label>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold">{account.name}</h2>
              <span className="pill bg-emerald-50 text-emerald-600">
                Active
              </span>
            </div>
            <span className="mt-2 inline-flex items-center gap-1 rounded bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-600">
              <ShieldCheck size={12} />
              {roleLabel}
            </span>
            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex gap-2">
                <Mail size={14} />
                {account.email}
              </div>
              <div className="flex gap-2">
                <Building2 size={14} />
                {account.organization}
              </div>
              <div className="flex gap-2">
                <MapPin size={14} />
                {account.location || "—"}
              </div>
            </div>
          </div>
          {photoError&&<p className="w-full rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{photoError}</p>}
          {uploading&&<p className="w-full text-xs font-semibold text-brand">Uploading profile photo…</p>}
          <div className="grid min-w-[280px] flex-1 grid-cols-2 gap-5 border-l pl-6 text-xs lg:grid-cols-4">
            <div>
              <span className="text-slate-400">User ID</span>
              <b className="mt-1 block">
                {account.id ? `USR-${String(account.id).padStart(6, "0")}` : "Verified account"}
              </b>
            </div>
            <div>
              <span className="text-slate-400">Account Type</span>
              <b className="mt-1 block">{roleLabel}</b>
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
          <Info label="Full Name" value={account.name} />
          <Info label="Email Address" value={account.email} />
          <Info label="Phone Number" value={account.phone} />
          <Info label="Location" value={account.location} />
          <Info label="Language" value="English" />
        </section>
        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={17} className="text-violet-600" />
            <h3 className="text-sm font-bold">Role & Organization</h3>
          </div>
          <Info label="Primary Role" value={roleLabel} />
          <Info label="Organization" value={account.organization} />
          <Info label="Access Scope" value={accessScope} />
          <Info label="Permission Level" value={account.role === "SUPER_ADMIN" ? "Full system access" : `${roleLabel} access`} />
        </section>
        <section className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Monitor size={17} className="text-emerald-600" />
            <h3 className="text-sm font-bold">Login Activity</h3>
          </div>
          <Info
            label="Last Login"
            value={
              account.lastLogin
                ? new Date(account.lastLogin).toLocaleString()
                : "Today"
            }
          />
          <Info label="Device" value="Chrome on Windows" />
          <Info label="IP Address" value="196.168.1.22" />
          <Info
            label="Member Since"
            value={
              account.joinedOn
                ? new Date(account.joinedOn).toLocaleDateString()
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
            ["Organization accessed", accessScope, Building2],
            ["Permissions verified", `${roleLabel} access`, ShieldCheck],
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
