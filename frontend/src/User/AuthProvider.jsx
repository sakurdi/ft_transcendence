import { createContext, useContext, useState, useEffect } from "react";
import {apiGet, apiPost} from "../Utils/api"
import useNotif from "../components/Notif";

const AuthContext = createContext();

export default function useAuth() {
	const context = useContext(AuthContext)
	if (context == null)
		throw (new Error("useAuth outside of AuthProvider"))
	return (context)
}


export function AuthProvider( { children } ) {
	const notifHandle = useNotif()

	const [loading, setLoading] = useState(true)
	const [user, setUser] = useState(null)
	const [refreshUser, setRefreshUser] = useState(0)

	const update = () => { setRefreshUser(refreshUser + 1) }

	const login = async (username, password) => {
		const res = await apiPost('/login', {
			body: JSON.stringify({
				'username': username,
				'password': password
			})
		})
		if (!res.ok) {
			throw (res.status)
		}
		update()
	}

	const register = async (username, email, password) => {
		const response = await apiPost('/register', {
			body: JSON.stringify({
				'username': username,
				'Email': email,
				'Password': password,
			})
		})
		if (!response.ok) {
			throw (await response.status)
		}
		update()
	}

	const logout = async () => {
		const response = await apiPost('/logout')
		if (!response.ok) {
			throw (response.status)
		}
		setUser(null)
	}

	useEffect(() => {
		setLoading(true)
		const getUser = async () => {
			const res = await apiGet("/user/me")
			if (!res.ok) {
				setUser(null)
			} else {
				setUser(res.json)
			}
		}
		getUser()
		setLoading(false)
	}, [refreshUser])

	return (
		<AuthContext.Provider value = {{user, loading, update, login, register, logout}}>
			{children}
		</AuthContext.Provider>
	)
}
