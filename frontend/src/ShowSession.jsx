import useAuth from "./AuthProvider"

export default function ShowSession() {
	const userHandle = useAuth()
	const user = userHandle.user

	if (user) {
		return (
			<>
				<div>{user.username}</div>
				<div>{user.email}</div>
				<div>{user.id}</div>
				<div>{user.created_at}</div>
			</>
		)
	} else {
		return (
			<div>
				Not Logged in
			</div>
		)
	}
}
