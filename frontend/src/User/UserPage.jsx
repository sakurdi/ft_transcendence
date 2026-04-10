import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "./AuthProvider";
import useNotif from "../components/Notif"
import { apiDelete, apiGet } from "../Utils/api";
import Loading from "../components/Loading";
import { ButtonLink } from "../components/Button"
import ApiTokenPage from "./Api/ApiKeyPage";
import { SendRequestFromProfil } from "../Chat/Friend";

const getStrTimeDate = (dateISO) => {
	const d = new Date(dateISO)
	return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function UserSettings({ username, userID, updateUser }) {
	const notifHandler = useNotif()
	const navigate = useNavigate()

	const deleteUser = async () => {
		if (window.confirm(`Are you sure you want to delete ${username}?`)) {
			const res = await apiDelete(`/user/id/${userID}`)
			if (!res.ok) {
				notifHandler.pushError(res.status)
			} else {
				notifHandler.pushSuccess(`User ${username} deleted`)
				updateUser()
				navigate('/')
			}
		}
	}

	return (
		<div className="flex flex-wrap gap-2 mt-4">
			<ButtonLink link={`/user/${username}/edit`} className="text-xs">
				Edit Profile
			</ButtonLink>
			<ButtonLink link="/changepassword" className="text-xs">
				Change Password
			</ButtonLink>
			<button
				onClick={deleteUser}
				className="px-3 py-1.5 rounded-lg text-xs font-medium
					text-red-400 border border-red-500/25 bg-red-500/5
					hover:bg-red-500/12 hover:border-red-500/40
					transition-all duration-150">
				Delete Account
			</button>
		</div>
	)
}

export default function UserPage() {
	const notifHandle = useNotif()
	const userHandle = useAuth()

	const { username } = useParams()
	const [refreshKey] = useState(0)
	const [loading, setLoading] = useState(true)
	const [userinfo, setUserinfo] = useState(null)

	const fetchUserinfo = async () => {
		const res = await apiGet(`/user/${username}`)
		if (res.ok) setUserinfo(res.json)
		else notifHandle.pushError(res.status)
		setLoading(false)
	}

	useEffect(() => { fetchUserinfo() }, [refreshKey, username])

	if (loading || userHandle.loading) return <Loading />
	if (!userinfo) return (
		<div className="flex flex-col items-center justify-center py-24 gap-3">
			<p className="text-[#55556a] text-lg">User not found</p>
		</div>
	)

	const canEdit = userHandle.user?.username === userinfo.username
	const loggedIn = !userHandle.loading && userHandle.user != null

	return (
		<div className="max-w-xl mx-auto space-y-5">
			{/* Profile card */}
			<div className="glass rounded-2xl p-6">
				<div className="flex items-start gap-5">
					{userinfo.avatar_url ? (
						<img src={userinfo.avatar_url} alt={`${userinfo.username} avatar`}
							className="w-20 h-20 rounded-2xl object-cover border border-white/12
								shadow-lg shadow-black/30 flex-shrink-0" />
					) : (
						<div className="w-20 h-20 rounded-2xl glass-elevated border border-white/12
							flex items-center justify-center text-g_seagreen text-3xl font-black uppercase
							flex-shrink-0 shadow-lg shadow-black/30">
							{userinfo.username?.[0]}
						</div>
					)}

					<div className="flex-1 min-w-0">
						<h1 className="text-xl font-bold text-[#eaeaf4] tracking-tight">
							{userinfo.username}
						</h1>
						<time dateTime={userinfo.member_since}
							className="text-xs text-[#55556a] mt-1 block">
							Member since {getStrTimeDate(userinfo.member_since)}
						</time>

						{canEdit && (
							<UserSettings
								username={username}
								updateUser={userHandle.update}
								userID={userHandle.user.id}
							/>
						)}

						{!canEdit && loggedIn && (
							<div className="mt-4">
								<SendRequestFromProfil newFriendId={username} />
							</div>
						)}
					</div>
				</div>
			</div>

			{canEdit && (
				<div className="glass rounded-2xl p-6">
					<h2 className="text-xs font-semibold text-[#55556a] uppercase tracking-wider mb-4">
						API Keys
					</h2>
					<ApiTokenPage />
				</div>
			)}
		</div>
	)
}
