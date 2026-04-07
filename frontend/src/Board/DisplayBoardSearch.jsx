import { useEffect, useState } from "react";

import useAuth from "../User/AuthProvider";
import { apiGet } from "../Utils/api";
import Loading from "../components/Loading";
import useNotif from "../components/Notif";
import TextInput from "../components/TextInput"
import {ButtonLink} from "../components/Button";


export default function BoardList() {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const [loading, setLoading] = useState(true)
	const [boards, setBoards] = useState([])

	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)
	const [sort, setSort] = useState("name")
	const [order, setOrder] = useState("asc")
	const [filter, setFilter] = useState("")
	const [totalResult, setTotalResult] = useState(0)

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
		setLoading(true)
		console.log("query test", buildQuery())
		const response = await apiGet(buildQuery())
		// const response = await apiGet("/board?page=1&limit=10&sort=name&order=asc&name=")
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
			const parsedBoards = Array.isArray(response.json?.board_list)
				? response.json.board_list
				: []
			setBoards(parsedBoards)
			setTotalResult(response.json?.total_result || 0)
		}

		setLoading(false)
		console.log("board", boards)
		console.log("response", response)
	}

	useEffect(() => {
		if (userHandle.loading) {
			return
		}
		fetchBoards()
	}, [userHandle.loading])

	const totalPages = Math.max(1, Math.ceil(totalResult / (limit)))
	const pages = [...Array(totalPages).keys()].map((n) => n + 1)

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages)
		}
	}, [page, totalPages])

	if (loading)
		return <Loading/>

	return (
		<>
		<label>
			SELECT PAGE:
			<select name="page"
					value={page}
					onChange={e => setPage(Number(e.target.value))}>
				{pages.map((pageNumber) => (
					<option key={pageNumber} value={pageNumber}>
						page {pageNumber}
					</option>
				))}
			</select>
		</label>
<br/>
		<label>
			Select number of board shown:
			<select name="limit"
					defaultValue="10"
					value={limit}
					onChange={e => setLimit(Number(e.target.value))}>
				<option value="10">10</option>
				<option value="25">25</option>
				<option value="50">50</option>
			</select>
		</label>
<br/>
		<label>
			Select how to sort:
			<select name="sort"
					defaultValue="created_at"
					value={sort}
					onChange={e => setSort(e.target.value)}>
				<option value="created_at">created_at</option>
				<option value="id">id</option>
				<option value="name">name</option>
			</select>
		</label>
<br/>
		<label>
			Select how to order:
			<select name="order"
					defaultValue="asc"
					value={order}
					onChange={e => setOrder(e.target.value)}>
				<option value="asc">ascendant</option>
				<option value="desc">descenat</option>
			</select>
		</label>
<br/>
		<TextInput value={filter}
				onChange={(filter) => setFilter(filter)}
				placeholder = ""
				onEnter = {fetchBoards}
		/>

		<button type="button" onClick={fetchBoards}>
			SEARCH
		 </button>


		<section >
			<h1>Boards</h1>
			<p>{totalResult} result found</p>
			{boards.length === 0 ? (
				<p>no board found</p>
			) : (
				<div>
					{boards.map((board) => (
						<div key={board.id}>
							<ButtonLink link={`/board/${board.name}`}>
								{board.name}
							</ButtonLink>
						</div>
					))}
				</div>
			)}
		</section>
		</>
	)
}
