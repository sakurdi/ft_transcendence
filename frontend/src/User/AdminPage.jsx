import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "./AuthProvider"
import useNotif from "../components/Notif"
import { apiGet, apiPut, apiDelete } from "../Utils/api"
import Loading from "../components/Loading"

const ROLES = ["user", "superadmin", "banned"]

function roleBadge(role) {
	switch (role) {
		case "superadmin":
			return "bg-violet-500/15 text-violet-300 border border-violet-500/25"
		case "banned":
			return "bg-red-500/15 text-red-400 border border-red-500/25"
		default:
			return "bg-g_seagreen/15 text-g_seagreen border border-g_seagreen/25"
	}
}

function UserRow({ user, onRoleChanged, onDeleted }) {
	const notifHandle = useNotif()
	const [selectedRole, setSelectedRole] = useState(user.role)
	const [applying, setApplying] = useState(false)

	const applyRole = async () => {
		if (selectedRole === user.role) return
		setApplying(true)
		const res = await apiPut(`/users/${user.id}/role`, {
			body: JSON.stringify({ role: selectedRole })
		})
		setApplying(false)
		if (res.ok) {
			notifHandle.pushSuccess(`${user.username}'s role set to ${selectedRole}`)
			onRoleChanged(user.id, selectedRole)
		} else {
			notifHandle.pushError(res.status ?? "Failed to update role")
			setSelectedRole(user.role)
		}
	}

	const deleteUser = async () => {
		if (!window.confirm(`Delete user "${user.username}"? This cannot be undone.`)) return
		const res = await apiDelete(`/users/${user.id}`)
		if (res.ok) {
			notifHandle.pushSuccess(`User "${user.username}" deleted`)

			onDeleted(user.id)
		} else {
			notifHandle.pushError(res.status ?? "Failed to delete user")
		}
	}

	const joined = new Date(user.member_since).toLocaleDateString("en-GB", {
		day: "numeric", month: "short", year: "numeric"
	})

	return (
		<div className="flex items-center gap-3 py-3.5 border-b border-white/6 last:border-0
			flex-wrap sm:flex-nowrap">

			{/* Avatar placeholder + username */}
			<div className="flex items-center gap-3 flex-1 min-w-0">
				<div className="w-8 h-8 rounded-full bg-[#2a2a38] border border-white/8 flex-shrink-0
					flex items-center justify-center text-xs font-bold text-[#8a8aa8]">
					{user.username[0].toUpperCase()}
				</div>
				<div className="min-w-0">
					<p className="text-sm font-semibold text-[#eaeaf4] truncate">{user.username}</p>
					<p className="text-xs text-[#6b6b85]">#{user.id} · {joined}</p>
				</div>
			</div>

			{/* Current role badge */}
			<span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${roleBadge(user.role)}`}>
				{user.role}
			</span>

			{/* Role selector */}
			<div className="flex items-center gap-1.5 flex-shrink-0">
				<select
					value={selectedRole}
					onChange={e => setSelectedRole(e.target.value)}
					className="bg-[#1a1a24] text-[#c8c8e8] text-xs border border-white/10 rounded-lg
						px-2 py-1.5 focus:outline-none focus:border-g_seagreen/50 cursor-pointer
						transition-all duration-150">
					{ROLES.map(r => (
						<option key={r} value={r}>{r}</option>
					))}
				</select>
				<button
					onClick={applyRole}
					disabled={applying || selectedRole === user.role}
					className="px-3 py-1.5 rounded-lg text-xs font-semibold
						bg-g_seagreen text-white hover:bg-g_seagreen-600
						disabled:opacity-40 disabled:cursor-not-allowed
						transition-all duration-150 active:scale-[0.97]">
					{applying ? "…" : "Apply"}
				</button>
			</div>

			{/* Delete */}
			<button
				onClick={deleteUser}
				className="w-7 h-7 flex items-center justify-center flex-shrink-0
					rounded-lg text-xs text-red-400 border border-red-500/20
					hover:bg-red-500/10 hover:border-red-500/40
					transition-all duration-150">
				✕
			</button>
		</div>
	)
}

export default function AdminPage() {
	const navigate = useNavigate()
	const userHandle = useAuth()
	const notifHandle = useNotif()

	const [users, setUsers] = useState(null)
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState("")

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) { navigate("/"); return }
		if (userHandle.user.role !== "superadmin") {
			notifHandle.pushError("Access denied")
			navigate("/")
			return
		}
		const fetchUsers = async () => {
			const res = await apiGet("/users")
			if (res.ok) setUsers(Array.isArray(res.json) ? res.json : [])
			else notifHandle.pushError("Failed to load users")
			setLoading(false)
		}
		fetchUsers()
	}, [userHandle.loading])

	const handleRoleChanged = (id, newRole) => {
		setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
	}

	const handleDeleted = (id) => {
		setUsers(prev => prev.filter(u => u.id !== id))
		if (id == userHandle.user.id) {
			userHandle.update()
		}
	}

	if (userHandle.loading || loading) return (
		<div className="flex justify-center py-24"><Loading /></div>
	)

	const filtered = (users ?? []).filter(u =>
		u.username.toLowerCase().includes(search.toLowerCase())
	)

	const counts = {
		total: users?.length ?? 0,
		superadmin: users?.filter(u => u.role === "superadmin").length ?? 0,
		banned: users?.filter(u => u.role === "banned").length ?? 0,
	}

	return (
		<div className="max-w-3xl mx-auto space-y-5">
			{/* Header */}
			<div className="glass rounded-2xl p-6">
				<div className="flex items-start justify-between gap-4 flex-wrap">
					<div>
						<h1 className="text-xl font-bold text-[#eaeaf4] tracking-tight mb-1">
							Admin Panel
						</h1>
						<p className="text-sm text-[#7878a0]">Manage users, roles, and access</p>
					</div>
					<div className="flex items-center gap-4 text-center">
						<div>
							<p className="text-lg font-bold text-[#eaeaf4]">{counts.total}</p>
							<p className="text-xs text-[#6b6b85]">Total</p>
						</div>
						<div className="w-px h-8 bg-white/8" />
						<div>
							<p className="text-lg font-bold text-violet-300">{counts.superadmin}</p>
							<p className="text-xs text-[#6b6b85]">Admins</p>
						</div>
						<div className="w-px h-8 bg-white/8" />
						<div>
							<p className="text-lg font-bold text-red-400">{counts.banned}</p>
							<p className="text-xs text-[#6b6b85]">Banned</p>
						</div>
					</div>
				</div>
			</div>

			{/* User list */}
			<div className="glass rounded-2xl p-6">
				<div className="flex items-center gap-3 mb-5">
					<input
						type="text"
						placeholder="Search users…"
						value={search}
						onChange={e => setSearch(e.target.value)}
						className="flex-1 bg-[#1a1a24] text-[#eaeaf4] border border-white/8 rounded-xl
							px-3 py-2 text-sm placeholder-[#46465a]
							focus:outline-none focus:border-g_seagreen/50 transition-all duration-150"
					/>
					<span className="text-xs text-[#6b6b85] flex-shrink-0">
						{filtered.length} / {counts.total}
					</span>
				</div>

				{filtered.length === 0 ? (
					<p className="text-sm text-[#6b6b85] text-center py-8">No users found.</p>
				) : (
					filtered.map(user => (
						<UserRow
							key={user.id}
							user={user}
							onRoleChanged={handleRoleChanged}
							onDeleted={handleDeleted}
						/>
					))
				)}
			</div>
		</div>
	)
}
