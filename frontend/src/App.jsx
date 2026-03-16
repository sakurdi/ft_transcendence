import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./User/AuthProvider";
import { NotifProvider } from "./components/Notif";

import Register from "./User/Register";
import Login from "./User/Login";
import Logout from "./User/Logout";
import UserPage from "./User/UserPage";

import {ButtonLink} from "./components/Button";
import NavBar from "./NavBar";
import CreateBoard from "./Board/CreateBoard";
import DisplayBoard from "./Board/DisplayBoard";
import ChangePassword from "./User/ChangePassword";

const Home = () => {
	return (
		<>
			<ButtonLink>Home</ButtonLink>
			<ButtonLink link="/login">Login</ButtonLink>
			<ButtonLink link="/register">Register</ButtonLink>
			<ButtonLink link="/logout">Logout</ButtonLink>
			<ButtonLink link="/createBoard">Create a new Board</ButtonLink>
			<ButtonLink link="/board/league">Board league</ButtonLink>
			<ButtonLink link="/changepassword">Change password</ButtonLink>
		</>
	)
}



export default function App() {
  return (
	<NotifProvider>
		<AuthProvider>
			<BrowserRouter future={{v7_relativeSplatPath: false}}>
				<NavBar/>
				<Routes>
					<Route path='/' element={<Home/>} />
					<Route path='/register' element={<Register/>} />
					<Route path='/login' element={<Login/>} />
					<Route path='/logout' element={<Logout/>} />
					<Route path="/user/:username" element={<UserPage />} />
					<Route path="/changepassword" element={<ChangePassword />} />
					<Route path='/createBoard' element={<CreateBoard/>} />
					<Route path='/board/:boardName' element={<DisplayBoard/>} />
					{/* <Route path='/post/:postID' element={<DisplayPost/>} /> */}
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	</NotifProvider>
	);
}
