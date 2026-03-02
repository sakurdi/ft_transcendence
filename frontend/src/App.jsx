import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Logout from "./Logout";
import ShowSession from "./ShowSession";
import {ButtonLink} from "./components/Button";

const Home = () => {
	return (
		<>
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
	<BrowserRouter future={{v7_relativeSplatPath: false}}>
	  <Routes>
		<Route path='/' element={<Home/>} />
		<Route path='/register' element={<Register/>} />
		<Route path='/login' element={<Login/>} />
		<Route path='/logout' element={<Logout/>} />
		<Route path='/ShowSession' element={<ShowSession/>} />
	  </Routes>
	</BrowserRouter>
	);
}
