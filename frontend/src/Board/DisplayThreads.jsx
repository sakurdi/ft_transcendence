import { useEffect, useState, useRef } from "react";
import { apiGet } from "../Utils/api";
import Post from "./DisplayPost/Post";
import Loading from "../components/Loading";
import useNotif from "../components/Notif";

// author_id: 2
// board_id: 3
// content: "A tous"
// created_at: "2026-03-09T15:22:33.048745Z"
// id: 4
// parent_id: null
// title: "Bonjour"
// username: "gaeudes"

export default function DisplayThreads({boardName, privilegeLvl, refreshKeyThread, setRefreshKeyThread}) {
	const notifHandle = useNotif()
	
	const [loading, setLoading] = useState(true)
	const [threads, setThreads] = useState([])
	
	useEffect(() => {
		setLoading(true)
		const fetchThreads = async (boardName) => {
			const res = await apiGet(`/board/${boardName}/threads`)
			if (res.ok) {
				setThreads(res.json)
			} else {
				notifHandle.pushError(res.status)
			}
			setLoading(false)
		}
		fetchThreads(boardName)
	}, [refreshKeyThread])

	if (loading) return <Loading/>
	if (!threads || threads.lenght == 0) return "This board has no posts"

	return(
	<>
		{threads.map((oneThread) =>
			<Post key={oneThread.id}
				post={oneThread}
				privilegeLvl={privilegeLvl}
				refreshKey={setRefreshKeyThread}
			/>)
		}
	</>
	)
}
