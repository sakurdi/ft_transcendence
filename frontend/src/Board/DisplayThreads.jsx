import { useEffect, useState } from "react";
import { useNavigation } from "react-dom"
import useAuth from "../User/AuthProvider";
import { apiGet } from "../Utils/api";
// function DisplayHeaderThread({thread})

export function DisplayOneThread({thread})
{
	return (
		<article>

		</article>
	)
}

export default function DisplayThreads({board, privilegeLvl}) {
	const userHandler = useAuth()
	const [loading, setLoading] = useState(true)
	const [threads, setThreads] = useState([])
	
	useEffect(() => {
		const fetchThreads = async (boardName) => {
			const res = await apiGet(`/board/${boardName}/threads`)
			console.log(res)
			setThreads("asd")
		}
		fetchThreads(board.name)
		setLoading(false)
		console.log(board)
	}, [])

	if (loading) return "loading"
	
	return(
		<>{threads}</>
	)
}
