import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "./User/AuthProvider"
import { LogoutButton } from "./User/Logout"
import Loading from "./components/Loading"

const NavLink = ({ link, children, accent = false }) => {
	const navigate = useNavigate()
	return (
		<button
			onClick={() => navigate(link)}
			className={`
				inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium
				transition-all duration-150 focus-visible:outline-none
				focus-visible:ring-2 focus-visible:ring-g_seagreen/40
				${accent
					? "bg-g_seagreen text-white hover:bg-g_seagreen-600 active:scale-[0.97] shadow-md shadow-g_seagreen/25"
					: "text-[#9898b8] hover:text-[#eaeaf4] hover:bg-white/8"
				}
			`}
		>
			{children}
		</button>
	)
}

function NavBarUser({ username }) {
	const navigate = useNavigate()
	return (
		<div className="ml-auto flex items-center gap-2">
			<button
				onClick={() => navigate(`/user/${username}`)}
				className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
					text-[#9898b8] hover:text-[#eaeaf4] hover:bg-white/8 transition-all duration-150"
			>
				<span className="w-6 h-6 rounded-full bg-g_seagreen/20 border border-g_seagreen/40
					text-g_seagreen text-xs font-bold flex items-center justify-center uppercase">
					{username?.[0] ?? "U"}
				</span>
				{username}
			</button>
			<LogoutButton />
		</div>
	)
}

function NavBarLogin() {
	const navigate = useNavigate()
	return (
		<div className="ml-auto flex items-center gap-2">
			<button
				onClick={() => navigate("/login")}
				className="px-3 py-1.5 rounded-lg text-sm font-medium text-[#9898b8]
					hover:text-[#eaeaf4] hover:bg-white/8 transition-all duration-150"
			>
				Login
			</button>
			<button
				onClick={() => navigate("/register")}
				className="px-4 py-1.5 rounded-xl text-sm font-semibold
					bg-g_seagreen text-white hover:bg-g_seagreen-600
					transition-all duration-150 active:scale-[0.97]
					shadow-md shadow-g_seagreen/25"
			>
				Register
			</button>
		</div>
	)
}

export default function NavBar() {
	const userHandle = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (userHandle.loading) return
	}, [userHandle.loading])

	const NavBarHandle = (user) => {
		if (userHandle.loading) return <Loading />
		if (user) return <NavBarUser username={user.username} />
		return <NavBarLogin />
	}

	return (
		<header className="sticky top-0 z-40 w-full glass-nav">
			<nav className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-4">

				{/* Brand */}
				<button
					onClick={() => navigate("/")}
					className="mr-4 flex items-center gap-2.5 font-bold text-lg
						tracking-tight text-[#eaeaf4] hover:text-g_seagreen transition-colors duration-150"
				>
					<span className="w-7 h-7 rounded-lg bg-g_seagreen/20 border border-g_seagreen/35
						flex items-center justify-center text-g_seagreen text-sm font-black
						shadow-md shadow-g_seagreen/20">
						ft_
					</span>
					transcendence
				</button>

				<NavLink link="/board">Boards</NavLink>
				<NavLink link="/createBoard">New Board</NavLink>
				<NavLink link="/api-docs">API Docs</NavLink>
				{userHandle.user?.role === "superadmin" && (
					<NavLink link="/admin">Admin</NavLink>
				)}

				{NavBarHandle(userHandle.user)}
			</nav>
		</header>
	)
}
