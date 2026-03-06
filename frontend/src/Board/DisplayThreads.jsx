import { useEffect, useState } from "react";
import { useNavigation } from "react-dom"
import useAuth from "../User/AuthProvider";


export default function DisplayThreads({board, privilegeLvl}) {
	const userHandler = useAuth()
	const [loading, setLoading] = useState(true)
	const [threads, setThreads] = useState([])
	
	useEffect(() => {
		const fetchThreads = async (boardName) => {
			setThreads("asd")
		}
		fetchThreads(board.name)
		setLoading(false)
	}, [])

	if (loading) return "loading"
	
	return(
		<></>
	)
}
