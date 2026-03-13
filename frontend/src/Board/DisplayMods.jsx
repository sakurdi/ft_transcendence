import {useState, useEffect} from "react"
import { apiGet, apiDelete, apiPost } from "../Utils/api"

import Button from "../components/Button"
import { TextAreaTitle } from "../components/TextArea"

// r.Post("/board/{boardID}/mod/{userID}", boards.AddModHandler(c))
// r.Delete("/board/{boardID}/mod/{userID}", boards.RemoveModHandler(c))
// mux.Get("/board/{boardID}/members", boards.GetBoardModTeamHandler(c))

// type BoardRole struct {
// 	Username string `json:"username"`
// 	Role     string `json:"role"`
// }

function DisplayAddMod({addModHandle}) {
	const [newMod, setNewMod] = useState("")
	const [error, setError] = useState(null)

	const onSubmit = (e) => {
		e.preventDefault()
		const error = addModHandle(newMod)
		setError(error)
		if (!error)
			setNewMod("")
	}

	return (
		<form onSubmit = {onSubmit}>
			<Button type = "submit">
				+
			</Button>
			<TextAreaTitle value = {newMod}
				setValue = {(value) => {setError(null); setNewMod(value)}}
				onEnter = {onSubmit}/>
			{error != null && error}
		</form>
	)
}

export default function DisplayMods({boardID}) {
	const [refreshKey, setRefreshKey] = useState(0)
	const [modTeam, setModTeam] = useState([])
	const [loading, setLoading] = useState(true)

	const refreshMods = () => {setRefreshKey(refreshKey + 1)}

	useEffect(() => {
		setLoading(true)
		const getMod = async () => {
			const res = await apiGet(`/board/${boardID}/members`);
			if (res.ok) {
				setModTeam(res.json)
				setLoading(false)
			}
		}
		getMod()
	}, [refreshKey])

	const addModHandle = (newMod) => {
		const res = apiPost(`/board/${boardID}/mod/${newMod}`)
		if (!res.ok) {
			console.log(res.status)
			return res.status
		}
		console.log(newMod + " succesfully aded")
		refreshMods()
		return null
	}

	if (loading) return "loading"
	console.log(modTeam)
	return (
		<div>
			{/* {thread.} */}
			<DisplayAddMod boardID = {boardID}
				addModHandle = {addModHandle}/>
		</div>
	)
}
