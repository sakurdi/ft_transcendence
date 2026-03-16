import {useState, useEffect} from "react"
import { apiGet, apiDelete, apiPost } from "../Utils/api"

import Button from "../components/Button"
import { TextAreaTitle } from "../components/TextArea"
import useNotif from "../components/Notif"
import getRandomPastel, { getRandomPastelString } from "../Utils/colors"
import Tooltip from "../components/Tooltip"
import Loading from "../components/Loading"

// r.Post("/board/{boardID}/mod/{userID}", boards.AddModHandler(c))
// r.Delete("/board/{boardID}/mod/{userID}", boards.RemoveModHandler(c))
// mux.Get("/board/{boardID}/members", boards.GetBoardModTeamHandler(c))

export function DisplayOneMod({mod, refreshMods, boardID}) {
	const notifHandler = useNotif()
	const colorBg = getRandomPastelString(mod.username)
	
	const onDeleteMod = async () => {
		if (window.confirm(`Are you sure to demote ${mod.username}?`)) {
			const res = await apiDelete(`/board/${boardID}/mod/${mod.username}`)
			if (res.ok) {
				notifHandler.pushSuccess(`Demoted ${mod.username} `)
				refreshMods()
			} else
				notifHandler.pushError(res.stats)
		}
	}
	const deleteMod = (modRole) => {
		if (modRole === "admin") return <></>
	
		return (
			<Tooltip content = {"Remove from the moderator team"}>
				<button className="flex items-center justify-center text-black/80 text-base font-bold pl-0 pr-2 border-r border-g_black-600"
					onClick = {onDeleteMod}>
					x
				</button>
			</Tooltip>
		)
	}

	return (
	<div className="flex items-center gap-2 px-3 py-1 rounded-xl border  border-g_black-600"
		style={{ backgroundColor: colorBg }}>
		{ mod.role != "admin" &&
			deleteMod(mod.username)
		}
		<span className="text-sm font-semibold text-black/80">
			{mod.username}
		</span>
	</div>
	)
}

export function DisplayAddMod({boardID, refreshMods}) {
	const notifHandle = useNotif()

	const [newMod, setNewMod] = useState("")

	const bgColor = getRandomPastel(boardID)

	const onSubmit = async (e) => {
		e?.preventDefault()

		const res = await apiPost(`/board/${boardID}/mod/${newMod}`)
		if (!res.ok) {
			notifHandle.pushError(res.status)
		} else {
			setNewMod("")
			notifHandle.pushSuccess(`Added ${newMod} to the mod team`)
			refreshMods()
		}
	}

	return (
		<div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-g_black-600"
				style={{ backgroundColor: bgColor }}
				onSubmit = {onSubmit}>
			<button className="flex items-center justify-center text-black/80 text-base font-bold pr-2 border-r border-g_black-600"
				onClick = {onSubmit}>
				+
			</button>
			<input className="bg-transparent text-sm font-semibold text-black/80 placeholder-black/40 outline-none w-32"
				type="text"
				placeholder="Add moderator"
				onKeyDown = {(e) => {if (e.key === "Enter") onSubmit();}}
				value = {newMod}
				onChange = {(e) => setNewMod(e.target.value)}
			/>
		</div>
	)
}

export default function DisplayMods({boardID, }) {
	const notifHandle = useNotif()

	const [refreshKey, setRefreshKey] = useState(0)
	const [modTeam, setModTeam] = useState([])
	const [loading, setLoading] = useState(true)

	const refreshMods = () => {setRefreshKey(refreshKey + 1)}

	useEffect(() => {
		setLoading(true)
		const getMod = async () => {
			const res = await apiGet(`/board/${boardID}/members`);
			if (!res.ok) {
				notifHandle.pushError("Couldn't fetch moderator team")
			} else {
				setModTeam(res.json)
				setLoading(false)
			}
		}
		getMod()
	}, [refreshKey])
	
	
	if (loading) return <Loading/>

	return (
		<div className="flex gap-2">
			{modTeam.map((oneMod, i) => 
				<DisplayOneMod key = {i}
					mod = {oneMod}
					boardID = {boardID}
					refreshMods = {refreshMods}
				/>
			)
			}
			<DisplayAddMod boardID = {boardID}
				refreshMods = {refreshMods}/>
		</div>
	)
}
