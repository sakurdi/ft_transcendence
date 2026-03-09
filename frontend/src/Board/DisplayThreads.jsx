import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import useAuth from "../User/AuthProvider";
import { apiGet } from "../Utils/api";
import { TextLink } from "../components/TextButton";

// author_id: 2
// board_id: 3
// content: "A tous"
// created_at: "2026-03-09T15:22:33.048745Z"
// id: 4
// parent_id: null
// title: "Bonjour"
// username: "gaeudes"

function getRandomPastel() {
	// const pastel = ["#ff99c8", "#fcf6bd", "#d0f4de", "#a9def9", "#e4c1f9"]
	const pastel = [
		"#FFAACC", "#FFBBCC", "#FFCCCC", "#FFDDCC", "#FFEECC", "#FFFFCC",
		"#FFAADD", "#FFBBDD", "#FFCCDD", "#FFDDDD", "#FFEEDD", "#FFFFDD",
		"#FFAAEE", "#FFBBEE", "#FFCCEE", "#FFDDEE", "#FFEEEE", "#FFFFEE",
		"#FFAAFF", "#FFBBFF", "#FFCCFF", "#FFDDFF", "#FFEEFF", "#FFFFFF",
		"#CCAAFF", "#CCBBFF", "#CCCCFF", "#CCDDFF", "#CCEEFF", "#CCFFFF",
		"#CCAAEE", "#CCBBEE", "#CCCCEE", "#CCDDEE", "#CCEEEE", "#CCFFEE",
		"#CCAADD", "#CCBBDD", "#CCCCDD", "#CCDDDD", "#CCEEDD", "#CCFFDD",
		"#CCAACC", "#CCBBCC", "#CCCCCC", "#CCDDCC", "#CCEECC", "#CCFFCC",
	]
	const Ncolors = pastel.length
	return pastel[Math.floor(Math.random() * Ncolors)]
}

export function DisplayOneThread({thread})
{
	const navigate = useNavigate()

	const borderColor = getRandomPastel() 

	console.log(thread)

	return (
		<article onClick={() => navigate(`/post/${thread.id}`)}
			className="bg-zinc-700 rounded-xl p-2 cursor-pointer hover:bg-zinc-700 transition"
			style={{ borderWidth: '5px', borderStyle: 'solid', borderColor: borderColor }}>
			<header className="mb-2">
				<div className="flex items-center gap-3">
					<h6 className="text-white font-bold text-base">
						{thread.title}
					</h6>
					<time dateTime={thread.created_at}
						className="text-xs text-zinc-400">
						{thread.created_at}
					</time>
				</div>
				<TextLink text={thread.username} link={`/user/${thread.username}`}
					className="text-xs text-zinc-400"/>

			</header>
			<hr className="mb-2 -mx-4" style={{borderStyle: 'solid', borderColor: borderColor, borderTopWidth: '3px'}}/>
			<section>
				<p className="text-gray-200 text-sm break-words whitespace-normal">
					{thread.content}
				</p>
			</section>
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
			if (res.ok) {
				console.log(res)
				setThreads(res.json)
				setLoading(false)
			}
		}
		fetchThreads(board.name)
		// console.log(board)
	}, [])

	if (loading) return "loading"
	console.log("Threads: "+threads)
	return(
		<>{threads.map((oneThread) => <DisplayOneThread key={oneThread.id} thread={oneThread}/>)}</>
	)
}
