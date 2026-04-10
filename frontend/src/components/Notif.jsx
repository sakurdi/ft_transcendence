import { createContext, useContext, useState, useEffect, useCallback } from "react";

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

	const pushSuccess = useCallback((children = "Default Success") => pushNotif(children, "success"))
	const pushError   = useCallback((children = "Default Error")   => pushNotif(children, "error"))
	const clearNotif  = useCallback(() => setNotifs([]))
	const removeNotif = useCallback((id) => setNotifs(prev => prev.filter(item => item.id !== id)))

	return (
		<NotifContext.Provider value={{ pushNotif, pushSuccess, pushError, clearNotif }}>
			{children}
			<div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999]
				flex flex-col gap-2 items-center pointer-events-none">
				{notifs.map((notif, index) =>
					<Notif key={notif.id}
						type={notif.type}
						onDone={() => removeNotif(notif.id)}
						index={index}>
						{notif.children}
					</Notif>
				)}
			</div>
		</NotifContext.Provider>
	)
}

function Notif({ type, onDone, children }) {
	const [fading, setFading] = useState(false)
	const beforeFading = 2800
	const fadeDuration = 400

	useEffect(() => {
		const t1 = setTimeout(() => setFading(true), beforeFading)
		const t2 = setTimeout(() => onDone(), beforeFading + fadeDuration)
		return () => { clearTimeout(t1); clearTimeout(t2) }
	}, [])

	const accent = type === "success" ? "#03B5AA" : type === "error" ? "#f55f5f" : "#9898b8"
	const icon   = type === "success" ? "✓" : type === "error" ? "✕" : "i"

	return (
		<div className={`
			pointer-events-auto flex items-center gap-3
			px-4 py-3 rounded-xl
			glass shadow-2xl shadow-black/40
			min-w-[240px] max-w-[400px]
			transition-all duration-[400ms]
			${fading ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}
		`}
			style={{ borderColor: `${accent}55`, borderWidth: '1px' }}>
			<span className="w-5 h-5 rounded-full flex items-center justify-center
				text-xs font-bold flex-shrink-0"
				style={{ color: accent, border: `1px solid ${accent}60` }}>
				{icon}
			</span>
			<p className="text-sm font-medium text-[#eaeaf4] truncate">
				{children}
			</p>
		</div>
	)
}
