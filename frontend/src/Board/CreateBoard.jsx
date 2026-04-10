import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../User/AuthProvider";
import useNotif from "../components/Notif";
import { apiPost } from "../Utils/api";
import Loading from "../components/Loading";
import Button from "../components/Button"

export default function CreateBoard() {
	const navigate = useNavigate()
	const userHandle = useAuth()
	const notifHandle = useNotif()

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) {
			notifHandle.pushError("You need to be logged in to create a board")
			navigate('/')
		}
	}, [userHandle.loading])

	const [boardName, setBoardName] = useState("")
	const [boardDescription, setBoardDescription] = useState("")

	const _CreateBoard = async () => {
		const response = await apiPost("//board/new", {
			body: JSON.stringify({ 'name': boardName, 'description': boardDescription })
		})
		if (!response.ok) {
			notifHandle.pushError(response.status)
		} else {
			notifHandle.pushSuccess(`Board "/${boardName}/" created`)
			navigate("/board/" + boardName)
		}
	}

	if (userHandle.loading || !userHandle.user) return <Loading />

	return (
		<div className="max-w-md mx-auto">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-[#eaeaf4] tracking-tight">Create a Board</h1>
				<p className="text-[#9898b8] text-sm mt-1">Start a new community around any topic.</p>
			</div>

			<div className="glass rounded-2xl p-6 space-y-5">
				<div className="space-y-1.5">
					<label className="block text-xs font-semibold text-[#9898b8] uppercase tracking-wider">
						Board Name
					</label>
					<input
						type="text"
						value={boardName}
						onChange={e => setBoardName(e.target.value)}
						placeholder="e.g. gaming, tech, art"
					/>
					<p className="text-xs text-[#55556a]">
						Displayed as /{boardName || "name"}/
					</p>
				</div>

				<div className="space-y-1.5">
					<label className="block text-xs font-semibold text-[#9898b8] uppercase tracking-wider">
						Description
						<span className="ml-1 normal-case font-normal text-[#55556a]">(optional)</span>
					</label>
					<textarea
						value={boardDescription}
						onChange={e => setBoardDescription(e.target.value)}
						placeholder="What is this board about?"
						rows={3}
						className="resize-none"
					/>
				</div>

				<Button onClick={_CreateBoard} className="w-full justify-center py-2.5 shadow-md shadow-g_seagreen/20">
					Create Board
				</Button>
			</div>
		</div>
	)
}
