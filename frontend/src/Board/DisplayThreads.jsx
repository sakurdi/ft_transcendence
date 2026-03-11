import { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom"
import useAuth from "../User/AuthProvider";
import { apiDelete, apiGet } from "../Utils/api";
// import TextButton, { TextLink } from "../components/TextButton";
// import getRandomPastel from "../Utils/colors";
// import TextArea, { TextAreaTitle } from "../components/TextArea";
// import Tooltip from "../components/Tooltip";
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
	const userHandler = useAuth()
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
