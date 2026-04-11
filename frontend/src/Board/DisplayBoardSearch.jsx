import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../User/AuthProvider";
import { apiGet } from "../Utils/api";
import Loading from "../components/Loading";
import useNotif from "../components/Notif";

export default function BoardList() {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const navigate = useNavigate()
	const [loading, setLoading] = useState(true)
	const [boards, setBoards] = useState([])

	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [sort, setSort] = useState("created_at")
	const [order, setOrder] = useState("desc")
	const [filter, setFilter] = useState("")
	const [totalResult, setTotalResult] = useState(0)

	function buildQuery(overrides = {}) {
		const params = new URLSearchParams({
			page:  overrides.page  ?? page,
			limit: overrides.limit ?? limit,
			sort:  overrides.sort  ?? sort,
			order: overrides.order ?? order,
			name:  overrides.filter ?? filter,
		})
		return `/board?${params.toString()}`
	}

	const fetchBoards = async (overrides = {}) => {
		setLoading(true)
		const response = await apiGet(buildQuery(overrides))
		if (!response.ok) {
			notifHandle.pushError(response.status)
			setBoards([])
			setTotalResult(0)
			setLoading(false)
			return
		}

		if (Array.isArray(response.json)) {
			setBoards(response.json)
			setTotalResult(response.json.length)
		} else {
			const parsedBoards = Array.isArray(response.json?.board_list) ? response.json.board_list : []
			setBoards(parsedBoards)
			setTotalResult(response.json?.total_result || parsedBoards.length)
		}
		setLoading(false)
	}

	const clearFilter = () => {
		setPage(1); setLimit(10); setSort("created_at"); setOrder("desc"); setFilter("")
		fetchBoards({ page: 1, limit: 10, sort: "created_at", order: "desc", filter: "" })
	}

	// Initial load
	useEffect(() => {
		if (userHandle.loading) return
		fetchBoards()
	}, [userHandle.loading])

	// Re-fetch whenever page changes (pagination clicks)
	useEffect(() => {
		if (userHandle.loading) return
		fetchBoards()
	}, [page])

	const totalPages = Math.max(1, Math.ceil(totalResult / limit))
	const pages = [...Array(totalPages).keys()].map((n) => n + 1)

	useEffect(() => {
		if (page > totalPages) setPage(totalPages)
	}, [page, totalPages])

	const selectClass =
		"bg-white/7 text-[#eaeaf4] border border-white/10 rounded-lg px-3 py-2 text-sm " +
		"focus:outline-none focus:border-g_seagreen focus:ring-2 focus:ring-g_seagreen/15 " +
		"transition-all duration-150 cursor-pointer"

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[#eaeaf4] tracking-tight">Boards</h1>
					<p className="text-[#55556a] text-sm mt-0.5">
						{totalResult} board{totalResult !== 1 ? 's' : ''} found
					</p>
				</div>
				<button
					onClick={() => navigate("/createBoard")}
					className="px-4 py-2 rounded-xl text-sm font-semibold
						bg-g_seagreen text-white hover:bg-g_seagreen-600
						transition-all duration-150 active:scale-[0.97] shadow-lg shadow-g_seagreen/20">
					+ New Board
				</button>
			</div>

			{/* Filters */}
			<div className="glass rounded-2xl p-5">
				<p className="text-xs font-semibold text-[#55556a] uppercase tracking-wider mb-4">
					Filter & Sort
				</p>
				<div className="flex flex-wrap items-end gap-4">
					{/* Search */}
					<div className="flex-1 min-w-[180px]">
						<label className="block text-xs text-[#9898b8] mb-1.5 font-medium">Search</label>
						<input
							type="text"
							value={filter}
							onChange={e => setFilter(e.target.value)}
							onKeyDown={e => e.key === "Enter" && fetchBoards()}
							placeholder="Board name…"
						/>
					</div>

					<div>
						<label className="block text-xs text-[#9898b8] mb-1.5 font-medium">Sort by</label>
						<select value={sort} onChange={e => setSort(e.target.value)} className={selectClass}>
							<option value="name">Name</option>
							<option value="created_at">Created</option>
							<option value="id">ID</option>
						</select>
					</div>

					<div>
						<label className="block text-xs text-[#9898b8] mb-1.5 font-medium">Order</label>
						<select value={order} onChange={e => setOrder(e.target.value)} className={selectClass}>
							<option value="asc">Ascending</option>
							<option value="desc">Descending</option>
						</select>
					</div>

					<div>
						<label className="block text-xs text-[#9898b8] mb-1.5 font-medium">Per page</label>
						<select value={limit} onChange={e => setLimit(Number(e.target.value))} className={selectClass}>
							<option value="10">10</option>
							<option value="25">25</option>
							<option value="50">50</option>
						</select>
					</div>

					<div className="flex gap-2">
						<button onClick={() => fetchBoards()}
							className="px-4 py-2 rounded-xl text-sm font-semibold
								bg-g_seagreen text-white hover:bg-g_seagreen-600
								transition-all duration-150 active:scale-[0.97]
								shadow-md shadow-g_seagreen/20">
							Search
						</button>
						<button onClick={clearFilter}
							className="px-4 py-2 rounded-xl text-sm font-medium
								text-[#9898b8] glass hover:border-white/20 hover:text-[#eaeaf4]
								transition-all duration-150">
							Clear
						</button>
					</div>
				</div>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center gap-1.5 flex-wrap">
					{pages.map(pageNumber => (
						<button
							key={pageNumber}
							onClick={() => setPage(pageNumber)}
							className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150
								${page === pageNumber
									? "bg-g_seagreen text-white shadow-md shadow-g_seagreen/30"
									: "glass text-[#9898b8] hover:border-white/20 hover:text-[#eaeaf4]"
								}`}>
							{pageNumber}
						</button>
					))}
				</div>
			)}

			{/* Board grid */}
			{loading ? (
				<Loading />
			) : boards.length === 0 ? (
				<div className="text-center py-20">
					<p className="text-[#55556a] text-base">No boards found</p>
					<button onClick={() => navigate("/createBoard")}
						className="mt-4 text-g_seagreen text-sm hover:underline">
						Create the first board
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{boards.map((board) => (
						<button
							key={board.id}
							onClick={() => navigate(`/board/${board.name}`)}
							className="group text-left glass rounded-xl p-5
								hover:glass-elevated hover:border-g_seagreen/30
								transition-all duration-200 active:scale-[0.98]">
							<div className="flex items-start justify-between gap-2">
								<h3 className="text-[#eaeaf4] font-bold text-base
									group-hover:text-g_seagreen transition-colors duration-150">
									/{board.name}/
								</h3>
								<span className="text-g_seagreen opacity-0 group-hover:opacity-100
									transition-opacity duration-200 text-sm mt-0.5">
									→
								</span>
							</div>
							{board.description && (
								<p className="text-[#9898b8] text-xs mt-2 leading-relaxed line-clamp-2">
									{board.description}
								</p>
							)}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
