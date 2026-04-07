import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "./AuthProvider";
import useNotif	from "../components/Notif"
import { apiDelete, apiGet } from "../Utils/api";
import Loading from "../components/Loading";
import Button, { ButtonLink } from "../components/Button"
import TextButton from "../components/TextButton"
import { ProfileAvatar } from "../Chat/Friend";

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

export function UserSettings({username, userID, updateUser}) {
	const notifHandler = useNotif()
	const navigate = useNavigate();

	const deleteUser = async () => {
		if (window.confirm(`Are you sure you want to delete ${username}`)) {
			const res = await apiDelete(`/users/${userID}`);
			// console.log(res)
			if (!res.ok) {
				notifHandler.pushError(res.status)
			} else {
				notifHandler.pushSuccess(`The user ${username} has been deleted`)
				updateUser()
				navigate('/')
			}
		}
	}

	return (
	<>
		<Button onClick = {deleteUser}>
			Delete User
		</Button>
		<ButtonLink link = "/changepassword">
			Change password
		</ButtonLink>
	</>
	)
}

export default function UserPage() {
	const notifHandle = useNotif()
	const userHandle = useAuth()

	const { username } = useParams()
	const [refreshKey, setRefreshKey] = useState(0)
	const [loading, setLoading] = useState(true)
	const [edit, setEdit] = useState(false)
	const [userinfo, setUserinfo] = useState(null)

	const refreshPage = () => setRefreshKey(refreshKey + 1)
	const fetchUserinfo = async () => {
		const res = await apiGet(`/user/${username}`)
		if (res.ok) {
			setUserinfo(res.json)
		} else {
			notifHandle.pushError(res.status)
		}
		setLoading(false)
	}

	useEffect(() => {
		fetchUserinfo()
	}, [refreshKey, username])

	if (loading || userHandle.loading) return <Loading/>
	if (!userinfo) return "User does not exist"
	const canEdit = (userHandle.user?.username == userinfo.username) 
	console.log(userHandle.user)
	return (
		<div>
			<img src={userinfo.avatar_url}
					alt="avatar123"
					className="w-24 h-24 rounded-full object-cover border-2 border-stone-200"/>

			{canEdit && <ProfileAvatar onUploaded={fetchUserinfo}/>}

			{userinfo.username}
			<time dateTime = {userinfo.member_since}>
				{getStrTimeDate(userinfo.member_since)}
			</time>
			{canEdit &&
				<UserSettings username = {username}
					updateUser = {userHandle.update}
					userID = {userHandle.user.id}/>
			}
		</div>
	)
}
