import { useEffect, useState, useRef } from "react";
import { apiGet } from "../Utils/api";
import DisplayPost from "./DisplayPost";

// author_id: 2
// board_id: 3
// content: "A tous"
// created_at: "2026-03-09T15:22:33.048745Z"
// id: 4
// parent_id: null
// title: "Bonjour"
// username: "gaeudes"



export default function DisplayThreads({board, privilegeLvl, refreshKeyThread, setRefreshKeyThread}) {
	const [loading, setLoading] = useState(true)
	const [threads, setThreads] = useState([])
	
	useEffect(() => {
		const fetchThreads = async (boardName) => {
			const res = await apiGet(`/board/${boardName}/threads`)
			if (res.ok) {
				setThreads(res.json)
				setLoading(false)
			}
		}
		fetchThreads(board.name)
	}, [refreshKeyThread])

	if (loading) return "loading"
	if (!threads) {
		return "This board has no posts"
	} else {
		return(
		<>
			{threads.map((oneThread) =>
				<DisplayPost key={oneThread.id}
					post={oneThread}
					privilegeLvl={privilegeLvl}
					refreshKey={setRefreshKeyThread}
				/>)
			}
		</>
		)
	}
}
