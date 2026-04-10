import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../User/AuthProvider";
import DisplayMods from "./DisplayMods";
import getDateDifferenceISO from "../Utils/date";
import InfinitScrollThreads from "./InfinitScrollThreads"

import { apiGet, apiPut } from "../Utils/api";

import TextEdit from "../components/TextEdit";
import CreatePost from "./CreateThread";
import Loading from "../components/Loading";
import useNotif from "../components/Notif";

function DisplayBoardDescription({ description, privilegeLvl, saveEdit }) {
	if (!description || description.length === 0) return null
	if (privilegeLvl !== 3) {
		return <p className="text-[#9898b8] text-sm leading-relaxed mt-2">{description}</p>
	}
	return <TextEdit baseValue={description} onValueSave={saveEdit} />
}

export function DisplayBoardHeader({ board, privilegeLvl, setRefreshKeyBoard }) {
	const navigate = useNavigate()
	const notifHandle = useNotif()
	const [ownerName, setOwnerName] = useState(undefined)

	useEffect(() => {
		const fetchOwnerName = async (ownerId) => {
			const response = await apiGet(`/user/id/${ownerId}`)
			if (response.ok) {
				setOwnerName(response.json.username)
			} else {
				setOwnerName(undefined)
				notifHandle.pushError(response.status)
			}
		}
		fetchOwnerName(board.owner_id)
	}, [])

	const saveEdit = async (newDescription) => {
		const res = await apiPut(`board/${board.id}`, {
			body: JSON.stringify({ 'name': board.name, 'description': newDescription })
		})
		if (res.ok) {
			notifHandle.pushSuccess("Board updated")
			setRefreshKeyBoard()
		} else {
			notifHandle.pushError(res.status)
		}
	}

	return (
		<div className="glass rounded-2xl p-6 mb-6">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 min-w-0">
					<h1 className="text-2xl font-bold text-[#eaeaf4] tracking-tight">
						/{board.name}/
					</h1>
					<div className="flex items-center gap-3 mt-1.5 flex-wrap">
						{ownerName ? (
							<button
								onClick={() => navigate(`/user/${ownerName}`)}
								className="text-xs text-[#9898b8] hover:text-g_seagreen
									transition-colors duration-100 font-medium">
								{ownerName}
							</button>
						) : (
							<span className="text-xs text-[#55556a]">Unknown owner</span>
						)}
						<span className="text-[#55556a] text-xs">·</span>
						<time dateTime={board.created_at} className="text-xs text-[#55556a]">
							{getDateDifferenceISO(board.created_at)}
						</time>
					</div>
					<DisplayBoardDescription
						description={board.description}
						privilegeLvl={privilegeLvl}
						saveEdit={saveEdit}
					/>
				</div>

				{privilegeLvl >= 2 && (
					<span className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold
						bg-g_seagreen/15 text-g_seagreen border border-g_seagreen/30
						shadow-sm shadow-g_seagreen/10">
						{privilegeLvl >= 3 ? "Owner" : "Moderator"}
					</span>
				)}
			</div>

			{privilegeLvl >= 3 && (
				<div className="mt-5 pt-4 border-t border-white/6">
					<p className="text-xs text-[#55556a] uppercase tracking-wider font-semibold mb-3">
						Mod Team
					</p>
					<DisplayMods boardID={board.id} />
				</div>
			)}
		</div>
	)
}

export default function DisplayBoard() {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const { boardName } = useParams()

	const [refreshKeyThread, setRefreshKeyThread] = useState(0)
	const [refreshKeyBoard, setRefreshKeyBoard] = useState(0)
	const [loading, setLoading] = useState(true)
	const [privilegeLvl, setPrivilegeLvl] = useState(0)

	const [board, setBoard] = useState({
		id: undefined, name: undefined,
		description: undefined, owner_id: undefined, created_at: undefined,
	})

	useEffect(() => {
		setLoading(true)
		if (userHandle.loading) return

		const checkIsMod = async (boardname) => {
			try {
				const response = await apiGet(`/board/${boardname}/ismod`)
				if (!response.ok) throw (response.status)
				return response.json.ismod
			} catch { return false }
		}

		const fetchBoard = async (boardName) => {
			const response = await apiGet(`/board/${boardName}`)
			if (response.ok) {
				const nBoard = response.json
				const user = userHandle.user
				if (user) {
					setPrivilegeLvl(1)
					if (user.id == nBoard.owner_id) {
						setPrivilegeLvl(3)
					} else {
						const isMod = await checkIsMod(nBoard.name)
						if (isMod) setPrivilegeLvl(2)
					}
				} else {
					setPrivilegeLvl(0)
				}
				setBoard(nBoard)
			} else {
				notifHandle.pushError(response.status)
			}
		}
		fetchBoard(boardName)
		setLoading(false)
	}, [refreshKeyBoard, userHandle.loading, userHandle.user])

	if (loading) return <Loading />
	if (!board.id) {
		return (
			<div className="flex flex-col items-center justify-center py-24 gap-3">
				<p className="text-[#55556a] text-lg">Board not found</p>
			</div>
		)
	}

	return (
		<div>
			<DisplayBoardHeader
				board={board}
				privilegeLvl={privilegeLvl}
				setPrivilegeLvl={setPrivilegeLvl}
				setRefreshKeyBoard={() => setRefreshKeyBoard(refreshKeyBoard + 1)}
			/>

			<InfinitScrollThreads
				boardName={boardName}
				privilegeLvl={privilegeLvl}
				refreshKeyThread={refreshKeyThread}
				setRefreshKeyThread={() => setRefreshKeyThread(refreshKeyThread + 1)}
			/>

			{userHandle.user && (
				<div className="mt-6 pt-6 border-t border-white/6">
					<p className="text-xs font-semibold text-[#55556a] uppercase tracking-wider mb-4">
						New Thread
					</p>
					<CreatePost
						board={board}
						setRefreshKeyThread={() => setRefreshKeyThread(refreshKeyThread + 1)}
					/>
				</div>
			)}
		</div>
	)
}
