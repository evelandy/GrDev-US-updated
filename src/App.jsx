import { useState, useEffect, useRef } from "react";
 
/* =========================================================================
   CONFIG — change these when your domain and backend are ready.
   In a Vite project, swap the strings for import.meta.env.VITE_API_BASE_URL
   and import.meta.env.VITE_SITE_URL so each environment sets its own.
   ========================================================================= */
const CONFIG = {
  brand: "GRDEV",
  siteUrl: "", // e.g. "https://grdev.com" once you buy the domain
  apiBaseUrl: "", // e.g. "https://api.grdev.com" — empty = mock mode
  contactEmail: "hello@example.com", // replace with your domain email
  location: "Houston area, Texas",
  phone: "", // e.g. "(713) 555-0123" — shown in the nav and footer when set
};
 
/* =========================================================================
   API LAYER — every network call goes through here, so connecting your
   Node/Express (or Flask) backend means editing this block only.
   ========================================================================= */
async function request(path, options = {}) {
  const res = await fetch(`${CONFIG.apiBaseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request to ${path} failed with status ${res.status}`);
  return res.json();
}
 
const mock = (data, ms = 600) => new Promise((r) => setTimeout(() => r(data), ms));
const live = () => Boolean(CONFIG.apiBaseUrl);
 
const api = {
  contact: {
    submit: (payload) =>
      live()
        ? request("/contact", { method: "POST", body: JSON.stringify(payload) })
        : mock({ ok: true }),
  },
  analytics: {
    // Hook point for GA4 / GTM / your own events table.
    track: (event, props = {}) => {
      if (window.dataLayer) window.dataLayer.push({ event, ...props });
      if (live())
        request("/events", { method: "POST", body: JSON.stringify({ event, ...props }) }).catch(() => {});
    },
  },
  assistant: {
    // Point this at your agent / help-bot endpoint later.
    ask: (message, history) =>
      live()
        ? request("/assistant", { method: "POST", body: JSON.stringify({ message, history }) })
        : mock({
            reply:
              "The assistant isn't connected yet. Use the contact form below and William will reply directly.",
          }),
  },
  audit: {
    // Free audit requests. Later: save to Postgres, run PageSpeed/Lighthouse, email the report.
    request: (payload) =>
      live()
        ? request("/audit", { method: "POST", body: JSON.stringify(payload) })
        : mock({ ok: true }),
  },
  work: {
    // Swap the static WORK array for a database or CMS call later.
    list: () => (live() ? request("/work") : mock(WORK, 0)),
  },
};
 
/* =========================================================================
   CONTENT — edit freely. Confirm you're allowed to name each client.
   ========================================================================= */
const HEADLINES = {
  A: { text: "Websites built to be measured.", note: "Direct. Condensed. Heavy." },
  B: { text: "A slow website quietly costs you customers.", note: "Open. Wide. Light." },
};
 
/* Prices are suggested starting points — change them here. */
const PLANS = [
  {
    name: "Launch",
    for: "For local businesses that need a professional site fast.",
    setup: "$1,500",
    monthly: "$99/mo",
    alt: "or $3,500 one time, with an optional care plan",
    items: [
      "Up to 5 custom-designed pages",
      "Mobile-first and speed tested",
      "Google Business Profile setup",
      "Contact and quote forms",
      "Hosting, backups, security and updates",
      "Small content edits each month",
    ],
  },
  {
    name: "Grow",
    for: "For businesses ready to turn visitors into more calls and sales.",
    setup: "$2,500",
    monthly: "$249/mo",
    alt: "Everything in Launch, plus:",
    featured: true,
    items: [
      "Up to 10 pages or a landing page system",
      "Google Analytics and Tag Manager tracking",
      "Local SEO for your service area",
      "One A/B test every quarter",
      "Monthly results report in plain English",
      "AI help bot trained on your site's content",
    ],
  },
  {
    name: "Custom",
    for: "For web apps, client portals, automations and larger builds.",
    setup: "$6,000",
    monthly: "Quoted per project",
    alt: "Optional monthly support retainer",
    items: [
      "React, Node and Python applications",
      "Customer portals and booking systems",
      "Workflow automation and AI agents",
      "Database and API integrations",
      "Load and performance testing",
      "AWS and GCP cloud setup",
    ],
  },
];
 
/* For businesses keeping their current site. */
const FIX_OPTIONS = [
  { name: "Quick fix", price: "$300", note: "one time", text: "Broken forms, slow pages, mobile layout problems, a few page updates." },
  { name: "Tune-up", price: "$1,200", note: "one time", text: "Speed and security cleanup, tracking setup, clearer calls to action." },
  { name: "Care plan", price: "$79/mo", note: "month to month, $150 onboarding", text: "Updates, backups, security monitoring, uptime checks and small edits." },
];
 
const STEPS = [
  { name: "Free audit or call", text: "We look at your current site, your goals and your customers. You get a plain-English list of what to fix first." },
  { name: "Plan and design", text: "You approve the page plan and the design before anything is built." },
  { name: "Build and preview", text: "Your site is built on a private preview link, so you can review every page before launch." },
  { name: "Launch and measure", text: "We go live, set up tracking and report what's working each month." },
];
 
const INDUSTRIES = [
  "Home services and trades", "Restaurants and cafes", "Medical and dental", "Law and accounting",
  "Retail and boutiques", "Business centers and coworking", "Real estate", "Industrial and oilfield services",
];
 
const FIT = [
  "Your current site looks dated or breaks on phones",
  "People visit your site but don't call or book",
  "You want to know which pages and ads actually bring in customers",
  "You'd rather pay a predictable monthly price than a large upfront bill",
];
 
const FAQ = [
  { q: "Who owns the website?", a: "You own your domain and your content. On a monthly plan, the site's design and code transfer to you once the 12-month minimum is complete, or earlier with a one-time buyout." },
  { q: "How long does a site take?", a: "A Launch site usually takes 2 to 4 weeks once your content is ready. Grow and Custom projects are scheduled after the first call." },
  { q: "What if I already have a website?", a: "Start with the free audit. You'll get a fixed price for the fixes it finds, and you keep full ownership of your site. If you later decide to rebuild within 60 days, what you paid for fixes is credited toward a Launch or Grow site." },
  { q: "Do I need a contract for the care plan?", a: "No long-term contract. The care plan runs month to month after a one-time $150 onboarding fee, and you can cancel with 30 days' notice. You'll still sign a short service agreement covering what's included." },
  { q: "Can you work with WordPress?", a: "Yes. GRDEV builds and maintains WordPress sites as well as custom React sites, depending on what fits your business." },
  { q: "Is there a contract?", a: "Launch and Grow plans have a 12-month minimum, then continue month to month. One-time projects and fixes are paid half up front and half on completion." },
];
 
const SERVICES = [
  {
    name: "Design",
    line: "Interfaces and landing pages shaped around what your customers need to do.",
    items: ["UI and UX design", "Landing pages", "Brand-matched site systems", "Mobile-first layouts"],
  },
  {
    name: "Build",
    line: "Full stack development with tools that stay maintainable after launch.",
    items: ["React and React Native", "Node, Express, Python APIs", "PostgreSQL and MySQL", "WordPress builds and migrations"],
  },
  {
    name: "Measure",
    line: "Analytics, experiments and load testing, so decisions come from data.",
    items: ["Google Analytics and Tag Manager", "A/B testing", "Performance and load testing", "Conversion tracking"],
  },
  {
    name: "Automate",
    line: "Workflows and assistants that take repeat work off your team.",
    items: ["Zapier workflows", "AI help bots", "Agent integrations", "Cloud setup on AWS and GCP"],
  },
];
 
const WORK = [
  {
    id: "carcovers",
    name: "CarCovers.com",
    kind: "client",
    role: "A/B testing, while at Gretrix",
    years: "2021–2022",
    image: "", // add a screenshot path, e.g. "/work/carcovers.png"
    summary: "As a Gretrix developer, ran A/B tests on this e-commerce storefront with Google Optimize, Tag Manager and Analytics.",
    outcome: "About a 1% lift in conversion rate.",
    stack: ["Google Analytics", "Tag Manager", "Optimize"],
  },
  {
    id: "lookfar",
    name: "Look Far Labs",
    kind: "client",
    role: "React development, while at Gretrix",
    years: "2021–2022",
    image: "",
    summary: "As a Gretrix developer, built front-end features in React for this client's project.",
    outcome: "Shipped production React components.",
    stack: ["React", "JavaScript"],
  },
  {
    id: "ascend",
    name: "Ascend SC",
    kind: "employer",
    role: "Full stack developer",
    years: "2023–2026",
    summary: "Built front and back end features on a PERN-stack supply chain platform for an oil and gas client, and led performance, load and automation testing across the API, database, web and mobile app.",
    outcome: "Owned the full performance testing program across four layers of the stack.",
    stack: ["PostgreSQL", "Express", "React", "Node", "JMeter", "Taurus", "Selenium", "Robot Framework"],
  },
  {
    id: "halliburton",
    name: "Halliburton",
    kind: "employer",
    role: "Software developer, contract",
    years: "2022",
    summary: "Maintained a legacy JavaScript codebase, wrote data migration scripts and worked on authentication flows.",
    outcome: "Migrations and auth work in an enterprise environment.",
    stack: ["JavaScript", "SQL"],
  },
  {
    id: "gretrix",
    name: "Gretrix",
    kind: "employer",
    role: "Lead full stack developer",
    years: "2021–2022",
    summary: "Led three junior developers, built web scrapers, WordPress sites and Zapier automations for agency clients.",
    outcome: "Led a team of three on client delivery.",
    stack: ["Python", "WordPress", "AWS", "GCP", "Zapier"],
  },
  {
    id: "prt",
    name: "PRT-Solutions",
    kind: "employer",
    role: "Full stack engineer",
    years: "2020–2021",
    summary: "Built a Python and Flask API layer serving a React Native mobile app.",
    outcome: "API and mobile client delivered together.",
    stack: ["React Native", "Flask", "SQL"],
  },
  {
    id: "agents",
    name: "AI agent toolkit",
    kind: "project",
    role: "Independent build",
    years: "In progress",
    summary: "Building AI agents through a structured sprint process, aimed at help bots for small business sites.",
    outcome: "Will power the assistant on this site.",
    stack: ["LLM APIs", "Node", "Python"],
  },
];
 
const FILTERS = [
  { id: "all", label: "All work" },
  { id: "client", label: "Client work" },
  { id: "employer", label: "Companies" },
  { id: "project", label: "Projects" },
];
 
/* =========================================================================
   STYLES
   ========================================================================= */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
 
:root{
  --bg:#EEF0EA; --surface:#E2E6DD; --ink:#1C2433; --muted:#5E6675;
  --line:#C5CBC0; --signal:#2F4BFF; --signal-ink:#FFFFFF; --amber:#E9A82B;
  color-scheme: light;
}
@media (prefers-color-scheme: dark){
  :root{
    --bg:#161B26; --surface:#1F2635; --ink:#E6E9E2; --muted:#9AA2B1;
    --line:#333C4E; --signal:#7D8FFF; --signal-ink:#10141D; --amber:#F2B848;
    color-scheme: dark;
  }
}
.gr *{box-sizing:border-box;margin:0;padding:0}
.gr{background:var(--bg);color:var(--ink);font-family:'IBM Plex Sans',system-ui,sans-serif;
  font-size:17px;line-height:1.6;min-height:100vh}
.gr a{color:inherit}
.gr :focus-visible{outline:3px solid var(--signal);outline-offset:3px;border-radius:2px}
.gr .wrap{max-width:1180px;margin:0 auto;padding:0 28px}
.gr .display{font-family:'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif}
 
/* nav */
.gr nav{position:sticky;top:0;z-index:20;background:var(--bg);border-bottom:1px solid var(--line)}
.gr nav .wrap{display:flex;align-items:center;justify-content:space-between;height:68px}
.gr .logo{font-family:'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif;font-weight:800;font-size:24px;letter-spacing:.04em;
  font-variation-settings:'wdth' 100;text-decoration:none;display:flex;align-items:center;gap:10px}
.gr .logo-mark{display:inline-flex;width:26px;height:26px;border:2px solid var(--ink);border-radius:4px;overflow:hidden}
.gr .logo-mark span{flex:1}
.gr .logo-mark span:last-child{background:var(--signal)}
.gr .navlinks{display:flex;gap:30px;list-style:none;font-size:15px}
.gr .navlinks a{text-decoration:none;color:var(--muted)}
.gr .navlinks a:hover{color:var(--ink)}
.gr .btn{display:inline-flex;align-items:center;gap:8px;background:var(--signal);color:var(--signal-ink);
  border:0;border-radius:999px;padding:12px 22px;font:600 15px 'IBM Plex Sans',system-ui,sans-serif;cursor:pointer;text-decoration:none}
.gr .btn:hover{filter:brightness(1.08)}
.gr .btn:disabled{opacity:.6;cursor:wait}
 
/* hero */
.gr .hero{padding:72px 0 56px;border-bottom:1px solid var(--line)}
.gr .hero-grid{display:grid;grid-template-columns:1fr 280px;gap:48px;align-items:end}
.gr .headline{font-family:'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif;line-height:.95;letter-spacing:-.02em;
  font-size:clamp(52px,9vw,124px);min-height:2.1em;transition:font-variation-settings .6s ease,font-weight .6s ease,letter-spacing .6s ease}
.gr .headline.A{font-weight:800;font-variation-settings:'wdth' 75,'opsz' 96;letter-spacing:.015em;font-size:85px}
.gr .headline.B{font-weight:250;font-variation-settings:'wdth' 100,'opsz' 96;letter-spacing:-.01em;font-size:75px}
.gr .lede{max-width:56ch;color:var(--muted);font-size:19px;margin-top:28px}
.gr .experiment{border:1.5px solid var(--ink);border-radius:14px;padding:20px;background:var(--surface)}
.gr .experiment h2{font:600 15px 'IBM Plex Sans',system-ui,sans-serif;margin-bottom:6px}
.gr .experiment p{font-size:14px;color:var(--muted);line-height:1.5}
.gr .toggle{display:grid;grid-template-columns:1fr 1fr;border:1.5px solid var(--ink);border-radius:999px;
  overflow:hidden;margin:16px 0 12px}
.gr .toggle button{background:transparent;border:0;padding:10px 0;font:600 14px 'IBM Plex Sans',system-ui,sans-serif;color:var(--ink);cursor:pointer}
.gr .toggle button[aria-pressed="true"]{background:var(--ink);color:var(--bg)}
.gr .tally{display:flex;justify-content:space-between;font-size:13px;color:var(--muted)}
.gr .tally b{color:var(--ink);font-weight:600}
.gr .hero-cta{display:flex;gap:18px;align-items:center;margin-top:36px;flex-wrap:wrap}
.gr .textlink{font-weight:600;font-size:15px;text-underline-offset:4px}
 
/* sections */
.gr section.block{padding:96px 0;border-bottom:1px solid var(--line)}
.gr .section-head{display:grid;grid-template-columns:345px 1fr;gap:48px;margin-bottom:48px}
.gr .section-head h2{font-family:'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif;font-weight:700;font-size:40px;line-height:1.05;
  font-variation-settings:'wdth' 85}
.gr .section-head p{color:var(--muted);max-width:60ch;font-size:18px;align-self:end}
 
/* services loop */
.gr .loop{display:grid;grid-template-columns:repeat(4,1fr);border-top:1.5px solid var(--ink)}
.gr .svc{padding:28px 24px 8px 0;position:relative}
.gr .svc + .svc{padding-left:24px;border-left:1px solid var(--line)}
.gr .svc h3{font-family:'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif;font-size:28px;font-weight:600;margin-bottom:10px;
  font-variation-settings:'wdth' 90}
.gr .svc p{color:var(--muted);font-size:15.5px;margin-bottom:16px}
.gr .svc ul{list-style:none;font-size:15px}
.gr .svc li{padding:7px 0;border-top:1px solid var(--line)}
.gr .loop-note{margin-top:28px;font-size:15px;color:var(--muted);display:flex;align-items:center;gap:10px}
.gr .loop-note svg{flex:none}
 
/* work */
.gr .filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:28px}
.gr .filters button{border:1.5px solid var(--line);background:transparent;color:var(--ink);border-radius:999px;
  padding:8px 16px;font:500 14px 'IBM Plex Sans',system-ui,sans-serif;cursor:pointer}
.gr .filters button[aria-pressed="true"]{border-color:var(--ink);background:var(--ink);color:var(--bg)}
.gr .work-list{border-top:1.5px solid var(--ink)}
.gr .work-row{border-bottom:1px solid var(--line)}
.gr .work-row > button{width:100%;display:grid;grid-template-columns:1.4fr 1fr 120px 28px;gap:20px;align-items:baseline;
  background:transparent;border:0;text-align:left;color:var(--ink);padding:22px 0;cursor:pointer;font:inherit}
.gr .work-row .wname{font-family:'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif;font-size:26px;font-weight:600;font-variation-settings:'wdth' 88}
.gr .work-row .wrole{color:var(--muted);font-size:15px}
.gr .work-row .wyears{font-size:14px;color:var(--muted)}
.gr .work-row .plus{font-size:22px;transition:transform .25s ease;justify-self:end}
.gr .work-row.open .plus{transform:rotate(45deg)}
.gr .work-detail{display:grid;grid-template-columns:1.4fr 1fr;gap:20px;padding:0 0 28px}
.gr .work-detail p{max-width:58ch}
.gr .outcome{border-left:3px solid var(--amber);padding-left:14px;font-weight:500}
.gr .chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:14px}
.gr .chip{font-size:13px;border:1px solid var(--line);border-radius:6px;padding:3px 9px;color:var(--muted)}
.gr .kind{font-size:13px;color:var(--signal);font-weight:600;margin-bottom:6px;display:block}
 
/* about */
.gr .about-grid{display:grid;grid-template-columns:280px 1fr;gap:48px}
.gr .about-body p{max-width:62ch;margin-bottom:18px;font-size:18px}
.gr .facts{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:36px;border-top:1.5px solid var(--ink)}
.gr .fact{padding:18px 18px 0 0}
.gr .fact + .fact{padding-left:18px;border-left:1px solid var(--line)}
.gr .fact strong{display:block;font-family:'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif;font-size:22px;font-weight:600}
.gr .fact span{font-size:14px;color:var(--muted)}
 
/* contact */
.gr form{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
.gr label{display:grid;gap:6px;font-size:14px;font-weight:500}
.gr input,.gr select,.gr textarea{font:400 16px 'IBM Plex Sans',system-ui,sans-serif;color:var(--ink);background:var(--surface);
  border:1.5px solid var(--line);border-radius:8px;padding:12px 14px;width:100%}
.gr input:focus,.gr select:focus,.gr textarea:focus{border-color:var(--signal);outline:none}
.gr .full{grid-column:1/-1}
.gr .status{font-size:15px}
.gr .status.err{color:#C2412D}
@media (prefers-color-scheme: dark){.gr .status.err{color:#FF8A75}}
 
/* screenshots in work rows */
.gr .shot{grid-column:1/-1;border:1.5px solid var(--ink);border-radius:10px;overflow:hidden;background:var(--surface)}
.gr .shot-bar{display:flex;gap:6px;padding:8px 10px;border-bottom:1px solid var(--line)}
.gr .shot-bar i{width:9px;height:9px;border-radius:50%;background:var(--line)}
.gr .shot img{display:block;width:100%;height:auto}
 
/* industries */
.gr .industries{display:flex;flex-wrap:wrap;gap:8px;margin-top:40px}
.gr .industries span{border:1.5px solid var(--line);border-radius:999px;padding:7px 14px;font-size:14.5px}
.gr .industries-label{margin-top:56px;font-weight:600;font-size:15px}
 
/* process */
.gr .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;list-style:none;counter-reset:s;border-top:1.5px solid var(--ink)}
.gr .steps li{padding:24px 20px 0 0;counter-increment:s}
.gr .steps li + li{padding-left:20px;border-left:1px solid var(--line)}
.gr .steps li::before{content:counter(s);display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;
  background:var(--ink);color:var(--bg);font:700 15px 'Bricolage Grotesque',system-ui,sans-serif;margin-bottom:14px}
.gr .steps h3{font:600 20px 'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif;margin-bottom:6px}
.gr .steps p{font-size:15.5px;color:var(--muted)}
 
/* pricing */
.gr .plans{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:stretch}
.gr .plan{border:1.5px solid var(--line);border-radius:16px;padding:28px;display:flex;flex-direction:column;background:var(--bg)}
.gr .plan.featured{border:2px solid var(--signal);background:var(--surface);position:relative}
.gr .plan .badge{position:absolute;top:-13px;left:24px;background:var(--signal);color:var(--signal-ink);
  font-size:13px;font-weight:600;padding:4px 12px;border-radius:999px}
.gr .plan h3{font:700 30px 'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif;font-variation-settings:'wdth' 85}
.gr .plan .for{color:var(--muted);font-size:15px;margin:6px 0 20px;min-height:3em}
.gr .price{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.gr .price small{font-size:14px;color:var(--muted)}
.gr .price strong{font:700 40px 'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif;letter-spacing:.01em}
.gr .price .mo{font-size:18px;font-weight:600}
.gr .plan .alt{font-size:14px;color:var(--muted);margin:8px 0 18px;padding-bottom:18px;border-bottom:1px solid var(--line)}
.gr .plan ul{list-style:none;font-size:15px;flex:1;margin-bottom:24px}
.gr .plan li{padding:6px 0 6px 26px;position:relative}
.gr .plan li::before{content:"";position:absolute;left:0;top:13px;width:14px;height:8px;border-left:2.5px solid var(--signal);
  border-bottom:2.5px solid var(--signal);transform:rotate(-45deg)}
.gr .plan .btn{justify-content:center}
.gr .plan:not(.featured) .btn{background:transparent;color:var(--ink);border:1.5px solid var(--ink)}
.gr .founding{margin-top:28px;padding:16px 20px;border-left:3px solid var(--amber);background:var(--surface);
  border-radius:0 10px 10px 0;font-size:16px}
 
/* fix and care */
.gr .fixcare{margin-top:28px;display:grid;grid-template-columns:1fr 1.5fr;gap:40px;padding:32px;
  border:1.5px solid var(--ink);border-radius:16px}
.gr .fixcare h3{font:700 30px 'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif;font-variation-settings:'wdth' 85}
.gr .fixcare-head p{color:var(--muted);font-size:15.5px;margin:8px 0 20px}
.gr .fixcare-list{list-style:none}
.gr .fixcare-list li{display:grid;grid-template-columns:130px 150px 1fr;column-gap:16px;padding:14px 0;border-top:1px solid var(--line);align-items:baseline}
.gr .fixcare-list li:first-child{border-top:0;padding-top:0}
.gr .fc-name{font-weight:600}
.gr .fc-price{font:700 24px 'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif}
.gr .fc-price small{font:400 13px 'IBM Plex Sans',system-ui,sans-serif;color:var(--muted)}
.gr .fc-note{grid-column:3;font-size:13.5px;color:var(--signal);font-weight:600}
.gr .fc-text{grid-column:3;font-size:15px;color:var(--muted)}
.gr .fc-name,.gr .fc-price{grid-row:span 2}
@media (max-width:900px){
  .gr .fixcare{grid-template-columns:1fr;padding:24px}
  .gr .fixcare-list li{grid-template-columns:1fr auto}
  .gr .fc-name,.gr .fc-price{grid-row:auto}
  .gr .fc-note,.gr .fc-text{grid-column:1/-1}
}
 
/* audit banner */
.gr .audit{background:var(--signal);color:var(--signal-ink);padding:88px 0}
.gr .audit-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:56px;align-items:center}
.gr .audit h2{font:800 clamp(40px,5.5vw,68px)/1 'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif;
  font-variation-settings:'wdth' 75;letter-spacing:.01em}
.gr .audit p{margin-top:18px;font-size:18px;max-width:46ch;opacity:.92}
.gr .audit ul{list-style:none;margin-top:18px;display:grid;gap:6px;font-size:16px}
.gr .audit ul li::before{content:"+ ";font-weight:700}
.gr .audit form{grid-template-columns:1fr;max-width:none;background:var(--bg);color:var(--ink);padding:28px;border-radius:16px}
.gr .audit form .btn{width:100%;justify-content:center}
.gr .audit .status{color:var(--ink)}
 
/* fit + faq */
.gr .fit-grid{display:grid;grid-template-columns:1fr 1.3fr;gap:56px}
.gr .fit-grid h3{font:700 26px 'Bricolage Grotesque','Arial Narrow',system-ui,sans-serif;margin-bottom:16px;font-variation-settings:'wdth' 88}
.gr .fit li{list-style:none;padding:12px 0 12px 30px;border-top:1px solid var(--line);position:relative;font-size:16.5px}
.gr .fit li::before{content:"";position:absolute;left:2px;top:20px;width:14px;height:8px;border-left:2.5px solid var(--signal);
  border-bottom:2.5px solid var(--signal);transform:rotate(-45deg)}
.gr details{border-top:1px solid var(--line)}
.gr details:last-child{border-bottom:1px solid var(--line)}
.gr summary{cursor:pointer;padding:16px 0;font-weight:600;font-size:16.5px;list-style:none;display:flex;justify-content:space-between;gap:16px}
.gr summary::-webkit-details-marker{display:none}
.gr summary::after{content:"+";font-size:22px;line-height:1;transition:transform .25s ease}
.gr details[open] summary::after{transform:rotate(45deg)}
.gr details p{padding:0 0 18px;color:var(--muted);max-width:62ch}
.gr .phone{font-weight:600;font-size:15px;text-decoration:none}
 
@media (max-width:900px){
  .gr .plans,.gr .audit-grid,.gr .fit-grid{grid-template-columns:1fr}
  .gr .steps{grid-template-columns:1fr 1fr;row-gap:28px}
  .gr .steps li:nth-child(3){padding-left:0;border-left:0}
}
@media (max-width:640px){
  .gr .steps{grid-template-columns:1fr}
  .gr .steps li + li{padding-left:0;border-left:0}
}
 
/* footer */
.gr footer{padding:40px 0;font-size:14px;color:var(--muted)}
.gr footer .wrap{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
 
/* assistant */
.gr .ask-btn{position:fixed;right:22px;bottom:22px;z-index:30;box-shadow:0 6px 20px rgba(28,36,51,.25)}
.gr .panel{position:fixed;right:22px;bottom:84px;z-index:30;width:min(360px,calc(100vw - 44px));
  background:var(--bg);border:1.5px solid var(--ink);border-radius:14px;display:flex;flex-direction:column;max-height:70vh}
.gr .panel header{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--line);font-weight:600}
.gr .panel header button{background:none;border:0;color:var(--ink);font-size:20px;cursor:pointer}
.gr .msgs{padding:14px 16px;overflow-y:auto;display:grid;gap:10px;font-size:15px}
.gr .msg{padding:10px 12px;border-radius:10px;max-width:88%}
.gr .msg.bot{background:var(--surface)}
.gr .msg.me{background:var(--signal);color:var(--signal-ink);justify-self:end}
.gr .panel form{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line)}
.gr .panel input{padding:10px 12px}
 
@media (max-width:900px){
  .gr .hero-grid,.gr .section-head,.gr .about-grid{grid-template-columns:1fr;gap:24px}
  .gr .loop{grid-template-columns:1fr 1fr}
  .gr .svc:nth-child(3){padding-left:0;border-left:0}
  .gr .work-row > button{grid-template-columns:1fr 28px}
  .gr .work-row .wrole,.gr .work-row .wyears{grid-column:1}
  .gr .work-row .plus{grid-row:1;grid-column:2}
  .gr .work-detail{grid-template-columns:1fr}
}
@media (max-width:640px){
  .gr .navlinks{display:none}
  .gr .loop,.gr .facts,.gr form{grid-template-columns:1fr}
  .gr .svc,.gr .svc + .svc,.gr .fact + .fact{padding-left:0;border-left:0}
  .gr section.block{padding:68px 0}
}
@media (prefers-reduced-motion:reduce){.gr *{transition:none!important;animation:none!important}}
`;
 
/* =========================================================================
   COMPONENTS
   ========================================================================= */
function Nav() {
  return (
    <nav aria-label="Main">
      <div className="wrap">
        <a href="#top" className="logo" aria-label={`${CONFIG.brand} home`}>
          <span className="logo-mark" aria-hidden="true"><span /><span /></span>
          {CONFIG.brand}
        </a>
        <ul className="navlinks">
          <li><a href="#services">Services</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#work">Work</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          {CONFIG.phone && <a className="phone" href={`tel:${CONFIG.phone.replace(/[^\d+]/g, "")}`}>{CONFIG.phone}</a>}
          <a href="#contact" className="btn">Start a project</a>
        </div>
      </div>
    </nav>
  );
}
 
function Hero() {
  const [variant, setVariant] = useState("A");
  const [tally, setTally] = useState({ A: 0, B: 0 });
  const timer = useRef(null);
 
  // Counts a "stay" when a visitor rests on a version for 4 seconds.
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setTally((t) => ({ ...t, [variant]: t[variant] + 1 }));
      api.analytics.track("hero_variant_stay", { variant });
    }, 4000);
    return () => clearTimeout(timer.current);
  }, [variant]);
 
  const pick = (v) => {
    setVariant(v);
    api.analytics.track("hero_variant_switch", { variant: v });
  };
 
  return (
    <header className="hero" id="top">
      <div className="wrap hero-grid">
        <div>
          <h1 className={`headline ${variant}`} aria-live="polite">{HEADLINES[variant].text}</h1>
          <p className="lede">
            GRDEV designs, builds and measures websites for businesses that want more customers from
            their site. One developer, from first sketch to analytics, based in the {CONFIG.location}.
          </p>
          <div className="hero-cta">
            <a href="#contact" className="btn">Start a project</a>
            <a href="#work" className="textlink">See past work</a>
          </div>
        </div>
        <aside className="experiment" aria-label="Headline test">
          <h2>This headline is a live test</h2>
          <p>Switch versions. The one you stay on gets counted, the same way your site's pages would be.</p>
          <div className="toggle" role="group" aria-label="Choose headline version">
            {["A", "B"].map((v) => (
              <button key={v} aria-pressed={variant === v} onClick={() => pick(v)}>
                Version {v}
              </button>
            ))}
          </div>
          <div className="tally">
            <span>Stays on A <b>{tally.A}</b></span>
            <span>Stays on B <b>{tally.B}</b></span>
          </div>
        </aside>
      </div>
    </header>
  );
}
 
function Services() {
  return (
    <section className="block" id="services">
      <div className="wrap">
        <div className="section-head">
          <h2>What GRDEV does</h2>
          <p>Four kinds of work that feed each other. Design sets the goal, the build delivers it, measurement shows what worked, and automation keeps it running.</p>
        </div>
        <div className="loop">
          {SERVICES.map((s) => (
            <div className="svc" key={s.name}>
              <h3>{s.name}</h3>
              <p>{s.line}</p>
              <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="loop-note">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" />
          </svg>
          Results from Measure go back into Design, so the site keeps improving after launch.
        </p>
        <p className="industries-label">Industries served</p>
        <div className="industries">{INDUSTRIES.map((i) => <span key={i}>{i}</span>)}</div>
      </div>
    </section>
  );
}
 
function Work() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);
 
  useEffect(() => { api.work.list().then(setItems).catch(() => setItems(WORK)); }, []);
 
  const shown = filter === "all" ? items : items.filter((w) => w.kind === filter);
  const kindLabel = { client: "Client", employer: "Company", project: "Project" };
 
  return (
    <section className="block" id="work">
      <div className="wrap">
        <div className="section-head">
          <h2>Work and experience</h2>
          <p>Clients served, companies worked for and projects in progress. Open any row for what was done and what came of it.</p>
        </div>
        <div className="filters" role="group" aria-label="Filter work">
          {FILTERS.map((f) => (
            <button key={f.id} aria-pressed={filter === f.id} onClick={() => { setFilter(f.id); setOpen(null); }}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="work-list">
          {shown.map((w) => {
            const isOpen = open === w.id;
            return (
              <div className={`work-row ${isOpen ? "open" : ""}`} key={w.id}>
                <button aria-expanded={isOpen} aria-controls={`wd-${w.id}`} onClick={() => setOpen(isOpen ? null : w.id)}>
                  <span className="wname">{w.name}</span>
                  <span className="wrole">{w.role}</span>
                  <span className="wyears">{w.years}</span>
                  <span className="plus" aria-hidden="true">+</span>
                </button>
                {isOpen && (
                  <div className="work-detail" id={`wd-${w.id}`}>
                    <div>
                      <span className="kind">{kindLabel[w.kind]}</span>
                      <p>{w.summary}</p>
                      <div className="chips">{w.stack.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
                    </div>
                    <p className="outcome">{w.outcome}</p>
                    {w.image && (
                      <figure className="shot">
                        <div className="shot-bar" aria-hidden="true"><i /><i /><i /></div>
                        <img src={w.image} alt={`${w.name} website screenshot`} loading="lazy" />
                      </figure>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
 
function Process() {
  return (
    <section className="block" id="process">
      <div className="wrap">
        <div className="section-head">
          <h2>How a project works</h2>
          <p>Four steps from first conversation to a site that reports its own results. You approve each stage before the next one starts.</p>
        </div>
        <ol className="steps">
          {STEPS.map((s) => <li key={s.name}><h3>{s.name}</h3><p>{s.text}</p></li>)}
        </ol>
      </div>
    </section>
  );
}
 
function Pricing() {
  const choose = (plan) => {
    api.analytics.track("plan_selected", { plan });
    window.dispatchEvent(new CustomEvent("grdev:plan", { detail: plan }));
  };
  return (
    <section className="block" id="pricing">
      <div className="wrap">
        <div className="section-head">
          <h2>Plans and pricing</h2>
          <p>Clear starting prices, so you know where you stand before the first call. Monthly plans have a 12-month minimum, then continue month to month.</p>
        </div>
        <div className="plans">
          {PLANS.map((p) => (
            <article className={`plan ${p.featured ? "featured" : ""}`} key={p.name}>
              {p.featured && <span className="badge">Most popular</span>}
              <h3>{p.name}</h3>
              <p className="for">{p.for}</p>
              <div className="price">
                <small>Starting at</small>
                <strong>{p.setup}</strong>
                {p.name !== "Custom" && <span className="mo">+ {p.monthly}</span>}
              </div>
              <p className="alt">{p.name === "Custom" ? `${p.monthly}. ${p.alt}.` : p.alt}</p>
              <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
              <a href="#contact" className="btn" onClick={() => choose(p.name)}>
                {p.name === "Custom" ? "Request a quote" : `Choose ${p.name}`}
              </a>
            </article>
          ))}
        </div>
        <div className="fixcare">
          <div className="fixcare-head">
            <h3>Already have a website?</h3>
            <p>Keep it and make it work harder. Every fix is quoted at a fixed price after a free audit, and you keep full ownership of your site.</p>
            <a href="#audit" className="btn" onClick={() => api.analytics.track("fixcare_audit_click")}>Get a free audit first</a>
          </div>
          <ul className="fixcare-list">
            {FIX_OPTIONS.map((f) => (
              <li key={f.name}>
                <span className="fc-name">{f.name}</span>
                <span className="fc-price"><small>From</small> {f.price}</span>
                <span className="fc-note">{f.note}</span>
                <span className="fc-text">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="founding">
          <strong>Founding client rate:</strong> the first five GRDEV clients get 20% off setup in exchange for a review and permission to feature their project.
        </p>
      </div>
    </section>
  );
}
 
function Audit() {
  const [form, setForm] = useState({ url: "", email: "" });
  const [state, setState] = useState({ status: "idle", text: "" });
  const submit = async (e) => {
    e.preventDefault();
    if (!form.url.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setState({ status: "error", text: "Add your website address and a valid email to request the audit." });
      return;
    }
    setState({ status: "sending", text: "" });
    try {
      await api.audit.request(form);
      api.analytics.track("audit_requested");
      setState({ status: "sent", text: "Audit requested. Your report arrives within two business days." });
      setForm({ url: "", email: "" });
    } catch {
      setState({ status: "error", text: `The request didn't go through. Email ${CONFIG.contactEmail} instead.` });
    }
  };
  return (
    <section className="audit" id="audit">
      <div className="wrap audit-grid">
        <div>
          <h2>Find out what your website is costing you.</h2>
          <p>Get a free audit of your current site, with a short list of fixes in order of impact. Useful whether you hire GRDEV or not.</p>
          <ul>
            <li>Page speed on phones and desktop</li>
            <li>How easy it is to call, book or buy</li>
            <li>Local search and Google Business Profile check</li>
            <li>Tracking: what you can and can't measure today</li>
          </ul>
        </div>
        <form onSubmit={submit} noValidate>
          <label>Your website<input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="yourbusiness.com" inputMode="url" /></label>
          <label>Email for the report<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></label>
          <button className="btn" type="submit" disabled={state.status === "sending"}>
            {state.status === "sending" ? "Requesting…" : "Get my free audit"}
          </button>
          {state.text && <span className={`status ${state.status === "error" ? "err" : ""}`} role="status">{state.text}</span>}
        </form>
      </div>
    </section>
  );
}
 
function FitFaq() {
  return (
    <section className="block" id="faq">
      <div className="wrap fit-grid">
        <div>
          <h3>You're a good fit if</h3>
          <ul className="fit">{FIT.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
        <div>
          <h3>Before you ask</h3>
          {FAQ.map((f) => (
            <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>
      </div>
    </section>
  );
}
 
function About() {
  return (
    <section className="block" id="about">
      <div className="wrap about-grid">
        <h2 className="display" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.05, fontVariationSettings: "'wdth' 85" }}>
          Who you'll work with
        </h2>
        <div className="about-body">
          <p>
            I'm William Griffin, a full stack developer with six years of experience building software for
            agencies, energy companies and supply chain platforms. I build the whole thing: React and React
            Native interfaces, Node and Python APIs, PostgreSQL and MySQL databases, and the cloud setup they run on.
          </p>
          <p>
            I also automate and test what I build. I've led load and performance testing across APIs, databases,
            web and mobile, written automated test suites, and built workflow automations that save teams hours.
            Your site ships working, fast and ready to grow.
          </p>
          <div className="facts">
            <div className="fact"><strong>Front and back end</strong><span>React, Node, Python, SQL</span></div>
            <div className="fact"><strong>Automation and testing</strong><span>Load, performance, end to end</span></div>
            <div className="fact"><strong>AWS certified</strong><span>Cloud, Docker, deployment</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
 
function Contact() {
  const empty = { name: "", email: "", type: "New website", message: "" };
  const [form, setForm] = useState(empty);
  const [state, setState] = useState({ status: "idle", text: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
 
  useEffect(() => {
    const onPlan = (e) => setForm((f) => ({ ...f, type: `${e.detail} plan` }));
    window.addEventListener("grdev:plan", onPlan);
    return () => window.removeEventListener("grdev:plan", onPlan);
  }, []);
 
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !/^\S+@\S+\.\S+$/.test(form.email) || !form.message) {
      setState({ status: "error", text: "Add your name, a valid email and a short message to send." });
      return;
    }
    setState({ status: "sending", text: "" });
    try {
      await api.contact.submit(form);
      api.analytics.track("contact_submitted", { type: form.type });
      setState({ status: "sent", text: "Project details sent. Expect a reply within one business day." });
      setForm(empty);
    } catch {
      setState({ status: "error", text: `Sending failed. Email ${CONFIG.contactEmail} instead.` });
    }
  };
 
  return (
    <section className="block" id="contact">
      <div className="wrap">
        <div className="section-head">
          <h2>Start a project</h2>
          <p>Tell me what you need. You'll get a reply with next steps and a time to talk.</p>
        </div>
        <form onSubmit={submit} noValidate>
          <label>Name<input value={form.name} onChange={set("name")} autoComplete="name" /></label>
          <label>Email<input type="email" value={form.email} onChange={set("email")} autoComplete="email" /></label>
          <label className="full">What do you need?
            <select value={form.type} onChange={set("type")}>
              <option>Launch plan</option><option>Grow plan</option><option>Custom plan</option>
              <option>Fix my current site</option><option>Care plan for my current site</option>
              <option>New website</option><option>Redesign</option><option>Analytics and testing</option>
              <option>Automation or AI assistant</option><option>Something else</option>
            </select>
          </label>
          <label className="full">Project details<textarea rows={5} value={form.message} onChange={set("message")} /></label>
          <div className="full" style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn" type="submit" disabled={state.status === "sending"}>
              {state.status === "sending" ? "Sending…" : "Send project details"}
            </button>
            {state.text && <span className={`status ${state.status === "error" ? "err" : ""}`} role="status">{state.text}</span>}
          </div>
        </form>
      </div>
    </section>
  );
}
 
function Assistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState([{ from: "bot", text: "Ask about services, timelines or past work." }]);
 
  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const next = [...msgs, { from: "me", text }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const { reply } = await api.assistant.ask(text, next);
      setMsgs((m) => [...m, { from: "bot", text: reply }]);
    } catch {
      setMsgs((m) => [...m, { from: "bot", text: "The assistant couldn't be reached. Use the contact form instead." }]);
    }
    setBusy(false);
  };
 
  return (
    <>
      {open && (
        <div className="panel" role="dialog" aria-label="GRDEV assistant">
          <header>Ask GRDEV<button onClick={() => setOpen(false)} aria-label="Close assistant">×</button></header>
          <div className="msgs" aria-live="polite">
            {msgs.map((m, i) => <div key={i} className={`msg ${m.from}`}>{m.text}</div>)}
            {busy && <div className="msg bot">…</div>}
          </div>
          <form onSubmit={send}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a question" aria-label="Your question" />
            <button className="btn" type="submit" disabled={busy}>Send</button>
          </form>
        </div>
      )}
      <button className="btn ask-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "Close" : "Ask a question"}
      </button>
    </>
  );
}
 
export default function App() {
  return (
    <div className="gr">
      <style>{css}</style>
      <Nav />
      <Hero />
      <main>
        <Services />
        <Process />
        <Pricing />
        <Audit />
        <Work />
        <About />
        <FitFaq />
        <Contact />
      </main>
      <footer>
        <div className="wrap">
          <span>© {new Date().getFullYear()} {CONFIG.brand}. {CONFIG.location}.</span>
          <span>
            {CONFIG.phone && <>{CONFIG.phone} &nbsp;|&nbsp; </>}
            <a href={`mailto:${CONFIG.contactEmail}`}>{CONFIG.contactEmail}</a>
          </span>
        </div>
      </footer>
      <Assistant />
    </div>
  );
}