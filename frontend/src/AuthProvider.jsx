import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);
export default useAuth


export function AuthProvider( { children } ) {
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
			console.log(data.userinfo)
		} catch (err) {
			console.log(err)
			setUser(null)
			throw (err)
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

	useEffect(() => {
		const getUserInit = async () => {
			try {
				await getUser();
			} catch (err) {
				console.log("Setup getUser error: " + err)
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
