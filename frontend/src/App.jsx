import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./Register/Register";

const Salut = () => {
	return (
		<div>Salut</div>
	)
}

export default function App() {
  return (
	<BrowserRouter>
	  <Routes>
		<Route path='/' element={<Register/>} />
		<Route path='/register' element={<Register/>} />
		<Route path='/salut' element={<Salut/>} />
	  </Routes>
	</BrowserRouter>
	);
}
