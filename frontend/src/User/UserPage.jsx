import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "./AuthProvider";
import useNotif	from "../components/Notif"
import { apiGet } from "../Utils/api";
import Loading from "../components/Loading";
import Button, { ButtonLink } from "../components/Button"
import TextButton from "../components/TextButton"

const getStrTimeDate = (dateISO) => {
	const dateAPI = new Date(dateISO);
	
	const time = dateAPI.toLocaleTimeString("fr-FR")
	const date = dateAPI.toLocaleDateString("fr-FR", { day: "numeric", month: "numeric", year: "2-digit"})
	return (time + " " + date)
}


// r.Put("/user/{username}", users.UpdateUserHandler(c))
// r.Delete("/users/{userID}", users.DeleteUserHandler(c))
// type UserEdit struct {
// 	Login    string `json:"username"`
// 	Email    string `json:"email"`
// 	Password string `json:"password"`
// }

export default function UserPage() {
	const notifHandle = useNotif()
	const userHandle = useAuth()

	const { username } = useParams()
	const [refreshKey, setRefreshKey] = useState(0)
	const [loading, setLoading] = useState(true)
	const [canEdit, setCanEdit] = useState(false)
	const [edit, setEdit] = useState(false)
	const [userinfo, setUserinfo] = useState(null)

	const refreshPage = () => setRefreshKey(refreshKey + 1)

	useEffect(() => {
		if (userHandle.loading) return
		const fetchUserinfo = async (username) => {
			const res = await apiGet(`/user/${username}`)
			if (res.ok) {
				setUserinfo(res.json)
				setCanEdit(res.json.username === userHandle.user?.username)
			} else {
				notifHandle.pushError(res.status)
			}
		}
		if (userHandle.user?.username === username)
			setCanEdit(true)
		fetchUserinfo(username)
		setLoading(false)
	}, [refreshKey, userHandle.loading])

	if (loading || userHandle.loading) return <Loading/>
	if (!userinfo) return "User does not exist"

	console.log(userinfo)
	console.log(userHandle.user)

	return (
		<div>
			<image src={userinfo.avatar_url}/>
			{userinfo.username}
			<time dateTime = {userinfo.member_since}>
				{getStrTimeDate(userinfo.member_since)}
			</time>
			{canEdit &&
				<>
					<Button>
						Delete User
					</Button>
					<ButtonLink link = "/changepassword">
						Change password
					</ButtonLink>
				</>
			}
		</div>
	)
}
