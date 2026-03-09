import {useState} from "react"

function timestamp() {
	return new Date().toLocaleTimeString()
}

// ── useLog ────────────────────────────────────────────────────────────────────

export default function useLog() {
	const [entries, setEntries] = useState([])
	function push(msg, type = "info") {
		setEntries(prev => [...prev, { msg, type, time: timestamp() }])
	}
	return { entries, push }
}
