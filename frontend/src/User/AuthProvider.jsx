import { createContext, useContext, useState, useEffect } from "react";
import {apiGet, apiPost} from "../Utils/api"


const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);
export default useAuth


export function AuthProvider( { children } ) {
	const [user, setUser] = useState(null)

	const getUser = async () => {
		const res = await apiGet("/user/me")
		if (!res.ok) {
			setUser(null)
			console.log(response.status)
		} else {
			console.log(res.json)
			setUser(res.json)
		}
	}

	const login = async (username, password) => {
		const res = apiPost('/login', {
			body: JSON.stringify({
				'username': username,
				'password': password
			})
		})
		if (!res.ok) {
			throw (res.status)
		}
		getUser()
	}

	const register = async (username, email, password) => {
		const response = await apiPOrt('/register', {
			method: 'POST',
			body: JSON.stringify({
				'username': username,
				'Email': email,
				'Password': password,
			})
		})
		if (!response.ok) {
			throw (await response.status())
		}
		getUser()
	}

	const logout = async () => {
		const response = await fetch('/api/logout', {method: 'POST'})
		if (!response.ok) {
			throw (await response.text())
		}
		const data = await response.json()
		if (data.success == false)
			throw (data.context)
		// console.log(data)
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
