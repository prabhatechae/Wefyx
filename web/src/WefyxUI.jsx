import { Check, Headphones, ShieldCheck, BriefcaseBusiness, UserRound } from "lucide-react";

export function Brand() {
  return <a href="/" className="wf-brand" aria-label="Wefyx home">Wefy<span>x</span><small>IT Support. Assets. Always On.</small></a>;
}

export function AuthVisual({ login = false }) {
  return <section className={`wf-auth-visual ${login ? "wf-login-visual" : ""}`}><Brand/><div className="wf-auth-copy"><h1>{login ? "Same Support. Greater Possibilities." : "Join Wefyx"}</h1><p>{login ? "Your support, equipment and service updates. All in one place." : "Create your account and get started with smart IT support and asset services for your business."}</p>{!login && <ul>{[[UserRound,"Quick Registration","Get started in minutes"],[ShieldCheck,"Secure Account","Your own business workspace"],[BriefcaseBusiness,"Access All Services","Support, requirements and equipment"],[Headphones,"Dedicated Support","We are always here for you"]].map(([Icon,title,copy])=><li key={title}><Icon/><div><b>{title}</b><small>{copy}</small></div></li>)}</ul>}</div><img src="/images/home-hero-reference.png" alt="Professional Wefyx IT support"/><p className="wf-auth-caption">Smarter IT for a Better Tomorrow</p></section>;
}

export function Stepper({ steps, current }) {
  return <ol className="wf-stepper" aria-label="Progress">{steps.map((step,index)=><li key={step} className={index < current ? "complete" : index === current ? "current" : ""} aria-current={index === current ? "step" : undefined}><span>{index < current ? <Check size={15}/> : index + 1}</span><b>{step}</b></li>)}</ol>;
}
