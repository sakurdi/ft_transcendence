import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

import useAuth from "../AuthProvider";
import useNotif from "../../components/Notif";
import Loading from "../../components/Loading";
import { apiDelete, apiGet, apiPost } from "../../Utils/api";
import Tooltip from "../../components/Tooltip";

import CpyToClipBoardImg from "./CopyToClipBoard.png"

export function NewApiKey({ setLoadingTrue }) {
	const notifHandle = useNotif()
	const [keyName, setKeyName] = useState("")

	const onClick = async () => {
		if (keyName === "") { notifHandle.pushError("Key name cannot be empty"); return }
		const res = await apiPost("/api/api-keys", { body: JSON.stringify({ 'name': keyName }) })
		if (res.ok) {
			setKeyName(""); notifHandle.pushSuccess("API key created"); setLoadingTrue()
		} else {
			notifHandle.pushError(res.status)
		}
	}

	return (
		<div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/6">
			<input type="text" value={keyName}
				onChange={e => setKeyName(e.target.value)}
				onKeyDown={e => e.key === "Enter" && onClick()}
				placeholder="Key name…" className="flex-1" style={{ width: "auto" }} />
			<button onClick={onClick}
				className="px-4 py-2 rounded-lg text-sm font-semibold flex-shrink-0
					bg-g_seagreen text-white hover:bg-g_seagreen-600
					transition-all duration-150 active:scale-[0.97]
					shadow-md shadow-g_seagreen/20">
				Create Key
			</button>
		</div>
	)
}

function DisplayOneApiKey({ oneToken, setLoadingTrue }) {
	const notifHandle = useNotif()

	const deleteKey = async () => {
		if (!window.confirm(`Delete API key "${oneToken.name}"?`)) return
		const res = await apiDelete(`/api/api-keys/${oneToken.id}`)
		if (res.ok) {
			notifHandle.pushSuccess(`Key "${oneToken.name}" deleted`); setLoadingTrue()
		} else {
			notifHandle.pushError(res.status)
		}
	}

	const onCopy = () => {
		navigator.clipboard.writeText(oneToken.key_prefix)
		notifHandle.pushSuccess("Copied to clipboard")
	}

	const readableDate = (dateStr) =>
		new Date(dateStr).toLocaleString('en-GB', { hour12: false })

	return (
		<div className="flex items-center justify-between gap-3 py-3.5
			border-b border-white/6 last:border-0">
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold text-[#eaeaf4] truncate">{oneToken.name}</p>
				<time className="text-xs text-[#55556a]">{readableDate(oneToken.created_at)}</time>
			</div>

			<div className="flex items-center gap-2 flex-shrink-0">
				<div className="flex items-center glass rounded-lg overflow-hidden">
					<code className="px-3 py-1.5 text-xs text-[#9898b8] font-mono">
						{oneToken.key_prefix}
					</code>
					<div className="w-px h-5 bg-white/8" />
					<Tooltip content="Copy to clipboard">
						<button onClick={onCopy}
							className="px-2.5 py-1.5 hover:bg-white/8 transition-colors duration-100">
							<img className="w-3.5 h-3.5 object-contain opacity-50 hover:opacity-80"
								src={CpyToClipBoardImg} alt="copy" />
						</button>
					</Tooltip>
				</div>

				<Tooltip content="Revoke key">
					<button onClick={deleteKey}
						className="w-7 h-7 flex items-center justify-center rounded-lg text-xs
							text-red-400 border border-red-500/20 hover:bg-red-500/10
							transition-all duration-150">
						✕
					</button>
				</Tooltip>
			</div>
		</div>
	)
}

export function ViewApiTokens() {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const navigate = useNavigate()
	const [loading, setLoading] = useState(true)
	const [tokens, setTokens] = useState(null)

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) { notifHandle.pushError("Login required"); navigate('/') }
		const fetchTokens = async () => {
			const res = await apiGet("/api/api-keys")
			if (res.ok) setTokens(res.json)
			else notifHandle.pushError(res.status)
		}
		fetchTokens()
		setLoading(false)
	}, [userHandle.loading, loading])

	if (userHandle.loading || !userHandle.user || loading) return <Loading />

	return (
		<div>
			{(!tokens || tokens.length === 0)
				? <p className="text-[#55556a] text-sm py-2">No API keys yet.</p>
				: tokens.map((oneToken) =>
					<DisplayOneApiKey key={oneToken.id} oneToken={oneToken}
						setLoadingTrue={() => setLoading(true)} />
				)
			}
			<NewApiKey setLoadingTrue={() => setLoading(true)} />
		</div>
	)
}

export default function ApiTokenPage() {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const navigate = useNavigate()

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) { notifHandle.pushError("Login required"); navigate('/') }
	}, [userHandle.loading])

	if (userHandle.loading || !userHandle.user) return <Loading />
	return <ViewApiTokens />
}
