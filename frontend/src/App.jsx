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
			<NavBar/>
			<ButtonLink text="Home"/>
			<ButtonLink link="/login" text="Login"/>
			<ButtonLink link="/register" text="Register"/>
			<ButtonLink link="/logout" text="Logout"/>
			<ButtonLink link="/ShowSession" text="ShowSession"/>
		</>
	)
}



export default function App() {
  return (
	<AuthProvider>
		<BrowserRouter future={{v7_relativeSplatPath: false}}>
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
