import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";

const Salut = () => {
	return (
		<div>Salut</div>
	)
}

export default function App() {
  return (
	<BrowserRouter future={{v7_relativeSplatPath: false}}>
	  <Routes>
		<Route path='/' element={<Register/>} />
		<Route path='/register' element={<Register/>} />
		<Route path='/login' element={<Login/>} />
		<Route path='/salut' element={<Salut/>} />
	  </Routes>
	</BrowserRouter>
	);
}
