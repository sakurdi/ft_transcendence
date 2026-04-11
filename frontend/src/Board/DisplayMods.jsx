import { useState, useEffect } from "react"
import { apiGet, apiDelete, apiPost } from "../Utils/api"

import useNotif from "../components/Notif"
import { getRandomPastelString } from "../Utils/colors"
import Tooltip from "../components/Tooltip"
import Loading from "../components/Loading"

export function DisplayOneMod({ mod, refreshMods, boardID }) {
	const notifHandler = useNotif()
	const colorBg = getRandomPastelString(mod.username)

	const onDeleteMod = async () => {
		if (window.confirm(`Remove ${mod.username} from the mod team?`)) {
			const res = await apiDelete(`/board/${boardID}/mod/${mod.username}`)
			if (res.ok) {
				notifHandler.pushSuccess(`${mod.username} demoted`)
				refreshMods()
			} else {
				notifHandler.pushError(res.status)
			}
		}
	}

	return (
		<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/8
			text-sm font-medium text-[#0c0c12]"
			style={{ backgroundColor: colorBg }}>
			{mod.role !== "admin" && (
				<Tooltip content="Remove moderator">
					<button
						onClick={onDeleteMod}
						className="w-4 h-4 flex items-center justify-center rounded-full
							text-[#0c0c12]/60 hover:text-[#0c0c12] hover:bg-black/10
							text-xs font-bold transition-colors duration-100 mr-0.5">
						×
					</button>
				</Tooltip>
			)}
			<span className="text-xs font-semibold text-[#0c0c12]/80">
				{mod.username}
			</span>
			{mod.role === "admin" && (
				<span className="text-[0.65rem] font-bold text-[#0c0c12]/50 uppercase">
					owner
				</span>
			)}
		</div>
	)
}

export function DisplayAddMod({ boardID, refreshMods }) {
	const notifHandle = useNotif()
	const [newMod, setNewMod] = useState("")

	const onSubmit = async (e) => {
		e?.preventDefault()
		const res = await apiPost(`/board/${boardID}/mod/${newMod}`)
		if (!res.ok) {
			notifHandle.pushError(res.status)
		} else {
			setNewMod("")
			notifHandle.pushSuccess(`${newMod} added to mod team`)
			refreshMods()
		}
	}

	return (
		<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-white/15
			bg-[#1f1f28] hover:border-g_seagreen/40 transition-colors duration-150">
			<button
				onClick={onSubmit}
				className="text-g_seagreen text-sm font-bold hover:text-g_seagreen-400
					transition-colors duration-100">
				+
			</button>
			<input
				type="text"
				placeholder="Add moderator"
				value={newMod}
				onChange={e => setNewMod(e.target.value)}
				onKeyDown={e => e.key === "Enter" && onSubmit()}
				className="bg-transparent text-xs font-medium text-[#eaeaf4] placeholder-[#46465a]
					outline-none w-28 border-none focus:outline-none focus:ring-0"
			/>
		</div>
	)
}

export default function DisplayMods({ boardID }) {
	const notifHandle = useNotif()
	const [refreshKey, setRefreshKey] = useState(0)
	const [modTeam, setModTeam] = useState([])
	const [loading, setLoading] = useState(true)

	const refreshMods = () => { setRefreshKey(refreshKey + 1) }

	useEffect(() => {
		setLoading(true)
		const getMod = async () => {
			const res = await apiGet(`/board/${boardID}/members`)
			if (!res.ok) {
				notifHandle.pushError("Couldn't fetch moderator team")
			} else {
				setModTeam(res.json)
				setLoading(false)
			}
		}
		getMod()
	}, [refreshKey])

	if (loading) return <Loading />

	return (
		<div className="flex flex-wrap gap-2">
			{modTeam.map((oneMod, i) =>
				<DisplayOneMod key={i}
					mod={oneMod}
					boardID={boardID}
					refreshMods={refreshMods}
				/>
			)}
			<DisplayAddMod boardID={boardID} refreshMods={refreshMods} />
		</div>
	)
}
