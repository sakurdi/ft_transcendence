import { Link } from "react-router-dom";
import useAuth from "./User/AuthProvider";
import { ButtonLink } from "./components/Button";
import Card from "./components/Card";
import { useEffect, useState } from "react";
import { apiGet } from "./Utils/api";
import Loading from "./components/Loading";

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-soft transition-all hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-surface-500 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-surface-900 mt-1">{value}</p>
      </div>
      <div className="text-2xl opacity-20">{icon}</div>
    </div>
  </div>
);

const FeatureCard = ({ title, description, link, icon }) => (
  <Link to={link} className="group block h-full">
    <div className="bg-white p-8 rounded-2xl border border-surface-200 shadow-soft h-full transition-all group-hover:border-brand-300 group-hover:shadow-md">
      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6 text-2xl group-hover:bg-brand-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-surface-900 mb-3">{title}</h3>
      <p className="text-surface-500 text-sm leading-relaxed mb-6">{description}</p>
      <span className="text-brand-600 font-semibold text-sm inline-flex items-center gap-2">
        Explore <span className="group-hover:translate-x-1 transition-transform">→</span>
      </span>
    </div>
  </Link>
);

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [boards, setBoards] = useState([]);
  const [totalBoards, setTotalBoards] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      const res = await apiGet("/board?limit=3");
      if (res.ok) {
        // Handle both Array response and Object with board_list
        if (Array.isArray(res.json)) {
          setBoards(res.json);
          setTotalBoards(res.json.length);
        } else {
          setBoards(res.json?.board_list || []);
          setTotalBoards(res.json?.total_result || 0);
        }
      }
      setLoading(false);
    };
    fetchHomeData();
  }, []);

  if (authLoading || loading) return <div className="p-12"><Loading /></div>;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-900 p-8 md:p-16 text-white">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            The future of <span className="text-brand-400">community</span> discussions.
          </h1>
          <p className="text-surface-300 text-lg mb-8 leading-relaxed">
            Welcome to FT_TRANSCENDENCE. A clean, professional space for developers, creators, and enthusiasts to collaborate and share knowledge.
          </p>
          <div className="flex flex-wrap gap-4">
            <ButtonLink link="/board" variant="primary" size="lg">
              Browse Boards
            </ButtonLink>
            {!user && (
              <ButtonLink link="/register" variant="outline" size="lg" className="!bg-transparent !text-white !border-surface-700 hover:!bg-surface-800">
                Join Community
              </ButtonLink>
            )}
          </div>
        </div>
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
      </section>

      {/* Dynamic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Boards" value={totalBoards} icon="📂" />
        <StatCard label="Platform" value="Open" icon="🌐" />
        <StatCard label="API Status" value="Online" icon="⚡" />
      </div>

      {/* Core Features */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-surface-900">Get Started</h2>
            <p className="text-surface-500 mt-2">Everything you need to manage your community.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Communities"
            description="Explore diverse boards tailored to your interests or create your own space."
            link="/board"
            icon="🏢"
          />
          <FeatureCard
            title="Connections"
            description="Build your network. Follow friends and keep up with their latest discussions."
            link="/friends"
            icon="🤝"
          />
          <FeatureCard
            title="API Access"
            description="Powerful endpoints for developers. Generate keys and integrate with our core."
            link={user ? `/user/${user.username}` : "/login"}
            icon="⚡"
          />
        </div>
      </section>

      {/* Recent Boards List */}
      <section className="bg-surface-50 rounded-3xl p-8 border border-surface-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-surface-900">Featured Boards</h3>
          <Link to="/board" className="text-brand-600 font-semibold text-sm hover:underline">View all boards</Link>
        </div>
        <div className="space-y-3">
          {boards.length > 0 ? boards.map(board => (
            <Link key={board.id} to={`/board/${board.name}`} className="flex items-center justify-between p-4 bg-white rounded-xl border border-surface-200 hover:border-brand-300 hover:shadow-soft transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center font-bold text-surface-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                  {board.name[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-surface-900">{board.name}</h4>
                  <p className="text-xs text-surface-400 truncate max-w-xs">{board.description || "No description provided."}</p>
                </div>
              </div>
              <span className="text-surface-300 group-hover:text-brand-600">→</span>
            </Link>
          )) : <p className="text-surface-400 italic text-sm">No boards discovered yet.</p>}
        </div>
      </section>
    </div>
  );
}
