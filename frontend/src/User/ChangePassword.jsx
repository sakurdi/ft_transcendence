import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "./AuthProvider";
import useNotif	from "../components/Notif"
import { apiGet } from "../Utils/api";



export default function ChangePassword() {
	const notifHandle = useNotif()
	const userHandle = useAuth()
	const navigate = useNavigate()

	const [userinfo, setUserinfo] = useState(null)
	const [pwInfo, setPwInfo] = useState( {p1: "", p2: ""} )
	console.log(userHandle)

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) {
			notifHandle.pushError("You are not logged in")
			navigate('/')
		}
		setLoading(false)
	}, [userHandle.loading])

	if (userHandle.loading) return "Loading"

	return (
		<></>
	)
}
