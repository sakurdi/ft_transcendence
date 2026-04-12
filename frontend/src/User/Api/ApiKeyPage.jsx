import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

import useAuth from "../AuthProvider";
import useNotif from "../../components/Notif";
import Loading from "../../components/Loading";
import { apiDelete, apiGet, apiPost } from "../../Utils/api";
import Tooltip from "../../components/Tooltip";
import Button from "../../components/Button";
import TextInput from "../../components/TextInput";

import CpyToClipBoardImg from "./CopyToClipBoard.png"

export function NewApiKey({ onRefresh }) {
	const notifHandle = useNotif()
	const [keyName, setKeyName] = useState("")
	const [createdKey, setCreatedKey] = useState(null) // { name, key }

	const onClick = async () => {
		if (keyName === "") {
			notifHandle.pushError("Key name cannot be empty")
			return
		}
		const res = await apiPost("/api-keys", {
			body: JSON.stringify({
				'name': keyName,
			})
		})
		if (res.ok) {
			setKeyName("")
			// Backend returns: { id, name, prefix, api_key }
			const fullKey = res.json.api_key;
			setCreatedKey({
				name: res.json.name,
				key: fullKey
			})
			
			// Automatically copy to clipboard
			try {
				await navigator.clipboard.writeText(fullKey);
				notifHandle.pushSuccess("API Key created and copied to clipboard!");
			} catch (err) {
				notifHandle.pushSuccess("API Key created successfully");
				notifHandle.pushError("Failed to auto-copy. Please copy manually.");
			}
			
			onRefresh?.()
		} else
			notifHandle.pushError(res.status)
	}

	const onCopy = () => {
		if (!createdKey) return
		navigator.clipboard.writeText(createdKey.key)
		notifHandle.pushSuccess(`Full key copied to clipboard`)
	}

	if (createdKey) {
		return (
			<div className="p-6 glass rounded-2xl border border-g_seagreen/20 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="flex items-center justify-between mb-4">
					<h4 className="text-[#eaeaf4] font-bold flex items-center gap-2">
						<span className="text-xl">🛡️</span> Key Created: {createdKey.name}
					</h4>
					<Button variant="ghost" className="text-xs" onClick={() => setCreatedKey(null)}>Done</Button>
				</div>
				<p className="text-sm text-[#9898b8] mb-6 leading-relaxed">
					Please copy your API key now. For security reasons, <span className="text-g_seagreen font-bold underline">it will not be shown again.</span>
				</p>
				
				<div className="flex items-center gap-2">
					<div className="flex-1 glass-elevated border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-[#eaeaf4] break-all shadow-sm">
						{createdKey.key}
					</div>
					<Button onClick={onCopy} className="h-full aspect-square p-3">
						<img src={CpyToClipBoardImg} className="w-5 h-5 opacity-70" alt="Copy" />
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col sm:flex-row gap-3 items-end p-4 glass rounded-xl border border-white/5 mt-4">
			<div className="flex-1 w-full">
				<label className="block text-[10px] font-bold text-[#55556a] uppercase tracking-widest mb-2 ml-1">New Key Name</label>
				<TextInput
					value={keyName}
					onChange={setKeyName}
					onEnter={onClick}
					placeholder="e.g. My Application"
				/>
			</div>
			<Button onClick={onClick} className="w-full sm:w-auto h-[42px] px-6">
				Create Key
			</Button>
		</div>
	)
}

function DisplayOneApiKey({ oneToken, onRefresh }) {
	const notifHandle = useNotif()

	const deleteKey = async () => {
		if (!window.confirm(`Are you sure you want to revoke '${oneToken.name}'?`)) return;
		const res = await apiDelete(`/api-keys/${oneToken.id}`)
		if (res.ok) {
			notifHandle.pushSuccess(`Key revoked`)
			onRefresh?.()
		} else
			notifHandle.pushError(res.status)
	}

	const onCopyPrefix = () => {
		navigator.clipboard.writeText(oneToken.key_prefix)
		notifHandle.pushSuccess(`Prefix copied to clipboard`)
	}

	const readableDate = (dateStr) => {
		const date = new Date(dateStr)
		return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
	}

	return (
		<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 glass-elevated border border-white/5 rounded-xl hover:border-g_seagreen/30 transition-all shadow-sm group">
			<div className="flex flex-col gap-1 min-w-0">
				<span className="font-bold text-[#eaeaf4] truncate">
					{oneToken.name}
				</span>
				<span className="text-[10px] font-bold text-[#55556a] uppercase tracking-wider bg-white/5 w-fit px-2 py-0.5 rounded">
					Created {readableDate(oneToken.created_at)}
				</span>
			</div>
			
			<div className="flex items-center gap-2 w-full sm:w-auto">
				<div className="flex items-center flex-1 sm:flex-none glass rounded-lg overflow-hidden border border-white/10">
					<code className="px-3 py-1.5 text-xs text-g_seagreen font-mono font-bold">
						{oneToken.key_prefix}...
					</code>
					<div className="w-px h-4 bg-white/10"></div>
					<Tooltip content="Copy Prefix">
						<button className="px-3 py-1.5 hover:bg-white/5 transition-colors"
							onClick={onCopyPrefix}>
							<img className="w-3 h-3 opacity-40 group-hover:opacity-70"
								src={CpyToClipBoardImg}/>
						</button>
					</Tooltip>
				</div>
				
				<Tooltip content="Revoke Key">
					<Button 
						variant="ghost" 
						className="text-red-400 hover:bg-red-500/10 p-2 h-auto"
						onClick={deleteKey}
					>
						✕
					</Button>
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
	const [tokens, setTokens] = useState([])
	const [refreshKey, setRefreshKey] = useState(0)

	const refresh = () => setRefreshKey(prev => prev + 1)

	const fetchTokens = async () => {
		setLoading(true)
		const res = await apiGet("/api-keys")
		if (res.ok) {
			setTokens(res.json || [])
		} else if (res.status !== 401) {
			notifHandle.pushError(res.status)
		}
		setLoading(false)
	}

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) {
			navigate('/login');
			return;
		}
		fetchTokens()
	}, [userHandle.loading, userHandle.user, refreshKey])

	if (loading || userHandle.loading) return <div className="py-12"><Loading/></div>

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xs font-semibold text-[#55556a] uppercase tracking-wider">
					API Keys
				</h2>
				<button 
					onClick={() => navigate('/api-docs')}
					className="text-[10px] font-bold text-g_seagreen hover:text-g_seagreen-600 uppercase tracking-widest flex items-center gap-2 group transition-colors"
				>
					<span className="w-5 h-5 rounded-full border border-g_seagreen/20 flex items-center justify-center text-[10px] group-hover:border-g_seagreen/40 transition-colors">?</span>
					API Documentation
				</button>
			</div>

			<div className="space-y-3">
				{(!tokens || tokens.length === 0) ? (
					<div className="py-8 text-center glass rounded-xl border border-dashed border-white/5">
						<p className="text-sm text-[#55556a] italic">No API keys generated yet.</p>
					</div>
				) : (
					tokens.map((oneToken) => 
						<DisplayOneApiKey 
							key={oneToken.id}
							oneToken={oneToken}
							onRefresh={refresh}
						/>
					)
				)}
			</div>
			
			<div className="pt-4 border-t border-white/5">
				<NewApiKey onRefresh={refresh}/>
			</div>
		</div>
	)
}

export default function ApiTokenPage() {
	const userHandle = useAuth()
	
	if (userHandle.loading) return <Loading/>
	if (!userHandle.user) return null

	return <ViewApiTokens/>
}
