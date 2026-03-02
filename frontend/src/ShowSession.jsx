import { useState, useEffect } from "react"


async function fetchUserInfo(
	setContext = [],
	setUserInfo = []
) {
	try {
		const response = await fetch("/api/user", {method: 'GET',} )
		if (!response.ok)
			throw new Error("Fetch Error")
		
		const data = await response.json()
		if (setUserInfo !==  undefined)
			setUserInfo(data.userinfo)
		if (setContext !==  undefined)
			setContext(data.context)
		// console.log(data)
		// console.log(data.success)
	} catch (err) {
		if ( setContext !== undefined)
			setContext = err
		return false
	}
	return true
}

export default function ShowSession() {
	const [userInfo, setUserInfo] = useState({
		username: '',
		email: '',
		id: '',
		created_at: '',
	})
	const [fetchStatus, setFetchStatus] = useState({
		success: false,
		context: '',
	})

	const success =	fetchUserInfo((context) => {
		setFetchStatus(prev => ({...prev, ["context"]: context}))
	}, setUserInfo)
	
	// setFetchStatus(prev => ({...prev, ["context"]: context}))
	return (
		<>
			<div>{userInfo.username}</div>
			<div>{userInfo.email}</div>
			<div>{userInfo.id}</div>
			<div>{userInfo.created_at}</div>
		</>
	)
}
