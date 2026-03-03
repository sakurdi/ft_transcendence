import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export default function AuthProvider( { children } ) {
	const [user, setUser] = useState(null)

	const getUser = async () => {
		try {
			const response = await fetch("/api/user", {method: 'GET',} )
			if (!response.ok) {
				throw (await response.text())
			}
			const data = await response.json()
			if (data.success == false)
				throw (data.context)
			setUser(data.userinfo)
		} catch (err) {
			console.log(err)
			setUser(null)
		}
	}

	const login = async (username, password) => {
		const response = await fetch('/api/login', {
			method: 'POST',
			body: JSON.stringify({
				'username': username,
				'password': password
			})
		})
		if (!response.ok) {
			throw (await response.text())
		}
		const data = await response.json()
		if (data.success == false)
			throw (data.context)
		getUser()
	}

	const register = async (username, email, password) => {
		const response = await fetch('/api/register', {
			method: 'POST',
			body: JSON.stringify({
				'username': username,
				'Email': email,
				'Password': password,
			})
		})
		if (!response.ok) {
			throw (await response.text())
		}
		const data = await response.json()
		if (data.success == false)
			throw (data.context)
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
		console.log(data)
		setUser(null)

	}


	return (
		<AuthContext.Provider userValue = {{user, login, register, logout}}>
			{children}
		</AuthContext.Provider>
	)
}
