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

	const [page, setPage] = useState("1")
	const [limit, setLimit] = useState("10")
	const [sort, setSort] = useState("name")
	const [order, setOrder] = useState("asc")
	const [filter, setFilter] = useState("")

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
			setLoading(false)
			return
		}
		setBoards(Array.isArray(response.json) ? response.json : [])
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

	if (loading)
		return <Loading/>

	return (
		<>
		<label>
			SELECT PAGE:
			<select name="page"
					defaultValue="1"
					value={page}
					onChange={e => setPage(e.target.value)}>
				<option value="1">page 1</option>
				<option value="2">page 2</option>
				<option value="3">page 3</option>
			</select>
		</label>
<br/>
		<label>
			Select number of board shown:
			<select name="limit"
					defaultValue="10"
					value={limit}
					onChange={e => setLimit(e.target.value)}>
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
