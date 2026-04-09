import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "./AuthProvider";
import useNotif	from "../components/Notif"
import { apiDelete, apiGet } from "../Utils/api";
import Loading from "../components/Loading";
import Button from "../components/Button"
import ApiTokenPage from "./Api/ApiKeyPage";

// r.Put("/user/{username}", users.UpdateUserHandler(c))
// type UserEdit struct {
// 	Login    string `json:"username"`
// 	Email    string `json:"email"`
// 	Password string `json:"password"`
// }

export default function UserPageEdit({})
{
	const notifHandler = useNotif()
	const userHandle = useAuth()
	const navigate = useNavigate();
	const { usernameParam } = useParams()
	const [loading, setLoading] = useState(true)
	const [username, setUsername] = useState("") 
	const [email, setEmail] = useState("") 

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) {
			notifHandler.pushError("You are not logged in")
			navigate(`/user/${usernameParam}`)
		}else if (userHandle.user.username != usernameParam) {
			notifHandler.pushError("You cannot edit another user")
			navigate(`/user/${usernameParam}`)
		} else {
			setUsername(userHandle.user.username)
			setEmail(userHandle.user.email)
			setLoading(true)
		}
	}, [userHandle.loading])

	if (loading)
		return (<Loading/>)
}
