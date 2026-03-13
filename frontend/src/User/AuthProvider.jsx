import { createContext, useContext, useState, useEffect } from "react";
import {apiGet, apiPost} from "../Utils/api"


const AuthContext = createContext();

export default function useAuth() {
	const context = useContext(AuthContext)
	if (context == null)
		throw (new Error("useAuth outside of AuthProvider"))
	return (context)
}


export function AuthProvider( { children } ) {
	const [user, setUser] = useState(null)

	const getUser = async () => {
		const res = await apiGet("/user/me")
		if (!res.ok) {
			setUser(null)
			// console.log(response.status)
		} else {
			// console.log(res.json)
			setUser(res.json)
		}
	}

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
		await getUser()
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
		await getUser()
	}

	const logout = async () => {
		const response = await apiPost('/logout')
		if (!response.ok) {
			throw (response.status)
		}
		setUser(null)
	}

	useEffect(() => {
		const getUserInit = async () => {
			try {
				await getUser();
			} catch (err) {
				// console.log("Setup getUser error: " + err)
			}
		}
		getUserInit()
	}, [])

	return (
		<AuthContext.Provider value = {{user, login, register, logout}}>
			{children}
		</AuthContext.Provider>
	)
}
