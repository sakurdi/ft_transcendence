import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./components/Button";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "base-url", title: "Base URL" },
  { id: "auth", title: "Authentication" },
  { id: "rate-limiting", title: "Rate Limiting" },
  { id: "endpoints", title: "Endpoints", sub: [
    { id: "list-boards", title: "List Boards" },
    { id: "get-board", title: "Get Board Details" },
    { id: "get-threads", title: "Get Board Threads" },
    { id: "get-replies", title: "Get Post Replies" },
    { id: "create-post", title: "Create Post" },
    { id: "update-post", title: "Update Post" },
    { id: "delete-post", title: "Delete Post" },
  ]},
  { id: "errors", title: "Error Codes" },
];

const CodeBlock = ({ code, language = "bash" }) => (
  <div className="relative group my-6">
    <div className="absolute -inset-y-2 -inset-x-4 bg-brand-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <pre className="relative bg-surface-900 text-surface-50 p-6 rounded-2xl overflow-x-auto font-mono text-sm shadow-soft">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  </div>
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
          
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <nav className="space-y-1">
                {sections.map((s) => (
                  <div key={s.id}>
                    <button
                      onClick={() => scrollTo(s.id)}
                      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === s.id 
                          ? "bg-brand-50 text-brand-700" 
                          : "text-surface-500 hover:text-surface-900 hover:bg-surface-50"
                      }`}
                    >
                      {s.title}
                    </button>
                    {s.sub && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-surface-100 pl-4">
                        {s.sub.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => scrollTo(sub.id)}
                            className={`w-full text-left py-1 text-xs transition-colors ${
                              activeSection === sub.id 
                                ? "text-brand-600 font-bold" 
                                : "text-surface-400 hover:text-surface-700"
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
              
              <div className="p-4 bg-surface-50 rounded-2xl border border-surface-100">
                <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-2">Need help?</p>
                <p className="text-xs text-surface-500 leading-relaxed mb-4">Can't find what you're looking for?</p>
                <Button variant="outline" size="sm" className="w-full">Contact Support</Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl pb-24">
            <header className="mb-16">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-100 text-brand-700 border border-brand-200">
                  Public API v1.0
                </span>
                <span className="text-surface-300">•</span>
                <span className="text-xs text-surface-400 font-medium">Updated 2 days ago</span>
              </div>
              <h1 id="overview" className="text-5xl font-black text-surface-900 tracking-tight mb-6">Documentation</h1>
              <p className="text-xl text-surface-500 leading-relaxed">
                Build powerful integrations with the FT_TRANSCENDENCE platform. Our REST API allows you to programmatically interact with boards, threads, and community data.
              </p>
            </header>

            <section id="base-url" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-surface-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-sm">1</span>
                Base URL
              </h2>
              <p className="text-surface-600 mb-6">All API requests should be made to the following base URL:</p>
              <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 font-mono text-brand-700 text-sm">
                https://localhost:1043/api/public/v1
              </div>
            </section>

            <section id="auth" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-surface-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-sm">2</span>
                Authentication
              </h2>
              <p className="text-surface-600 mb-4">
                Authentication is handled via API keys. You can manage your keys in your <Link to="/user/me" className="text-brand-600 font-bold hover:underline">Profile Settings</Link>.
              </p>
              <p className="text-surface-600 mb-6">
                Include your API key in the <code className="bg-surface-100 px-1.5 py-0.5 rounded text-brand-700 font-bold text-sm">X-API-Key</code> header for every request.
              </p>
              <CodeBlock code={`curl -X GET "https://localhost:1043/api/public/v1/boards" \\
     -H "X-API-Key: YOUR_API_KEY"`} />
            </section>

            <section id="rate-limiting" className="mb-16 scroll-mt-24">
              <h2 className="text-2xl font-bold text-surface-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-sm">3</span>
                Rate Limiting
              </h2>
              <p className="text-surface-600 mb-6">
                To ensure platform stability, we enforce rate limits on all public endpoints.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-6 bg-surface-50 rounded-2xl border border-surface-100">
                  <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">Standard Limit</p>
                  <p className="text-2xl font-black text-surface-900">60 <span className="text-sm font-medium text-surface-500">req / min</span></p>
                </div>
                <div className="p-6 bg-surface-50 rounded-2xl border border-surface-100">
                  <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">Burst Capacity</p>
                  <p className="text-2xl font-black text-surface-900">20 <span className="text-sm font-medium text-surface-500">requests</span></p>
                </div>
              </div>
              <p className="text-sm text-surface-500 italic">
                Exceeding these limits will return a <code className="text-red-500 font-bold">429 Too Many Requests</code> response.
              </p>
            </section>

            <section id="endpoints" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-black text-surface-900 mb-8 pt-8 border-t border-surface-100">Endpoints</h2>
              
              <div id="list-boards" className="mb-12 scroll-mt-24">
                <h3 className="text-xl font-bold text-surface-900 mb-2">List Boards</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">GET</span>
                  <code className="text-sm font-bold text-surface-500">/boards</code>
                </div>
                <p className="text-surface-600 mb-4">Returns a comprehensive list of all active communities on the platform.</p>
                <CodeBlock language="json" code={`{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "General",
      "description": "Public discussion board",
      "owner_id": 1,
      "created_at": "2026-04-06T12:00:00Z"
    }
  ]
}`} />
              </div>

              <div id="create-post" className="mb-12 scroll-mt-24 border-t border-surface-50 pt-12">
                <h3 className="text-xl font-bold text-surface-900 mb-2">Create Post</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">POST</span>
                  <code className="text-sm font-bold text-surface-500">/boards/{'{boardID}'}/posts</code>
                </div>
                <p className="text-surface-600 mb-4">Start a new thread within a specific board.</p>
                <CodeBlock language="json" code={`// Request Body
{
  "title": "A New Beginning",
  "content": "Building with the API is easy!"
}`} />
              </div>
            </section>

            <section id="errors" className="mb-16 scroll-mt-24 border-t border-surface-100 pt-12">
              <h2 className="text-2xl font-bold text-surface-900 mb-6">Error Codes</h2>
              <div className="bg-surface-50 rounded-2xl border border-surface-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-surface-200 bg-surface-100/50">
                      <th className="px-6 py-4 font-bold text-surface-900">Code</th>
                      <th className="px-6 py-4 font-bold text-surface-900">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200">
                    <tr>
                      <td className="px-6 py-4 font-mono text-brand-600 font-bold">400</td>
                      <td className="px-6 py-4 text-surface-600">Bad Request — Missing required fields or invalid data.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-mono text-brand-600 font-bold">401</td>
                      <td className="px-6 py-4 text-surface-600">Unauthorized — Invalid or missing API Key.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-mono text-brand-600 font-bold">429</td>
                      <td className="px-6 py-4 text-surface-600">Too Many Requests — Rate limit exceeded.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
