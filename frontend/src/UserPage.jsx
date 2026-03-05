import { useParams } from "react-router-dom";
import { useEffect } from "react";
export default function UserPage() {
	const { username } = useParams()
	console.log(username)

	return (
		<div>
			{username}
		</div>
	)
}
