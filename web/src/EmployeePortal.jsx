import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, Clock3, LogOut, Ticket, UserRound } from "lucide-react";
import { get, send } from "./api";
import RequirementsPage from "./RequirementsPage";

const statusStyle={OPEN:"bg-blue-50 text-blue-600",ASSIGNED:"bg-indigo-50 text-indigo-600",IN_PROGRESS:"bg-violet-50 text-violet-600",PENDING:"bg-amber-50 text-amber-700",WAITING_CUSTOMER:"bg-orange-50 text-orange-700",RESOLVED:"bg-emerald-50 text-emerald-600",CLOSED:"bg-slate-100 text-slate-500"};

export default function EmployeePortal({user,onLogout,embedded=false}){
  const[tickets,setTickets]=useState([]),[loading,setLoading]=useState(true);
  useEffect(()=>{get("/tickets").then(rows=>setTickets(Array.isArray(rows)?rows:[])).finally(()=>setLoading(false))},[]);
  const mine=useMemo(()=>tickets.filter(t=>t.assigneeEmail&&t.assigneeEmail.toLowerCase()===user?.email?.toLowerCase()),[tickets,user]);
  const open=mine.filter(t=>!["RESOLVED","CLOSED"].includes(t.status)).length;
  return <div className={`${embedded ? "min-h-[calc(100vh-80px)]" : "min-h-screen"} bg-slate-50`}>
    {!embedded&&<header className="flex h-20 items-center justify-between bg-navy px-5 text-white lg:px-10"><div><b className="text-lg">Wefyx Employee Portal</b><p className="text-xs text-blue-200">Assigned work and service updates</p></div><div className="flex items-center gap-3"><Bell size={19}/><span className="hidden text-sm sm:block">{user?.name}</span><button onClick={onLogout} className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs"><LogOut size={15}/> Sign out</button></div></header>}
    <main className="mx-auto max-w-7xl space-y-5 p-4 lg:p-8"><section className="rounded-2xl bg-gradient-to-r from-blue-700 to-violet-600 p-6 text-white"><p className="text-xs font-semibold text-blue-100">EMPLOYEE WORKSPACE</p><h1 className="mt-2 text-2xl font-bold">Welcome, {user?.name}</h1><p className="mt-1 text-sm text-blue-100">Review customer requirements, invite vendors, compare quotations, chat with participants and manage fulfilment.</p></section>
      <RequirementsPage/>
      <div className="grid gap-3 sm:grid-cols-3">{[["Assigned",mine.length,Ticket],["In progress",open,Clock3],["Completed",mine.length-open,CheckCircle2]].map(([label,value,Icon])=><div key={label} className="card flex items-center gap-4 p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-brand"><Icon size={20}/></div><div><p className="text-xs text-slate-500">{label}</p><b className="text-2xl">{value}</b></div></div>)}</div>
      <section className="card overflow-hidden"><div className="flex items-center justify-between border-b p-5"><div><h2 className="font-bold">My assigned tickets</h2><p className="text-xs text-slate-500">Open the Tickets page to communicate, update progress and resolve work.</p></div><UserRound className="text-brand" size={20}/></div>{loading?<div className="p-12 text-center text-sm text-slate-400">Loading assigned work…</div>:<div className="divide-y">{mine.map(t=><div key={t.id} className="grid gap-3 p-5 md:grid-cols-[1fr_180px] md:items-center"><div><b className="text-sm">{t.subject}</b><p className="mt-1 text-xs text-slate-500">{t.reference} · {t.customer} · {t.category}</p></div><span className={`rounded-lg px-3 py-2 text-center text-xs font-semibold ${statusStyle[t.status]||statusStyle.OPEN}`}>{String(t.status||"OPEN").replaceAll("_"," ")}</span></div>)}{!mine.length&&<div className="p-12 text-center text-sm text-slate-400">No tickets are assigned to you.</div>}</div>}</section>
    </main>
  </div>
}
