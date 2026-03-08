import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../User/AuthProvider";
import { apiGet } from "../Utils/api";
import Loading from "../components/Loading";
import useNotif from "../components/Notif";
import TextInput from "../components/TextInput";
import Button, { ButtonLink } from "../components/Button";

export default function BoardList() {
  const userHandle = useAuth();
  const notifHandle = useNotif();
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState("asc");
  const [filter, setFilter] = useState("");
  const [totalResult, setTotalResult] = useState(0);

  function buildQuery() {
    const params = new URLSearchParams({
      page,
      limit,
      sort,
      order,
      name: filter,
    });
    return `/board?${params.toString()}`;
  }

  const fetchBoards = async () => {
    setLoading(true);
    const response = await apiGet(buildQuery());
    if (!response.ok) {
      notifHandle.pushError(response.status);
      setBoards([]);
      setTotalResult(0);
      setLoading(false);
      return;
    }

    if (Array.isArray(response.json)) {
      setBoards(response.json);
      setTotalResult(response.json.length);
    } else {
      const parsedBoards = Array.isArray(response.json?.board_list)
        ? response.json.board_list
        : [];
      setBoards(parsedBoards);
      setTotalResult(response.json?.total_result || 0);
    }
    setLoading(false);
  };

  const clearFilter = () => {
    setPage(1);
    setLimit(10);
    setSort("name");
    setOrder("asc");
    setFilter("");
  };

  useEffect(() => {
    if (!userHandle.loading) {
      fetchBoards();
    }
  }, [userHandle.loading, page, limit, sort, order]);

  if (loading && boards.length === 0) return <div className="p-12"><Loading /></div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-surface-900 tracking-tight">Communities</h1>
          <p className="text-surface-500 mt-2">Discover spaces that matter to you.</p>
        </div>
        <ButtonLink link="/createBoard" variant="primary">
          + Create New Board
        </ButtonLink>
      </header>

      {/* Filters Section */}
      <section className="bg-white p-6 rounded-2xl border border-surface-200 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest mb-2 ml-1">Search Boards</label>
            <div className="flex gap-2">
              <TextInput 
                value={filter}
                onChange={setFilter}
                placeholder="Search by name..."
                onEnter={fetchBoards}
              />
              <Button onClick={fetchBoards} variant="secondary">Search</Button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest mb-2 ml-1">Sort By</label>
            <select 
              value={sort} 
              onChange={e => setSort(e.target.value)}
              className="w-full h-[42px] px-4 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            >
              <option value="name">Name</option>
              <option value="created_at">Date Created</option>
              <option value="id">ID</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-400 uppercase tracking-widest mb-2 ml-1">Order</label>
            <select 
              value={order} 
              onChange={e => setOrder(e.target.value)}
              className="w-full h-[42px] px-4 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xs text-surface-400">{totalResult} boards found</p>
          <button onClick={clearFilter} className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-widest">
            Clear Filters
          </button>
        </div>
      </section>

      {/* Boards Grid */}
      <section>
        {loading ? (
          <div className="py-20"><Loading /></div>
        ) : boards.length === 0 ? (
          <div className="text-center py-20 bg-surface-50 rounded-3xl border border-dashed border-surface-200">
            <p className="text-surface-400 italic">No boards found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boards.map((board) => (
              <Link 
                key={board.id} 
                to={`/board/${board.name}`}
                className="group flex items-center justify-between p-6 bg-white border border-surface-200 rounded-2xl shadow-soft hover:shadow-md hover:border-brand-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center text-surface-500 font-black text-xl group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    {board.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 group-hover:text-brand-700 transition-colors">{board.name}</h3>
                    <p className="text-xs text-surface-400 mt-0.5">Created on {new Date(board.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center text-surface-300 group-hover:bg-brand-100 group-hover:text-brand-600 transition-all">
                  →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalResult > limit && (
        <div className="flex justify-center gap-2 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center px-4 text-sm font-bold text-surface-700">
            Page {page}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            disabled={boards.length < limit}
            onClick={() => setPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
