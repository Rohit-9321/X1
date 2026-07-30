import { Link } from 'react-router-dom';
import { CheckCircle, Code2, BrainCircuit, Trophy, BarChart2, Users, Star } from 'lucide-react';

const companies = [
  { name:'TCS',       color:'#2D6BE4', abbr:'TCS' },
  { name:'Infosys',   color:'#007CC2', abbr:'INF' },
  { name:'Accenture', color:'#A100FF', abbr:'ACC' },
  { name:'Wipro',     color:'#5C068C', abbr:'WIP' },
  { name:'Amazon',    color:'#FF9900', abbr:'AMZ' },
  { name:'Google',    color:'#4285F4', abbr:'GGL' },
  { name:'Microsoft', color:'#00A4EF', abbr:'MSF' },
  { name:'Cognizant', color:'#0033A1', abbr:'COG' },
];

const features = [
  { icon: Users,       title:'Company Wise Prep',    desc:'Tracks tailored to TCS, Infosys, Amazon and more' },
  { icon: Code2,       title:'Coding Platform',      desc:'LeetCode-style editor with Judge0 execution engine' },
  { icon: Trophy,      title:'Mock Tests',           desc:'Company-pattern tests with detailed analysis' },
  { icon: BrainCircuit,title:'AI Study Planner',     desc:'Personalised week-by-week plan from Groq' },
  { icon: BarChart2,   title:'Progress Analytics',   desc:'Skill radar, placement score & weak-topic alerts' },
  { icon: Star,        title:'Interview Prep',       desc:'HR + technical Q&A curated per company' },
];

const plans = [
  { name:'Free',     price:'₹0',    period:'forever',   features:['Limited questions','Basic dashboard','1 mock test/week'], cta:'Get Started', href:'/signup', highlight:false },
  { name:'Single Pack', price:'₹299', period:'per company', features:['Full topic bank','Previous year Qs','Company mocks','Interview prep'], cta:'Buy Pack', href:'/pricing', highlight:false },
  { name:'3-Company Bundle', price:'₹999', period:'any 3 companies', features:['All 3 company packs','Cross-company analytics','All mock tests','Interview prep'], cta:'Get Bundle', href:'/pricing', highlight:true },
  { name:'Premium', price:'₹1,999', period:'all companies', features:['All 12+ companies','AI Career Coach','Coding platform','AI mock interviews','Advanced analytics'], cta:'Go Premium', href:'/pricing', highlight:false },
];

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="font-display text-2xl font-black text-ink">X<span className="text-primary">1</span></span>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link to="/companies" className="hover:text-primary">Companies</Link>
          <Link to="/pricing" className="hover:text-primary">Pricing</Link>
          <a href="#features" className="hover:text-primary">Features</a>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-ghost text-sm py-2">Login</Link>
          <Link to="/signup" className="btn-primary text-sm py-2">Start Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center bg-gradient-to-b from-surface to-white max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/8 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-xs font-bold mb-6">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          40,000+ students placed in 2024
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-black text-ink leading-tight tracking-tight mb-6">
          Prepare for <span className="text-primary">TCS, Infosys,</span><br />Accenture & more
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          X1 structures your entire preparation around the exact company you're targeting — not generic topics that lead nowhere.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/signup" className="btn-primary text-base px-8 py-3.5 rounded-xl">Start Learning Free →</Link>
          <Link to="/pricing" className="btn-ghost text-base px-8 py-3.5 rounded-xl">View Plans</Link>
        </div>
        <div className="flex gap-12 justify-center mt-16 flex-wrap">
          {[['12+','Company Tracks'],['8,400+','Practice Questions'],['94%','Selection Rate'],['₹199','Starting Price']].map(([n,l]) => (
            <div key={l} className="text-center">
              <div className="font-display text-3xl font-black text-ink">{n}</div>
              <div className="text-xs text-gray-500 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Company logos */}
      <section className="py-16 bg-surface">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs font-bold tracking-widest uppercase text-gray-400 mb-10">Preparation tracks for India's top companies</p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {companies.map(c => (
              <div key={c.name} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xs font-black" style={{background:c.color}}>{c.abbr}</div>
                <span className="text-xs text-gray-500">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="text-xs font-bold tracking-widest uppercase text-primary mb-3">Platform Features</div>
          <h2 className="font-display text-4xl font-black text-ink tracking-tight">Everything you need to get placed</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:border-primary/30 transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon size={20} className="text-primary" />
              </div>
              <h3 className="font-bold text-base mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-surface">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest uppercase text-primary mb-3">Pricing</div>
            <h2 className="font-display text-4xl font-black text-ink tracking-tight">Pay for the company you want</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {plans.map(p => (
              <div key={p.name} className={`rounded-2xl p-6 border-2 ${p.highlight ? 'bg-ink border-ink text-white' : 'bg-white border-gray-100'} relative`}>
                {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Best Value</div>}
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${p.highlight?'text-gray-400':'text-gray-400'}`}>{p.name}</div>
                <div className={`font-display text-3xl font-black mb-0.5 ${p.highlight?'text-white':'text-ink'}`}>{p.price}</div>
                <div className={`text-xs mb-5 ${p.highlight?'text-gray-400':'text-gray-400'}`}>{p.period}</div>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-xs ${p.highlight?'text-gray-300':'text-gray-600'}`}>
                      <CheckCircle size={13} className={p.highlight?'text-accent-500':'text-primary'} />{f}
                    </li>
                  ))}
                </ul>
                <Link to={p.href} className={`block text-center py-2.5 rounded-xl text-sm font-bold transition-all ${p.highlight?'bg-primary text-white hover:bg-primary-600':'border border-gray-200 text-ink hover:border-primary hover:text-primary'}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ink text-white text-center px-6">
        <h2 className="font-display text-4xl font-black mb-4 tracking-tight">Ready to get placed?</h2>
        <p className="text-gray-400 mb-8">Join 40,000+ students already preparing on X1</p>
        <Link to="/signup" className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary-600 transition-all inline-block">Create Free Account →</Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 px-6 py-10 text-center text-sm">
        <div className="font-display text-xl font-black text-white mb-2">X<span className="text-primary">1</span></div>
        <p>© 2025 X1 Platform. Built for India's placement warriors.</p>
      </footer>
    </div>
  );
}
