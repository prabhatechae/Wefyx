import { useState } from "react";
import { ArrowRight, Building2, CalendarDays, Check, Cloud, FileText, Headphones, MapPin, Network, Phone, Server, ShieldCheck, Upload, UsersRound, Wrench, Zap } from "lucide-react";
import { PublicFooter, PublicHeader } from "./RentalPages";

const services = [[Building2,"Managed IT Services",["Proactive monitoring","Patch & update management","Cost optimization"]],[Headphones,"IT Support & Helpdesk",["24/7 helpdesk support","Remote & on-site support","Fast issue resolution"]],[Network,"Network & Infrastructure",["Network design","Wi-Fi & LAN solutions","Firewall & security"]],[Cloud,"Cloud & Microsoft 365",["Cloud migration","Microsoft 365 setup","Secure cloud solutions"]],[ShieldCheck,"Cybersecurity",["Threat protection","Endpoint security","Security audits"]],[Server,"Data Center & AMC",["Server & storage","Data center setup","AMC & maintenance"]]];
const generic = {"data-center":["DATA CENTER SOLUTIONS","Design. Build. Operate. With confidence."],about:["ABOUT WEFYX","Smarter IT. Stronger businesses."],contact:["CONTACT WEFYX","Let’s solve your next technology challenge."],shop:["BUSINESS TECHNOLOGY","Equip your people for their best work."]};

export default function InfoPage({type="services"}) { return type === "services" ? <ServicesPage/> : <Generic type={type}/>; }

function ServicesPage(){
  const [notice,setNotice]=useState(""); const submit=(e,label)=>{e.preventDefault();setNotice(`${label} received — a Wefyx specialist will contact you shortly.`)};
  return <div className="services-reference"><PublicHeader/><main>
    <section className="sr-hero">
      <div className="sr-hero-media">
        <img src="/images/home-hero-reference.png" alt="Wefyx engineer in a server room" className="sr-hero-img"/>
        <div className="sr-hero-fade"/>
      </div>
      <div className="sr-shell sr-hero-inner">
        <div className="sr-copy">
          <p>TRUSTED IT SERVICES PARTNER IN THE UAE</p>
          <h1>Complete IT Services<br/>for <em>Modern Businesses.</em></h1>
          <span>Managed IT, on-site support, infrastructure, cloud, cybersecurity,<br/>CCTV, biometric and data center solutions across the UAE.</span>
          <div className="sr-actions">
            <a href="#requirement">Send Requirement <ArrowRight size={16}/></a>
            <a href="#site-visit"><CalendarDays size={16}/>Book Engineer Visit</a>
          </div>
          <div className="sr-proof">
            <b><ShieldCheck/>Reliable<br/>Support</b>
            <b><UsersRound/>Certified<br/>Engineers</b>
            <b><Zap/>Fast<br/>Response</b>
            <b><MapPin/>UAE<br/>Coverage</b>
          </div>
        </div>
        <aside>
          <small>OUR IT SERVICES</small>
          <div className="sr-aside-list">
            {[[Headphones,"IT Support & Helpdesk"],[Cloud,"Infrastructure & Cloud"],[ShieldCheck,"Cybersecurity"],[Server,"Data Center Solutions"],[Wrench,"On-site Engineer Support"]].map(([I,t])=><span key={t}><I size={19}/>{t}</span>)}
          </div>
          <footer>SECURE <i/> RELIABLE <i/> ALWAYS ON</footer>
        </aside>
      </div>
    </section>
    <section className="sr-shell sr-forms"><VisitForm done={submit}/><RequirementForm done={submit}/></section>
    <section className="sr-shell sr-core"><h2>Our Core IT Services</h2><p>End-to-end IT solutions to keep your business running, secure and future-ready.</p><div>{services.map(([I,t,items])=><article key={t}><I/><h3>{t}</h3><ul>{items.map(x=><li key={x}>{x}</li>)}</ul><a href="#requirement">Learn More <ArrowRight/></a></article>)}</div></section>
    <section className="sr-shell sr-process"><h2>Our Simple Process</h2><p>From request to resolution — a seamless experience.</p><div className="sr-steps">{[[FileText,"Submit Requirement","Share your needs with us"],[CalendarDays,"Book Engineer Visit","Schedule a convenient date & time"],[FileText,"Site Assessment & Proposal","Our engineers assess and provide a tailored solution"],[Wrench,"Execution & Support","We implement and provide ongoing support"]].map(([I,t,d],i)=><article key={t}><b>{i+1}</b><I/><span><strong>{t}</strong><small>{d}</small></span>{i<3&&<ArrowRight/>}</article>)}</div><div className="sr-quick">{[[Headphones,"24/7","Support Available"],[Zap,"SLA","Response Time"],[UsersRound,"Certified","Engineers"],[MapPin,"UAE","Nationwide Coverage"],[Building2,"250+","Business Clients"]].map(([I,n,l])=><span key={n}><I/><b>{n}<small>{l}</small></b></span>)}</div></section>
    <section className="sr-shell sr-support"><Headphones/><div><h2>Need Immediate IT Assistance?</h2><p>Our team is ready to help. Get expert support for your IT infrastructure, systems or devices.</p></div><a href="#site-visit">Book Site Visit <ArrowRight/></a><a href="tel:+97141234567"><Phone/>Talk to Support</a></section>
  </main><PublicFooter/>{notice&&<div className="sr-notice"><Check/>{notice}</div>}</div>;
}
function VisitForm({done}){return <form id="site-visit" onSubmit={e=>done(e,"Site visit booking")}><header><CalendarDays/><div><h2>Book an Engineer for Site Visit</h2><p>Get professional on-site IT support from our certified engineers.<br/>We’ll visit your location, assess your requirements and provide the right solution.</p></div></header><div className="sr-booking"><div className="sr-fields"><Field label="Full Name" req/><Field label="Company Name"/><Field label="Email Address" req type="email"/><Field label="Mobile Number" req placeholder="+971 50 123 4567"/><Select label="Emirate / Location" items={["Select emirate","Dubai","Abu Dhabi","Sharjah"]}/><Select label="Service Type" items={["Select service type","IT Support","Network Setup","Cybersecurity"]}/><Field label="Preferred Date" req type="date"/><Field label="Preferred Time" req type="time"/><Text label="Requirement Details" req/><UploadBox/></div><aside className="sr-summary"><h3>Site Visit Summary</h3><p>Site Visit Fee <b>AED 100</b></p><p>VAT (5%) <b>AED 5</b></p><strong>Total <b>AED 105</b></strong><button>Confirm Booking <ArrowRight/></button><small><ShieldCheck/>Your information is safe with us.</small></aside></div></form>}
function RequirementForm({done}){return <form id="requirement" onSubmit={e=>done(e,"Requirement request")}><header><FileText/><div><h2>Send Your Requirement</h2><p>Share your IT requirements and our experts will get back to you<br/>with a customized solution and quotation.</p></div></header><div className="sr-fields sr-requirement"><Select label="Company / Individual" req items={["Select option","Company","Individual"]}/><Select label="Required Service" req items={["Select service","Managed IT","IT Support","Data Center","Cybersecurity"]}/><Field label="Number of Devices or Users" req placeholder="e.g. 10, 50, 100"/><Select label="Business Type" req items={["Select business type","Corporate","Retail","Healthcare"]}/><Text label="Existing Issues (if any)"/><Select label="Expected Timeline" req items={["Select timeline","Immediately","This month","This quarter"]}/><Select label="Budget Range" items={["Select budget range","Under AED 5,000","AED 5,000–20,000","AED 20,000+"]}/><Text label="Requirement Details" req/><UploadBox wide/><button className="sr-submit">Request Proposal <ArrowRight/></button></div></form>}
function Field({label,req,type="text",placeholder}){return <label>{label}{req&&<sup>*</sup>}<input required={req} type={type} placeholder={placeholder||`Enter your ${label.toLowerCase()}`}/></label>}; function Select({label,req,items}){return <label>{label}{req&&<sup>*</sup>}<select required={req} defaultValue=""><option value="" disabled>{items[0]}</option>{items.slice(1).map(x=><option key={x}>{x}</option>)}</select></label>}; function Text({label,req}){return <label>{label}{req&&<sup>*</sup>}<textarea required={req} placeholder="Tell us more about your requirement..."/></label>}; function UploadBox({wide}) {return <label className={`sr-upload${wide?" sr-wide":""}`}>Attach Files <small>(Optional)</small><span><Upload/>Drag & drop files here or <b>click to browse</b></span></label>}
function Generic({type}){const d=generic[type]||generic.about; return <div className="info-site"><PublicHeader/><main><section className="ip-hero"><div><p>{d[0]}</p><h1>{d[1]}</h1><span>One accountable partner for planning, delivery, support and continuous improvement of your technology environment.</span><a href="/contact">Talk to an expert <ArrowRight/></a></div><img src="/images/wefyx-service-hero.png" alt="Wefyx enterprise infrastructure"/></section></main><PublicFooter/></div>}
