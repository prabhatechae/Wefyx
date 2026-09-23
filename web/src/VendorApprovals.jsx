import {useEffect,useState} from "react";
import {get,send} from "./api";

export default function VendorApprovals(){
 const[rows,setRows]=useState([]),[error,setError]=useState(""),[busy,setBusy]=useState(0);
 async function load(){try{setError("");setRows(await get("/vendor-registrations"))}catch(e){setError(e.message)}}
 useEffect(()=>{load()},[]);
 async function approve(vendor){setBusy(vendor.id);try{await send(`/vendor-registrations/${vendor.id}/approve`,"PATCH",{});await load()}catch(e){setError(e.message)}finally{setBusy(0)}}
 return <section className="card m-5 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">Vendor registration approvals</h2><p className="mt-1 text-xs text-slate-500">Website vendor applications remain inactive until an administrator verifies and approves them.</p></div>{rows.length>0&&<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{rows.length} pending</span>}</div>{error&&<p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}{rows.map(vendor=><div key={vendor.id} className="mt-4 flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center"><div><b className="text-sm">{vendor.organization}</b><p className="mt-1 text-xs text-slate-500">{vendor.name} · {vendor.email}{vendor.phone?` · ${vendor.phone}`:""}</p></div><button disabled={busy===vendor.id} className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white disabled:opacity-50" onClick={()=>approve(vendor)}>{busy===vendor.id?"Approving…":"Approve vendor"}</button></div>)}{!rows.length&&!error&&<p className="mt-4 text-xs text-slate-400">No pending vendor applications.</p>}</section>;
}
