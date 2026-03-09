import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./User/AuthProvider";
import Register from "./User/Register";
import Login from "./User/Login";
import LogoutPage from "./User/Logout";
import ShowSession from "./User/ShowSession";
import UserPage from "./User/UserPage";

import { useState, useRef, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import {ButtonLink} from "./components/Button";
import NavBar from "./NavBar";
import CreateBoard from "./Board/CreateBoard";
import DisplayBoard from "./Board/DisplayBoard";

const BASE = "https://localhost:1043/api"
const WS   = "wss://localhost:1043"

// ── api ───────────────────────────────────────────────────────────────────────

async function api(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
    })
    const text = await res.text()
    return { ok: res.ok, status: res.status, body: text }
}

function timestamp() {
    return new Date().toLocaleTimeString()
}

// ── useLog ────────────────────────────────────────────────────────────────────

function useLog() {
    const [entries, setEntries] = useState([])
    function push(msg, type = "info") {
        setEntries(prev => [...prev, { msg, type, time: timestamp() }])
    }
    return { entries, push }
}

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
