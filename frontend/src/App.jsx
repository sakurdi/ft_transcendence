import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./UserHandle/AuthProvider";
import Register from "./UserHandle/Register";
import Login from "./UserHandle/Login";
import LogoutPage from "./UserHandle/Logout";
import ShowSession from "./UserHandle/ShowSession";
import UserPage from "./UserHandle/UserPage";

import {ButtonLink} from "./components/Button";
import NavBar from "./NavBar";
import CreateBoard from "./Board/CreateBoard";
import DisplayBoard from "./Board/DisplayBoard";

const Home = () => {
	return (
		<>
			<ButtonLink>Home</ButtonLink>
			<ButtonLink link="/login">Login</ButtonLink>
			<ButtonLink link="/register">Register</ButtonLink>
			<ButtonLink link="/logout">Logout</ButtonLink>
			<ButtonLink link="/ShowSession">ShowSession</ButtonLink>
			<ButtonLink link="/createBoard">Create a new Board</ButtonLink>
			<ButtonLink link="/board/pipi">Board pipi</ButtonLink>
		</>
	)
}



export default function App() {
  return (
	<AuthProvider>
		<BrowserRouter future={{v7_relativeSplatPath: false}}>
			<NavBar/>
			<Routes>
				<Route path='/' element={<Home/>} />
				<Route path='/register' element={<Register/>} />
				<Route path='/login' element={<Login/>} />
				<Route path='/logout' element={<LogoutPage/>} />
				<Route path="/user/:username" element={<UserPage />} />
				<Route path='/ShowSession' element={<ShowSession/>} />
				<Route path='/createBoard' element={<CreateBoard/>} />
				<Route path='/board/:boardName' element={<DisplayBoard/>} />
				<Route path='/board/:boardName/thread/:threadID' element={<DisplayBoard/>} />
			</Routes>
		</BrowserRouter>
	</AuthProvider>
	);
}


