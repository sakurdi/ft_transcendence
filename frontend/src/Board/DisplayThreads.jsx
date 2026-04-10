import { useEffect, useState} from "react";

import { apiGet } from "../Utils/api";
import useNotif from "../components/Notif";

import Post from "./DisplayPost/Post";
import Loading from "../components/Loading";

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

	return (
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
