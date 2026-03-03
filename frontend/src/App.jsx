import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import Register from "./Register";
import Login from "./Login";
import LogoutPage from "./Logout";
import ShowSession from "./ShowSession";
import UserPage from "./UserPage";
import {ButtonLink} from "./components/Button";
import NavBar from "./NavBar";

const Home = () => {
	return (
		<>
			<ButtonLink>Home</ButtonLink>
			<ButtonLink link="/login">Login</ButtonLink>
			<ButtonLink link="/register">Register</ButtonLink>
			<ButtonLink link="/logout">Logout</ButtonLink>
			<ButtonLink link="/ShowSession">ShowSession</ButtonLink>
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
			</Routes>
		</BrowserRouter>
	</AuthProvider>
	);
}
