import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, BookOpen, FilePlus2, Menu, Send, ShieldCheck, X } from "lucide-react";
import identityAsset from "@/assets/a3waf-identity.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hayyan Da Edistein — Team A3WAF" },
      { name: "description", content: "The public identity and journal of Team A3WAF: ethical security research, responsible disclosure, and field notes." },
      { property: "og:title", content: "Hayyan Da Edistein — Team A3WAF" },
      { property: "og:description", content: "Ethical security research and responsible disclosure from Team A3WAF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Article = { date: string; category: string; title: string; summary: string };

const initialArticles: Article[] = [
  { date: "18 / 09 / 26", category: "Disclosure", title: "When a Login Boundary Becomes a Suggestion", summary: "A redacted field report on authorization drift, careful verification, and a disclosure completed without retaining user data." },
  { date: "04 / 08 / 26", category: "Ethics", title: "The Ethics of the Uninvited Guest", summary: "Where gray-hat research must stop, why proof should be minimal, and how awareness can replace spectacle." },
  { date: "21 / 06 / 26", category: "Field Note", title: "No Trophy, No Dataset, No Customer List", summary: "Our plain-language standard for documenting risk while leaving private information untouched." },
];

function Index() {
  const [filter, setFilter] = useState("All");
  const [articles, setArticles] = useState(initialArticles);
  const [editorOpen, setEditorOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleArticles = useMemo(() => filter === "All" ? articles : articles.filter((article) => article.category === filter), [articles, filter]);

  function publishArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const summary = String(data.get("summary") ?? "").trim();
    const category = String(data.get("category") ?? "Field Note");
    if (!title || !summary) return;
    setArticles((current) => [{ date: "18 / 09 / 26", category, title, summary }, ...current]);
    setFilter("All");
    setEditorOpen(false);
    setNotice("Dispatch added to this journal session.");
  }

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReportOpen(false);
    setNotice("Report prepared. Add your secure contact endpoint before going live.");
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-muted">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-5 font-mono text-[10px] uppercase text-muted-foreground">
            <span>Vol. 03 / Issue 14</span><span className="hidden sm:inline">Ed. Hayyan Da Edistein</span>
          </div>
          <button aria-label="Toggle navigation" className="p-2 md:hidden" onClick={() => setMobileOpen((open) => !open)}>{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
          <nav className="hidden items-center gap-6 text-[11px] font-semibold uppercase md:flex">
            <a href="#dispatches" className="transition-colors hover:text-muted-foreground">Dispatches</a>
            <a href="#principles" className="transition-colors hover:text-muted-foreground">Principles</a>
            <button onClick={() => setEditorOpen(true)} className="transition-colors hover:text-muted-foreground">Write</button>
            <button onClick={() => setReportOpen(true)} className="border-b border-foreground pb-1">Report a risk</button>
          </nav>
        </div>
        {mobileOpen && <nav className="grid gap-4 border-t border-border px-5 py-5 text-sm uppercase md:hidden"><a href="#dispatches">Dispatches</a><a href="#principles">Principles</a><button className="text-left" onClick={() => setEditorOpen(true)}>Write a dispatch</button><button className="text-left" onClick={() => setReportOpen(true)}>Report a risk</button></nav>}
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {notice && <div className="mb-8 flex items-center justify-between border border-border bg-accent px-4 py-3 text-sm"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice("")}><X size={16} /></button></div>}

        <section className="grid items-end gap-10 lg:grid-cols-12 lg:gap-12 lg:pb-20">
          <div className="editorial-fade lg:col-span-7">
            <p className="mb-8 font-mono text-[10px] uppercase text-muted-foreground">Public identity / Ethical security researcher</p>
            <div className="border-l-4 border-foreground py-1 pl-5 sm:pl-7">
              <h1 className="font-display text-5xl font-bold leading-[0.9] sm:text-7xl lg:text-8xl">A3WAF</h1>
              <p className="mt-5 max-w-xl font-display text-xl italic text-muted-foreground sm:text-2xl">We Forget Whom We Just Helped.</p>
            </div>
            <div className="mt-9 max-w-lg">
              <h2 className="font-display text-2xl font-bold">Hayyan Da Edistein</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">The public identity of Team A3WAF—an independent collective documenting digital weaknesses to spread awareness, not to steal, retain, or sell data.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#dispatches" className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-xs font-semibold uppercase text-primary-foreground">Latest dispatch <ArrowRight size={14} /></a>
                <button onClick={() => setEditorOpen(true)} className="inline-flex items-center gap-2 border border-border px-5 py-3 text-xs font-semibold uppercase hover:bg-accent"><FilePlus2 size={14} /> Add blog</button>
              </div>
            </div>
          </div>
          <figure className="editorial-fade relative overflow-hidden bg-primary lg:col-span-5" style={{ animationDelay: "160ms" }}>
            <img src={identityAsset.url} alt="Team A3WAF identity artwork" className="aspect-[4/5] w-full object-contain" />
            <figcaption className="absolute inset-x-0 bottom-0 flex justify-between bg-primary/90 px-4 py-3 font-mono text-[9px] uppercase text-primary-foreground"><span>A3WAF identity asset</span><span>Public record / 03</span></figcaption>
          </figure>
        </section>

        <div className="line-reveal my-12 h-px bg-border lg:my-0 lg:mb-12" />
        <section id="dispatches" className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-10 flex flex-col justify-between gap-5 border-b border-border pb-5 sm:flex-row sm:items-end">
              <div><p className="font-mono text-[10px] uppercase text-muted-foreground">Recent findings / Dispatches</p><h2 className="mt-2 font-display text-3xl font-bold">The journal</h2></div>
              <div className="flex flex-wrap gap-1" aria-label="Filter dispatches">{["All", "Disclosure", "Ethics", "Field Note"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`px-3 py-2 text-[10px] font-semibold uppercase ${filter === item ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>{item}</button>)}</div>
            </div>
            <div className="divide-y divide-border">
              {visibleArticles.map((article, index) => <article key={`${article.title}-${index}`} className="group grid gap-5 py-8 sm:grid-cols-[88px_1fr]">
                <div className="font-mono text-[10px] text-muted-foreground"><div>{article.date}</div><div className="mt-2 uppercase">{article.category}</div></div>
                <div><h3 className="max-w-2xl font-display text-2xl font-bold leading-snug transition-colors group-hover:text-muted-foreground sm:text-3xl">{article.title}</h3><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{article.summary}</p><button className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase">Open dispatch <ArrowRight size={13} /></button></div>
              </article>)}
            </div>
          </div>

          <aside id="principles" className="border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="mb-7 font-mono text-[10px] uppercase text-muted-foreground">Operating standard</p>
            <div className="bg-primary p-5 text-primary-foreground"><ShieldCheck size={21} /><h3 className="mt-5 font-display text-xl font-bold">Responsible disclosure first.</h3><p className="mt-3 text-xs leading-6 opacity-80">No data theft. No sale. No public detail that creates fresh risk. Evidence is minimized and owners get time to repair.</p><button onClick={() => setReportOpen(true)} className="mt-5 inline-flex items-center gap-2 border-b border-primary-foreground/40 pb-1 text-[10px] font-semibold uppercase">Open reporting channel <Send size={12} /></button></div>
            <div className="mt-7 divide-y divide-border">{["Collect the minimum proof.", "Protect people before reputation.", "Publish only after risk is reduced.", "Leave awareness, not damage."].map((text, index) => <div key={text} className="grid grid-cols-[42px_1fr] py-5"><span className="font-mono text-[9px] text-muted-foreground">0{index + 1}</span><p className="text-sm font-medium">{text}</p></div>)News>)}</div>
          </aside>
        </section>

        <footer className="mt-20 grid gap-10 border-t border-border py-12 sm:grid-cols-2 lg:grid-cols-4"><div className="sm:col-span-2"><p className="font-display text-4xl font-bold text-muted">A3WAF</p><p className="mt-4 max-w-md text-xs leading-6 text-muted-foreground">Independent security observations presented for education, prevention, and responsible repair.</p></div><div><p className="font-mono text-[9px] uppercase text-muted-foreground">Identity</p><p className="mt-4 text-sm font-semibold">Hayyan Da Edistein</p><p className="mt-1 text-xs text-muted-foreground">Public representative</p></div><div><p className="font-mono text-[9px] uppercase text-muted-foreground">Editorial desk</p><button onClick={() => setEditorOpen(true)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"><BookOpen size={15} /> New dispatch</button></div></footer>
      </main>

      {editorOpen && <Modal title="Add a dispatch" onClose={() => setEditorOpen(false)}><form onSubmit={publishArticle} className="space-y-5"><Field label="Headline"><input name="title" required className="w-full border border-input bg-background px-3 py-3 text-sm outline-none focus:border-ring" placeholder="A clear, factual title" /></Field><Field label="Category"><select name="category" className="w-full border border-input bg-background px-3 py-3 text-sm"><option>Disclosure</option><option>Ethics</option><option>Field Note</option></select></Field><Field label="Summary"><textarea name="summary" required rows={5} className="w-full resize-none border border-input bg-background px-3 py-3 text-sm outline-none focus:border-ring" placeholder="What happened, what was protected, and what readers can learn." /></Field><button type="submit" className="w-full bg-primary px-5 py-3 text-xs font-semibold uppercase text-primary-foreground">Publish to journal</button></form></Modal>}
      {reportOpen && <Modal title="Report a security risk" onClose={() => setReportOpen(false)}><form onSubmit={submitReport} className="space-y-5"><p className="text-sm leading-6 text-muted-foreground">Share only what is necessary to identify the affected system. Do not include personal data or live credentials.</p><Field label="Affected system"><input required className="w-full border border-input bg-background px-3 py-3 text-sm outline-none focus:border-ring" /></Field><Field label="Risk summary"><textarea required rows={5} className="w-full resize-none border border-input bg-background px-3 py-3 text-sm outline-none focus:border-ring" /></Field><button type="submit" className="w-full bg-primary px-5 py-3 text-xs font-semibold uppercase text-primary-foreground">Prepare report</button></form></Modal>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block font-mono text-[9px] uppercase text-muted-foreground">{label}</span>{children}</label>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" role="dialog" aria-modal="true" aria-label={title}><div className="w-full max-w-lg border border-border bg-background p-6 shadow-2xl sm:p-8"><div className="mb-7 flex items-center justify-between"><h2 className="font-display text-2xl font-bold">{title}</h2><button aria-label="Close" onClick={onClose} className="p-2 hover:bg-accent"><X size={18} /></button></div>{children}</div></div>;
}
