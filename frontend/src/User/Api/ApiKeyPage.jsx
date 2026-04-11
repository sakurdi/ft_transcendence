import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

import useAuth from "../AuthProvider";
import useNotif from "../../components/Notif";
import Loading from "../../components/Loading";
import { apiDelete, apiGet, apiPost } from "../../Utils/api";
import Button from "../../components/Button";
import Tooltip from "../../components/Tooltip";
import TextInput from "../../components/TextInput"
import ApiDocs from "./ApiDocs";

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
			<div className="p-6 bg-brand-50 border border-brand-200 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="flex items-center justify-between mb-4">
					<h4 className="text-brand-900 font-black flex items-center gap-2">
						<span className="text-xl">🛡️</span> Key Created: {createdKey.name}
					</h4>
					<Button size="sm" variant="ghost" onClick={() => setCreatedKey(null)}>Done</Button>
				</div>
				<p className="text-sm text-brand-700 mb-6 leading-relaxed">
					Please copy your API key now. For security reasons, <span className="font-black underline">it will not be shown again.</span>
				</p>
				
				<div className="flex items-center gap-2">
					<div className="flex-1 bg-white border-2 border-brand-200 rounded-xl px-4 py-3 font-mono text-sm text-brand-800 break-all shadow-sm">
						{createdKey.key}
					</div>
					<Button onClick={onCopy} className="h-full aspect-square">
						<img src={CpyToClipBoardImg} className="w-5 h-5 invert brightness-0" alt="Copy" />
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col sm:flex-row gap-3 items-end p-4 bg-surface-50 rounded-xl border border-surface-100">
			<div className="flex-1 w-full">
				<label className="block text-xs font-bold text-surface-400 uppercase tracking-widest mb-2 ml-1">New Key Name</label>
				<TextInput
					value={keyName}
					onChange={setKeyName}
					onEnter={onClick}
					placeholder="e.g. Production App"
				/>
			</div>
			<Button onClick={onClick} variant="primary" className="w-full sm:w-auto h-[42px]">
				Create Key
			</Button>
		</div>
	)
}

function DisplayOneApiKey({oneToken, onRefresh})
{
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
		return date.toLocaleDateString('en-GB')
	}

	return (
		<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-surface-200 rounded-xl hover:border-brand-300 transition-all shadow-sm">
			<div className="flex flex-col gap-1 min-w-0">
				<span className="font-bold text-surface-900 truncate">
					{oneToken.name}
				</span>
				<span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider bg-surface-50 w-fit px-2 py-0.5 rounded">
					Created {readableDate(oneToken.created_at)}
				</span>
			</div>
			
			<div className="flex items-center gap-2 w-full sm:w-auto">
				<div className="flex items-center flex-1 sm:flex-none bg-surface-100 rounded-lg overflow-hidden border border-surface-200">
					<code className="px-3 py-1.5 text-xs text-brand-700 font-mono font-bold">
						{oneToken.key_prefix}...
					</code>
					<div className="w-px h-4 bg-surface-200"></div>
					<Tooltip content="Copy Prefix">
						<button className="px-3 py-1.5 hover:bg-surface-200 transition-colors"
							onClick={onCopyPrefix}>
							<img className="w-3 h-3 opacity-60"
								src={CpyToClipBoardImg}/>
						</button>
					</Tooltip>
				</div>
				
				<Button 
					variant="ghost" 
					size="sm" 
					className="text-red-500 hover:bg-red-50 p-2 h-auto"
					onClick={deleteKey}
				>
					✕
				</Button>
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
	const [showDocs, setShowDocs] = useState(false)

	const refresh = () => setRefreshKey(prev => prev + 1)

	const fetchTokens = async () => {
		setLoading(true)
		const res = await apiGet("/api-keys")
		if (res.ok) {
			setTokens(res.json || [])
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

	if (loading) return <div className="py-12"><Loading/></div>

	return (
		<div className="space-y-6">
			<div className="flex justify-end">
				<button 
					onClick={() => navigate('/docs/api')}
					className="text-xs font-bold text-brand-600 hover:text-brand-700 uppercase tracking-widest flex items-center gap-2 group transition-colors"
				>
					<span className="w-5 h-5 rounded-full border border-brand-200 flex items-center justify-center text-[10px] group-hover:border-brand-400 transition-colors">?</span>
					View API Documentation
				</button>
			</div>

			<div className="space-y-3">
				{(!tokens || tokens.length === 0) ? (
					<div className="py-8 text-center bg-surface-50 rounded-xl border border-dashed border-surface-200">
						<p className="text-sm text-surface-400 italic">No API keys generated yet.</p>
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
			
			<div className="pt-4 border-t border-surface-100">
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
