import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "./AuthProvider";
import useNotif	from "../components/Notif"
import { apiPut } from "../Utils/api";
import Loading from "../components/Loading";
import Button, {ButtonLink} from "../components/Button"
import TextInput from "../components/TextInput";

// r.Put("/user/{username}", users.UpdateUserHandler(c))
// type UserEdit struct {
// 	Login    string `json:"username"`
// 	Email    string `json:"email"`
// 	Password string `json:"password"`
// }

export default function UserPageEdit()
{
	const { usernameParam } = useParams()
	const notifHandler = useNotif()
	const userHandle = useAuth()
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true)
	const [username, setUsername] = useState("") 
	const [email, setEmail] = useState("") 

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) {
			notifHandler.pushError("You are not logged in")
			navigate(`/user/${usernameParam}`)
		} else if (userHandle.user.username != usernameParam) {
			notifHandler.pushError("You cannot edit another user")
			navigate(`/user/${usernameParam}`)
		} else {
			setUsername(userHandle.user.username)
			setEmail(userHandle.user.email)
			setLoading(false)
		}
	}, [userHandle.loading])

	const saveEdit = async () => {
		const res = await apiPut(`/user/id/${userHandle.user.id}`, {
			body: JSON.stringify({
				'username': username,
				'email': email,
			})
		})
		if (res.ok) {
			notifHandler.pushSuccess("User successfuly edited")
			userHandle.update()
			navigate(`/user/${username}`)
		} else {
			notifHandler.pushError(res.status)
		}
	}

	if (loading)
		return (<Loading/>)

	return (
		<div>
			{/* Editavatar */}
			<TextInput value = {username} onChange={setUsername}/>
			<TextInput value = {email} onChange={setEmail}/>
			<ButtonLink link = {`/user/${usernameParam}`}>
				Discard
			</ButtonLink>
			<Button onClick={saveEdit}>
				Save
			</Button>
		</div>
	)
}
