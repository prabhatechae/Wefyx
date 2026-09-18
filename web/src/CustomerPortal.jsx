import { CheckCircle2, Headphones, LogOut } from "lucide-react";

export default function CustomerPortal({ user, onLogout }) {
  return (
    <main className="min-h-screen bg-slate-50 p-5 text-slate-900 sm:p-8">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 /></div>
            <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Wefyx.pro</p><h1 className="text-xl font-bold">Welcome, {user.name}</h1></div>
          </div>
          <button type="button" onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><LogOut size={15} /> Sign out</button>
        </div>
        <div className="mt-10 rounded-2xl bg-slate-50 p-6">
          <Headphones className="text-brand" size={26} />
          <h2 className="mt-4 text-lg font-bold">Your account is ready</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">You are signed in as {user.email}. A Wefyx support specialist can now help you with service requests and account support.</p>
        </div>
      </section>
    </main>
  );
}
