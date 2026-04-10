import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "./AuthProvider";
import useNotif from "../components/Notif"
import { apiPut, apiGet } from "../Utils/api";
import Loading from "../components/Loading";
import Button, { ButtonLink } from "../components/Button"
import { ProfileAvatar } from "../Chat/Friend";

export default function UserPageEdit() {
	const { usernameParam } = useParams()
	const notifHandler = useNotif()
	const userHandle = useAuth()
	const navigate = useNavigate()
	const [loading, setLoading] = useState(true)
	const [username, setUsername] = useState("")
	const [email, setEmail] = useState("")

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) {
			notifHandler.pushError("You are not logged in")
			navigate(`/user/${usernameParam}`)
		} else if (userHandle.user.username !== usernameParam) {
			notifHandler.pushError("You cannot edit another user's profile")
			navigate(`/user/${usernameParam}`)
		} else {
			setUsername(userHandle.user.username)
			setEmail(userHandle.user.email)
			setLoading(false)
		}
	}, [userHandle.loading])

	const fetchUserinfo = async () => {
		await apiGet(`/user/${username}`)
	}

	const saveEdit = async () => {
		const res = await apiPut(`/user/id/${userHandle.user.id}`, {
			body: JSON.stringify({ 'username': username, 'email': email })
		})
		if (res.ok) {
			notifHandler.pushSuccess("Profile updated")
			userHandle.update()
			navigate(`/user/${username}`)
		} else {
			notifHandler.pushError(res.status)
		}
	}

	if (loading) return <Loading />

	return (
		<div className="max-w-xl mx-auto space-y-5">
			<div>
				<h1 className="text-2xl font-bold text-[#eaeaf4] tracking-tight">Edit Profile</h1>
				<p className="text-[#9898b8] text-sm mt-1">Update your account information.</p>
			</div>

			<div className="glass rounded-2xl p-6 space-y-5">
				<div className="space-y-1.5">
					<label className="block text-xs font-semibold text-[#9898b8] uppercase tracking-wider">
						Username
					</label>
					<input type="text" value={username} onChange={e => setUsername(e.target.value)}
						placeholder="Username" />
				</div>
				<div className="space-y-1.5">
					<label className="block text-xs font-semibold text-[#9898b8] uppercase tracking-wider">
						Email
					</label>
					<input type="email" value={email} onChange={e => setEmail(e.target.value)}
						placeholder="Email" />
				</div>
				<div className="flex gap-3 pt-2">
					<Button onClick={saveEdit} className="shadow-md shadow-g_seagreen/20">
						Save Changes
					</Button>
					<ButtonLink link={`/user/${usernameParam}`}>
						Discard
					</ButtonLink>
				</div>
			</div>

			<div className="glass rounded-2xl p-6">
				<h2 className="text-xs font-semibold text-[#55556a] uppercase tracking-wider mb-4">
					Profile Picture
				</h2>
				<ProfileAvatar onUploaded={fetchUserinfo} />
			</div>
		</div>
	)
}
