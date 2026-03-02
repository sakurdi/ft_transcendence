import { useParams } from "react-router-dom";

export default function UserPage() {
	const { username } = useParams()
	return (
		<div>
			{username}
		</div>
	)
}
