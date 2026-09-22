import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, MessageCircle, Paperclip, RefreshCw, Search, Send, X } from "lucide-react";
import { downloadFile, get, send } from "./api";

const badge = { SUBMITTED:"bg-blue-50 text-blue-700", ACCEPTED:"bg-emerald-50 text-emerald-700", UNDER_REVIEW:"bg-amber-50 text-amber-700", SENT_TO_VENDOR:"bg-violet-50 text-violet-700", VENDOR_ACCEPTED:"bg-indigo-50 text-indigo-700", IN_PROGRESS:"bg-cyan-50 text-cyan-700", RESOLVED:"bg-emerald-50 text-emerald-700", CLOSED:"bg-slate-100 text-slate-600", DECLINED:"bg-red-50 text-red-700", REJECTED:"bg-red-50 text-red-700" };
const chatReady = (item) => item && !["SUBMITTED", "DECLINED", "REJECTED"].includes(item.status);

export default function RequirementsPage({ user }) {
  const [rows,setRows]=useState([]), [q,setQ]=useState(""), [selected,setSelected]=useState();
  const [vendors,setVendors]=useState([]), [selectedVendorIds,setSelectedVendorIds]=useState([]), [quotes,setQuotes]=useState([]);
  const [attachments,setAttachments]=useState([]);
  const [notes,setNotes]=useState(""), [messages,setMessages]=useState([]), [message,setMessage]=useState("");
  const [quote,setQuote]=useState({amount:"",leadTimeDays:"",notes:""}), [busy,setBusy]=useState(false), [error,setError]=useState("");
  const load=()=>get("/requirements").then((x)=>setRows(Array.isArray(x)?x:[]));
  useEffect(()=>{load()},[]);
  const shown=useMemo(()=>rows.filter((r)=>`${r.reference} ${r.title} ${r.organization} ${r.vendorName||""}`.toLowerCase().includes(q.toLowerCase())),[rows,q]);
  const quoteValue=rows.reduce((n,r)=>n+Number(r.agreedAmount||0),0);

  async function open(item){
    setSelected(item);setNotes(item.employeeNotes||"");setError("");setSelectedVendorIds([]);setQuote({amount:"",leadTimeDays:"",notes:""});
    const [offers,chat,directory,docs]=await Promise.all([get(`/requirements/${item.id}/quotations`).catch(()=>[]),chatReady(item)?get(`/requirements/${item.id}/messages`).catch(()=>[]):Promise.resolve([]),get("/users?role=VENDOR&status=ACTIVE").catch(()=>[]),get(`/requirements/${item.id}/attachments`).catch(()=>[])]);
    setQuotes(offers);setMessages(chat);setVendors(directory);setAttachments(docs);
  }
  async function refreshDetail(){
    if(!selected)return;
    const [current,offers,chat,docs]=await Promise.all([get(`/requirements/${selected.id}`),get(`/requirements/${selected.id}/quotations`).catch(()=>[]),get(`/requirements/${selected.id}/messages`).catch(()=>[]),get(`/requirements/${selected.id}/attachments`).catch(()=>[])]);
    setSelected(current);setQuotes(offers);setMessages(chat);setAttachments(docs);
  }
  async function act(action){
    if(!selected)return;setBusy(true);setError("");
    try{
      if(action==="accept")await send(`/requirements/${selected.id}/accept`,"PATCH",{employeeName:user?.name||"Wefyx Support Team",notes});
      if(action==="review")await send(`/requirements/${selected.id}/review`,"PATCH",{employeeName:user?.name||"Wefyx Support Team",notes});
      if(action==="decline")await send(`/requirements/${selected.id}/decline`,"PATCH",{employeeName:user?.name||"Wefyx Support Team",notes});
      if(action==="invite")await send(`/requirements/${selected.id}/quotations/invite`,"POST",{vendorIds:selectedVendorIds});
      if(action==="share")await send(`/requirements/${selected.id}/quotations/share`,"PATCH",{});
      await load();await refreshDetail();
    }catch(e){setError(e.message||"Unable to update requirement")}finally{setBusy(false)}
  }
  async function sendDirectQuote(){
    if(!selected||!quote.amount||!quote.leadTimeDays||!quote.notes.trim())return;setBusy(true);setError("");
    try{await send(`/requirements/${selected.id}/quotations/employee`,"POST",{...quote,employeeName:user?.name||"Wefyx Support Team"});setQuote({amount:"",leadTimeDays:"",notes:""});await load();await refreshDetail()}
    catch(e){setError(e.message||"Unable to send quotation")}finally{setBusy(false)}
  }
  async function sendMessage(){
    if(!message.trim()||!selected)return;setError("");
    try{await send(`/requirements/${selected.id}/messages`,"POST",{message,senderName:user?.name||"Wefyx Support Team",senderRole:"EMPLOYEE"});setMessage("");await refreshDetail()}
    catch(e){setError(e.message||"Unable to send message")}
  }

  return <div className="space-y-4 p-4 lg:p-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Requirements",rows.length],["Awaiting review",rows.filter((r)=>r.status==="SUBMITTED").length],["Active",rows.filter((r)=>!["SUBMITTED","DECLINED","REJECTED","CLOSED"].includes(r.status)).length],["Awarded value",`AED ${quoteValue.toLocaleString()}`]].map(([label,value])=><div className="card p-4" key={label}><span className="text-xs text-slate-500">{label}</span><b className="mt-1 block text-xl">{value}</b></div>)}</div>
    <div className="card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><div><h2 className="font-bold">Requirements & quotations</h2><p className="text-xs text-slate-500">Review requests, send a Wefyx quotation or collect competitive vendor offers.</p></div><div className="flex items-center gap-2 rounded-lg border px-3"><Search size={15}/><input className="h-9 w-56 text-xs outline-none" placeholder="Search requirements" value={q} onChange={(e)=>setQ(e.target.value)}/><button onClick={load}><RefreshCw size={14}/></button></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-xs"><thead className="table-head"><tr><th className="px-4 py-3">Requirement</th><th>Customer</th><th>Category</th><th>Status</th><th>Quotation stage</th><th>Action</th></tr></thead><tbody>{shown.map((r)=><tr className="border-t" key={r.id}><td className="px-4 py-3"><b>{r.title}</b><div className="text-[10px] text-brand">{r.reference}</div></td><td>{r.organization||r.customerName}</td><td>{r.category}</td><td><span className={`pill ${badge[r.status]||"bg-slate-50"}`}>{r.status.replaceAll("_"," ")}</span></td><td>{r.quotationRequested?r.quotationStatus.replaceAll("_"," "):"Not requested"}</td><td><button className="rounded-lg bg-brand px-3 py-2 font-semibold text-white" onClick={()=>open(r)}>Process</button></td></tr>)}</tbody></table></div>
    </div>
    {selected&&<div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold">{selected.reference} · {selected.title}</h3><span className={`pill mt-2 inline-block ${badge[selected.status]||"bg-slate-50"}`}>{selected.status.replaceAll("_"," ")}</span></div><button onClick={()=>setSelected()} className="rounded-lg p-2 hover:bg-slate-100"><X size={19}/></button></div>
      <p className="mt-3 text-sm text-slate-600">{selected.description}</p>
      <textarea className="mt-4 min-h-20 w-full rounded-xl border p-3 text-sm" placeholder="Employee review notes or decline reason" value={notes} onChange={(e)=>setNotes(e.target.value)}/>
      {error&&<p className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">{selected.status==="SUBMITTED"&&<><button disabled={busy} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white" onClick={()=>act("accept")}><CheckCircle2 className="mr-2 inline" size={16}/>Accept</button><button disabled={busy||!notes.trim()} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" onClick={()=>act("decline")}>Decline</button></>}{selected.status==="ACCEPTED"&&<button disabled={busy} className="rounded-xl border px-4 py-2 text-sm font-semibold" onClick={()=>act("review")}>Start review</button>}{chatReady(selected)&&!["RESOLVED","CLOSED"].includes(selected.status)&&<button disabled={busy||!notes.trim()} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-40" onClick={()=>act("decline")}>Decline with reason</button>}</div>
      <section className="mt-5 rounded-xl border p-4"><h4 className="flex items-center gap-2 text-sm font-bold"><Paperclip size={17}/>Customer attachments <span className="text-xs font-normal text-slate-400">({attachments.length})</span></h4><div className="mt-3 space-y-2">{attachments.map((file)=><button key={file.id} onClick={()=>downloadFile(`/requirements/${selected.id}/attachments/${file.id}/download`,file.fileName)} className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 text-left"><span className="min-w-0"><b className="block truncate text-sm">{file.fileName}</b><small className="text-slate-500">{(file.fileSize/1024).toFixed(1)} KB · uploaded by {file.uploadedBy}</small></span><Download className="shrink-0 text-brand" size={17}/></button>)}{!attachments.length&&<p className="text-xs text-slate-400">No files attached to this requirement.</p>}</div></section>
      {chatReady(selected)&&<section className="mt-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4"><h4 className="text-sm font-bold text-slate-900">Create Wefyx quotation</h4><p className="mt-1 text-xs text-slate-500">Prepare an official quotation and send it directly to the customer for selection.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Amount (AED)<input type="number" min="1" value={quote.amount} onChange={(e)=>setQuote({...quote,amount:e.target.value})} className="mt-1 h-11 w-full rounded-xl border bg-white px-3 text-sm" placeholder="2500"/></label><label className="text-xs font-semibold">Delivery days<input type="number" min="1" value={quote.leadTimeDays} onChange={(e)=>setQuote({...quote,leadTimeDays:e.target.value})} className="mt-1 h-11 w-full rounded-xl border bg-white px-3 text-sm" placeholder="7"/></label></div><textarea value={quote.notes} onChange={(e)=>setQuote({...quote,notes:e.target.value})} className="mt-3 min-h-20 w-full rounded-xl border bg-white p-3 text-sm" placeholder="Scope, inclusions, terms and validity"/><button disabled={busy||!quote.amount||!quote.leadTimeDays||!quote.notes.trim()} onClick={sendDirectQuote} className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"><Send className="mr-2 inline" size={15}/>Send quotation to customer</button></section>}
      {selected.quotationRequested&&chatReady(selected)&&<section className="mt-5 rounded-xl border p-4"><h4 className="text-sm font-bold">Collect vendor quotations</h4><div className="mt-3 grid gap-2 sm:grid-cols-2">{vendors.map((v)=><button key={v.id} onClick={()=>setSelectedVendorIds((ids)=>ids.includes(v.id)?ids.filter((id)=>id!==v.id):[...ids,v.id])} className={`rounded-xl border p-3 text-left ${selectedVendorIds.includes(v.id)?"border-brand bg-blue-50":"bg-white"}`}><b className="text-sm">{v.name}</b><p className="text-xs text-slate-500">{v.organization}</p></button>)}</div><button onClick={()=>act("invite")} disabled={!selectedVendorIds.length||busy} className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"><Send className="mr-2 inline" size={15}/>Send to {selectedVendorIds.length} vendors</button><div className="mt-4 space-y-2">{quotes.map((item)=><div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><div><b>{item.vendorName}</b><p className="text-xs text-slate-500">{item.amount?`AED ${item.amount} · ${item.leadTimeDays} days`:"Awaiting response"}</p></div><span className="pill bg-white">{item.status.replaceAll("_"," ")}</span></div>)}</div>{quotes.some((item)=>item.status==="SUBMITTED")&&<button onClick={()=>act("share")} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Share submitted vendor quotes</button>}</section>}
      <section className="mt-5 rounded-xl border p-4"><h4 className="flex items-center gap-2 text-sm font-bold"><MessageCircle size={17}/>Customer communication</h4>{!chatReady(selected)?<p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Chat opens after accepting the requirement.</p>:<><div className="mt-3 max-h-48 space-y-2 overflow-y-auto">{messages.map((item)=><div key={item.id} className="rounded-xl bg-slate-50 p-3"><div className="text-[10px] font-semibold text-brand">{item.senderName} · {item.senderRole}</div><p className="mt-1 text-sm">{item.message}</p></div>)}{!messages.length&&<p className="text-xs text-slate-400">No messages yet.</p>}</div><div className="mt-3 flex gap-2"><input value={message} onChange={(e)=>setMessage(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter")sendMessage()}} className="h-11 flex-1 rounded-xl border px-3 text-sm" placeholder="Message customer"/><button onClick={sendMessage} className="rounded-xl bg-brand px-4 text-white"><Send size={16}/></button></div></>}</section>
    </div></div>}
  </div>;
}
