import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "./AuthProvider";
import useNotif from "../components/Notif"
import { apiDelete, apiGet } from "../Utils/api";
import Loading from "../components/Loading";
import Button, { ButtonLink } from "../components/Button"
import Card from "../components/Card";
import ApiTokenPage from "./Api/ApiKeyPage";
import { SendRequestFromProfil } from "../Chat/Friend";

const getStrTimeDate = (dateISO) => {
	const dateAPI = new Date(dateISO);

	const time = dateAPI.toLocaleTimeString("fr-FR")
	const date = dateAPI.toLocaleDateString("fr-FR", { day: "numeric", month: "numeric", year: "2-digit" })
	return (time + " " + date)
}

export function UserSettings({ username, userID, updateUser }) {
	const notifHandler = useNotif()
	const navigate = useNavigate();

	const deleteUser = async () => {
		if (window.confirm(`Are you sure you want to permanently delete your account, ${username}? This cannot be undone.`)) {
			const res = await apiDelete(`/user/id/${userID}`);
			if (!res.ok) {
				notifHandler.pushError(res.status)
			} else {
				notifHandler.pushSuccess(`Account deleted successfully`)
				updateUser()
				navigate('/')
			}
		}
	}

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-bold text-surface-900">Account Settings</h3>
			<div className="flex flex-col gap-2">
				<ButtonLink link={`/user/${username}/edit`} variant="outline" className="justify-start">
					Edit Profile
				</ButtonLink>
				<ButtonLink link="/changepassword" variant="outline" className="justify-start">
					Change Password
				</ButtonLink>
				<Button onClick={deleteUser} variant="ghost" className="justify-start text-red-500 hover:bg-red-50">
					Delete Account
				</Button>
			</div>
		</div>
	)
}

export default function UserPage() {
	const notifHandle = useNotif()
	const userHandle = useAuth()
	const { username } = useParams()

	const [loading, setLoading] = useState(true)
	const [userinfo, setUserinfo] = useState(null)
	const [refreshKey, setRefreshKey] = useState(0)

	useEffect(() => {
		const fetchUserinfo = async () => {
			setLoading(true)
			const res = await apiGet(`/user/${username}`)
			if (res.ok) {
				setUserinfo(res.json)
			} else {
				notifHandle.pushError(res.status || "User not found")
			}
			setLoading(false)
		}
		fetchUserinfo()
	}, [username, refreshKey])

	if (loading || userHandle.loading) return <div className="p-12"><Loading /></div>
	if (!userinfo) return <div className="p-12 text-center text-surface-500">User not found</div>

	const isOwner = userHandle.user?.username === userinfo.username
	const isLoggedIn = !!userHandle.user

	return (
		<div className="py-12">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Left Column: Profile Card */}
					<div className="md:col-span-1">
						<Card>
							<div className="flex flex-col items-center text-center">
								<div className="relative mb-4">
									<img
										src={userinfo.avatar_url || "/api/uploads/avatars/default.jpg"}
										alt={userinfo.username}
										className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
									/>
									<span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
								</div>
								<h2 className="text-2xl font-bold text-surface-900 mb-1">{userinfo.username}</h2>
								<p className="text-sm text-surface-500 mb-4 capitalize">{userinfo.role}</p>

								<div className="w-full border-t border-surface-100 pt-4 mt-2">
									<div className="flex justify-between text-sm mb-2">
										<span className="text-surface-400">Joined</span>
										<span className="text-surface-900 font-medium">{getStrTimeDate(userinfo.member_since)}</span>
									</div>
								</div>

								{!isOwner && isLoggedIn && (
									<div className="w-full pt-6">
										<SendRequestFromProfil newFriendId={userinfo.username} />
									</div>
								)}
							</div>
						</Card>
					</div>

					{/* Right Column: Settings & API Keys */}
					<div className="md:col-span-2 space-y-8">
						{isOwner ? (
							<>
								<div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-soft">
									<UserSettings
										username={username}
										userID={userHandle.user.id}
										updateUser={userHandle.update}
									/>
								</div>

								<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
									<h3 className="text-lg font-bold text-gray-900 mb-4">API Management</h3>
									<p className="text-sm text-gray-500 mb-6">
										Generate and manage API keys to access our public endpoints.
									</p>
									<ApiTokenPage />
								</div>
							</>
						) : (
							<div className="bg-white rounded-2xl border border-surface-200 p-8 shadow-soft text-center">
								<div className="text-4xl mb-4">👋</div>
								<h3 className="text-xl font-bold text-surface-900 mb-2">About {userinfo.username}</h3>
								<p className="text-surface-500 leading-relaxed">
									This user is a valued member of the FT_TRANSCENDENCE community.
									Check back later for more profile details and activity.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
