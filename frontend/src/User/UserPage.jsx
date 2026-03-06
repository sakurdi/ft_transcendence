import { useParams } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "./AuthProvider";

function ParamUser () {
	const userHandle = useAuth() 
}

export default function UserPage() {
	const { username } = useParams()
	console.log(username)

	if (username === "me") {
		return <ParamUser/>
	}
	return (
		<div>
			{username}
		</div>
	)
}
