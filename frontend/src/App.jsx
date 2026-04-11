import ChangePassword from "./User/ChangePassword";
import Register from "./User/Register";
import Login from "./User/Login";
import Logout from "./User/Logout";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./User/AuthProvider";
import { useEffect } from "react";
import useNotif, { NotifProvider } from "./components/Notif";

import UserPage from "./User/UserPage";
import UserPageEdit from "./User/UserPageEdit";
import PostPage from "./Board/DisplayPost/PostPage";

import NavBar from "./NavBar";
import Layout from "./components/Layout";
import CreateBoard from "./Board/CreateBoard";
import DisplayBoard from "./Board/DisplayBoard";
import AdminPage from "./User/AdminPage";
import { FriendChat } from "./Chat/Friend";
import BoardList from "./Board/DisplayBoardSearch";
import Loading from "./components/Loading";

import PrivacyPage from "./Privacy/Privacy";
import TermOfServicePage from "./Privacy/TermOfService.jsx"
import Contact from "./Privacy/Contact.jsx";
import FooterTOS from "./Privacy/Footer.jsx"

const Home = () => {
	return (
		<Layout>
			<div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center">
				<div>
					<h1 className="text-4xl font-bold text-[#eaeaf4] mb-3 tracking-tight">
						Welcome to <span className="text-g_seagreen">ft_transcendence</span>
					</h1>
					<p className="text-[#9898b8] text-lg max-w-md mx-auto">
						A simple discussion platform
					</p>
				</div>
				<div className="flex gap-4 flex-wrap justify-center">
					<a href="/board"
						className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
							bg-g_seagreen text-white font-semibold text-sm
							hover:bg-g_seagreen-600 transition-all duration-150 active:scale-[0.97]
							shadow-lg shadow-g_seagreen/25">
						Browse Boards
					</a>
					<a href="/createBoard"
						className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
							glass text-[#eaeaf4] font-semibold text-sm
							hover:bg-white/10 hover:border-white/20
							transition-all duration-150 active:scale-[0.97]">
						Create a Board
					</a>
				</div>
			</div>
			<FriendChat />
			<FooterTOS/>
		</Layout>
	)
}

function NoRouteFound() {
	const navigate = useNavigate()
	const notifHandle = useNotif()
	useEffect(() => {
		notifHandle.pushNotif("Page not found")
		navigate('/')
	}, [])
	return (<Loading/>)
}

export default function App() {
  return (
	<NotifProvider>
		<AuthProvider>
			<BrowserRouter future={{ v7_relativeSplatPath: false, v7_startTransition: true }}>
				<NavBar/>
				<Routes>
					<Route path='/' element={<Home/>} />
					<Route path='/register' element={<Layout><Register/></Layout>} />
					<Route path='/login' element={<Layout><Login/></Layout>} />
					<Route path='/logout' element={<Logout/>} />
					<Route path="/changepassword" element={<Layout><ChangePassword /></Layout>} />

					<Route path='/createBoard' element={<Layout><CreateBoard/></Layout>} />
					<Route path='/board' element={<Layout><BoardList/></Layout>} />
					<Route path="/user/:username" element={<Layout><UserPage /></Layout>} />
					<Route path="/user/:usernameParam/edit" element={<Layout><UserPageEdit /></Layout>} />
					<Route path='/board/:boardName' element={<Layout><DisplayBoard/></Layout>} />
					<Route path='/post/:postID' element={<Layout><PostPage/></Layout>} />
					<Route path='/admin' element={<Layout><AdminPage /></Layout>} />
					<Route path='/privacy' element={<Layout><PrivacyPage/></Layout>} />
					<Route path='/termofservice' element={<Layout><TermOfServicePage/></Layout>} />
					<Route path='/contact' element={<Layout><Contact/></Layout>} />

					<Route path='*' element={<NoRouteFound/>} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	</NotifProvider>
	);
}
