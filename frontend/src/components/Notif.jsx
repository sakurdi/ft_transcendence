import { createContext, useContext, useState, useEffect, useCallback, } from "react";

const NotifContext = createContext();

export default function useNotif() {
	const context = useContext(NotifContext)
	if (context == null)
		throw (new Error("useNotif outside of NotifProvider"))
	return (context)
}

export function NotifProvider({ children }) {
	const [notifs, setNotifs] = useState([])

	const pushNotif = useCallback((children = "Default Notif", type = "notif") => {
		const id = crypto.randomUUID()
		setNotifs(prev => [...prev, { id, type, children }])
	})

	const pushSuccess = useCallback((children = "Default Success") => {
		pushNotif(children, "success")
	})

	const pushError = useCallback((children = "Default Error") => {
		pushNotif(children, "error")
	})

	const clearNotif = useCallback(() => {
		setNotifs([])
	})

	const removeNotif = useCallback((id) => {
		setNotifs(prev => prev.filter((item) => (item.id != id)))
	})

	return (
		<NotifContext.Provider value={{ pushNotif, pushSuccess, pushError, clearNotif }}>
			{children}
			{notifs.map((notif, index) =>
				<Notif key={notif.id}
					type={notif.type}
					onDone={() => removeNotif(notif.id)}
					index={index}>
					{notif.children}
				</Notif>)}
		</NotifContext.Provider>
	)
}

function Notif({ type, onDone, index, children }) {
	const [fading, setFading] = useState(false)

	const beforeFadingDuration = 1000
	const fadingDuration = 1000

	useEffect(() => {
		const awaitFadeTimer = setTimeout(() => { setFading(true) }, beforeFadingDuration)
		const fadeTimer = setTimeout(() => { onDone() }, beforeFadingDuration + fadingDuration)
		return (() => {
			clearTimeout(awaitFadeTimer)
			clearTimeout(fadeTimer)
		})
	}, [])

	const getColors = (type = "notif") => {
		if (type == "success") {
			return ("bg-green-50 border-green-400 text-green-800")
		} else if (type == "error") {
			return ("bg-red-50 border-red-400 text-red-800")
		} else {
			return ("bg-gray-50 border-gray-400 text-gray-700")
		}
	}

	return (
		<div style={{ bottom: `${1 + index * 4}rem` }}
			className={`fixed left-1/2 -translate-x-1/2 z-[100]
					px-4 py-2 rounded border font-bold
					transition-opacity duration-1000 ${fading ? "opacity-0" : "opacity-100"}
					min-w-fit max-w-[80vw]
				${getColors(type)}`}>
			{children}
		</div>
	)
}
