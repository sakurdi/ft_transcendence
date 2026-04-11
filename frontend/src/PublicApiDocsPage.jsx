import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./components/Button";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "base-url", title: "Base URL" },
  { id: "auth", title: "Authentication" },
  { id: "rate-limiting", title: "Rate Limiting" },
  { id: "endpoints", title: "Endpoint Reference", sub: [
    { id: "list-boards", title: "List Boards" },
    { id: "get-board", title: "Get Board Details" },
    { id: "get-threads", title: "Get Board Threads" },
    { id: "get-replies", title: "Get Post Replies" },
    { id: "create-post", title: "Create Post" },
    { id: "update-post", title: "Update Post" },
    { id: "delete-post", title: "Delete Post" },
  ]},
  { id: "testing-guide", title: "Exhaustive Testing", sub: [
    { id: "test-auth", title: "Auth Gatekeeping" },
    { id: "test-discovery", title: "Discovery Flow" },
    { id: "test-lifecycle", title: "Post Lifecycle (CRUD)" },
    { id: "test-boundaries", title: "Security Boundaries" },
  ]},
  { id: "errors", title: "Error Catalog" },
];

const CodeBlock = ({ code, language = "bash", label }) => (
  <div className="relative group my-6">
    {label && (
      <div className="absolute top-0 right-6 -translate-y-1/2 bg-surface-800 text-surface-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-surface-700 z-10">
        {label}
      </div>
    )}
    <pre className="relative bg-surface-900 text-surface-50 p-6 rounded-2xl overflow-x-auto font-mono text-sm shadow-soft ring-1 ring-white/5">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  </div>
);

const SectionHeader = ({ id, number, title }) => (
  <h2 id={id} className="text-2xl font-black text-surface-900 mb-6 flex items-center gap-3 uppercase tracking-tight scroll-mt-24">
    <span className="w-10 h-10 rounded-2xl bg-surface-900 text-white flex items-center justify-center text-sm font-mono">{number}</span>
    {title}
  </h2>
);

export default function PublicApiDocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Exhaustive Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8 h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar">
              <nav className="space-y-1">
                {sections.map((s) => (
                  <div key={s.id} className="mb-2">
                    <button
                      onClick={() => scrollTo(s.id)}
                      className={`w-full text-left px-3 py-2 text-sm font-bold rounded-xl transition-all ${
                        activeSection === s.id 
                          ? "bg-brand-600 text-white shadow-md shadow-brand-200" 
                          : "text-surface-500 hover:text-surface-900 hover:bg-surface-50"
                      }`}
                    >
                      {s.title}
                    </button>
                    {s.sub && (
                      <div className="ml-4 mt-2 space-y-1 border-l-2 border-surface-100 pl-4">
                        {s.sub.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => scrollTo(sub.id)}
                            className={`w-full text-left py-1.5 text-xs transition-colors ${
                              activeSection === sub.id 
                                ? "text-brand-600 font-black" 
                                : "text-surface-400 hover:text-surface-700 font-medium"
                            }`}
                          >
                            {sub.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-1">Developer Support</p>
                <p className="text-xs text-brand-800 leading-relaxed">Integration issues? Open a ticket in the community board.</p>
              </div>
            </div>
          </aside>

          {/* Main Exhaustive Content */}
          <main className="flex-1 max-w-3xl pb-24">
            <header className="mb-16">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-100 text-brand-700 border border-brand-200 shadow-sm">
                  v1.0 Stable
                </span>
                <span className="text-surface-300">•</span>
                <span className="text-xs text-surface-400 font-bold">Updated April 2026</span>
              </div>
              <h1 id="overview" className="text-5xl font-black text-surface-900 tracking-tight mb-6 italic">Developer Portal</h1>
              <p className="text-xl text-surface-500 leading-relaxed font-medium">
                The FT_TRANSCENDENCE Public API provides a robust set of RESTful endpoints allowing external applications to tap into our community engine.
              </p>
            </header>

            <section className="space-y-24">
              
              {/* 01 Base URL */}
              <div>
                <SectionHeader id="base-url" number="01" title="Connectivity" />
                <p className="text-surface-600 mb-6 leading-relaxed">
                  All requests must be made over <span className="font-bold text-surface-900 underline decoration-brand-400">HTTPS</span>. Unencrypted HTTP requests will be automatically upgraded or rejected.
                </p>
                <div className="bg-surface-50 border border-surface-200 rounded-2xl p-6 font-mono text-brand-700 text-sm flex items-center justify-between shadow-inner">
                  <span>https://localhost:1043/api/public/v1</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/40"></div>
                  </div>
                </div>
              </div>

              {/* 02 Auth */}
              <div>
                <SectionHeader id="auth" number="02" title="Authentication" />
                <p className="text-surface-600 mb-6">
                  Platform security is enforced via API Keys. Keys are unique to your account and carry your specific permissions.
                </p>
                <div className="bg-surface-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-brand-400 font-black text-xs uppercase tracking-[0.2em] mb-4">Required Header</p>
                    <code className="text-xl font-bold block mb-6">X-API-Key: [YOUR_TOKEN]</code>
                    <p className="text-surface-400 text-sm leading-relaxed">
                      Generate your token in the <Link to="/user/me" className="text-white underline hover:text-brand-300 transition-colors">API Management</Link> section of your profile.
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl"></div>
                </div>
              </div>

              {/* 03 Rate Limiting */}
              <div>
                <SectionHeader id="rate-limiting" number="03" title="Rate Limiting" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-8 bg-surface-50 rounded-[2rem] border border-surface-200">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-2">Steady State</p>
                    <p className="text-4xl font-black text-surface-900 mb-1">60</p>
                    <p className="text-xs font-bold text-surface-500 uppercase">Requests per minute</p>
                  </div>
                  <div className="p-8 bg-surface-50 rounded-[2rem] border border-surface-200">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-2">Burst Buffer</p>
                    <p className="text-4xl font-black text-surface-900 mb-1">20</p>
                    <p className="text-xs font-bold text-surface-500 uppercase">Concurrent requests</p>
                  </div>
                </div>
              </div>

              {/* 04 Endpoints */}
              <div id="endpoints" className="scroll-mt-24 pt-12 border-t border-surface-100">
                <SectionHeader id="endpoints-ref" number="04" title="Endpoints" />
                
                <div className="space-y-20">
                  <div id="list-boards" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black border border-green-200 uppercase">GET</span>
                      <h3 className="text-xl font-black text-surface-900">List Boards</h3>
                    </div>
                    <p className="text-surface-600 mb-4 text-sm font-medium">Fetch all active community boards available on the platform.</p>
                    <CodeBlock label="Request" code={`curl -X GET "$BASE_URL/boards" -H "X-API-Key: $KEY"`} />
                  </div>

                  <div id="get-board" className="scroll-mt-24 border-t border-surface-50 pt-12">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black border border-green-200 uppercase">GET</span>
                      <h3 className="text-xl font-black text-surface-900">Board Details</h3>
                    </div>
                    <code className="text-xs font-bold text-brand-600 mb-4 block">/boards/{'{boardName}'}</code>
                    <CodeBlock label="Response Sample" language="json" code={`{
  "success": true,
  "data": { "id": 1, "name": "General", "description": "..." }
}`} />
                  </div>

                  <div id="create-post" className="scroll-mt-24 border-t border-surface-50 pt-12">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black border border-blue-200 uppercase">POST</span>
                      <h3 className="text-xl font-black text-surface-900">Create Thread</h3>
                    </div>
                    <p className="text-surface-600 mb-6 text-sm">Launch a new discussion thread in a specific board context.</p>
                    <CodeBlock label="Body Schema" language="json" code={`{
  "title": "Discussion Title",
  "content": "Original post content..."
}`} />
                  </div>
                </div>
              </div>

              {/* 05 Exhaustive Testing Guide */}
              <div id="testing-guide" className="scroll-mt-24 pt-12 border-t border-surface-100">
                <SectionHeader id="testing-header" number="05" title="Testing Guide" />
                <p className="text-surface-500 mb-12 font-medium">Follow these exact commands to verify your integration against our security and logic boundaries.</p>

                <div className="space-y-12">
                  <div id="test-auth" className="scroll-mt-24 p-8 bg-surface-50 rounded-[2.5rem] border border-surface-200">
                    <h4 className="text-lg font-black text-surface-900 mb-4">Gatekeeping Verification</h4>
                    <p className="text-sm text-surface-500 mb-6">Confirm that unauthorized access is correctly blocked by the platform.</p>
                    <CodeBlock label="Missing Key Test" code={`curl -i -X GET "https://localhost:1043/api/public/v1/boards"`} />
                    <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mt-4 italic">Expected: 401 Unauthorized</p>
                  </div>

                  <div id="test-lifecycle" className="scroll-mt-24 p-8 bg-brand-50 rounded-[2.5rem] border border-brand-100">
                    <h4 className="text-lg font-black text-brand-900 mb-4">Post Lifecycle (CRUD)</h4>
                    <p className="text-sm text-brand-800/70 mb-6">Test the full resource lifecycle from creation to hard deletion.</p>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-brand-200">
                        <p className="text-[10px] font-black text-brand-400 uppercase mb-2">Step 1: Create</p>
                        <code className="text-xs text-brand-900 font-mono break-all">POST /boards/1/posts -d '{"{...}"}'</code>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-brand-200">
                        <p className="text-[10px] font-black text-brand-400 uppercase mb-2">Step 2: Update</p>
                        <code className="text-xs text-brand-900 font-mono break-all">PUT /posts/[ID] -d '{"{"} "content": "revised" {"}"}'</code>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-brand-200">
                        <p className="text-[10px] font-black text-brand-400 uppercase mb-2">Step 3: Delete</p>
                        <code className="text-xs text-brand-900 font-mono break-all">DELETE /posts/[ID]</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 06 Error Catalog */}
              <div id="errors" className="scroll-mt-24 pt-12 border-t border-surface-100">
                <SectionHeader id="error-ref" number="06" title="Error Catalog" />
                <div className="bg-surface-900 rounded-[2.5rem] overflow-hidden border border-surface-800 shadow-soft-lg">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-white/5 border-b border-surface-800">
                        <th className="px-8 py-5 font-black text-surface-300 uppercase tracking-widest">Code</th>
                        <th className="px-8 py-5 font-black text-surface-300 uppercase tracking-widest">Logic</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-800 text-surface-400">
                      <tr><td className="px-8 py-5 font-mono text-brand-400 font-bold">400</td><td className="px-8 py-5 italic">Bad Request — Validation failed or payload exceeds 64KB.</td></tr>
                      <tr><td className="px-8 py-5 font-mono text-red-400 font-bold">403</td><td className="px-8 py-5 italic">Forbidden — Resource exists but you lack ownership rights.</td></tr>
                      <tr><td className="px-8 py-5 font-mono text-amber-400 font-bold">429</td><td className="px-8 py-5 italic">Rate Limit — Cooldown required. Check headers for reset time.</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
