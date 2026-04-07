import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

import useAuth from "../AuthProvider";
import useNotif from "../../components/Notif";
import Loading from "../../components/Loading";
import { apiDelete, apiGet, apiPost } from "../../Utils/api";
import Button from "../../components/Button";
import Tooltip from "../../components/Tooltip";
import TextInput from "../../components/TextInput"

import CpyToClipBoardImg from "./CopyToClipBoard.png"

// r.Get("/api-keys", users.ListAPIKeysHandler(c))
// r.Post("/api-keys", users.CreateAPIKeyHandler(c))
// r.Delete("/api-keys/{keyID}", users.RevokeAPIKeyHandler(c))

// type APIKeyCreate struct {
// 	Name string `json:"name"`
// }

export function NewApiKey({setLoadingTrue}) {
	const notifHandle = useNotif()
	const [keyName, setKeyName] = useState("")

	const onClick = async () => {
		if (keyName == "") {
			notifHandle.pushError("Name cannot be empty")
			return
		}
		const res = await apiPost("/api-keys", {
			body: JSON.stringify({
				'name': keyName,
			})
		})
		if (res.ok) {
			setKeyName("")
			notifHandle.pushSuccess("Key created")
			setLoadingTrue()
		} else
			notifHandle.pushError(res.status)
	}

	return (
		<>
			<TextInput
				value = {keyName}
				onChange = {setKeyName}
				onEnter = {onClick}
				/>
			<Button onClick={onClick}>
				Create Api Key
			</Button>
		</>
	)

}

// created_at: "2026-04-07T11:09:08.029779Z"
// key_prefix: "ftpub_dc9b"
// name: "Default"
function DisplayOneApiKey({oneToken, setLoadingTrue})
{
	const notifHandle = useNotif()
	const deleteKey = async () => {
		// ask for consent
		const res = await apiDelete(`/api-keys/${oneToken.id}`)
		if (res.ok) {
			notifHandle.pushSuccess(`Api key '${oneToken.name}' deleted`)
			setLoadingTrue()
		} else
			notifHandle.pushError(res.status)
	}
		
	const onCopy = () => {
		navigator.clipboard.writeText(oneToken.key_prefix)
		notifHandle.pushSuccess(`Copied to clipboard`)
	}

	const readableDate = (dateStr) => {
		const date = new Date(dateStr)
		return date.toLocaleString('en-GB',{ hour12: false })
	}

	return (
		<div className="flex items-center justify-between w-[600px] p-4 bg-white border border-gray-200 rounded-xl">
			<div className = "flex items-center gap-3 min-w-0">
			<span className="font-semibold text-gray-900">
				{oneToken.name}
			</span>
			<time className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
				{readableDate(oneToken.created_at)}
			</time>
		</div>
			<div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
				<p className="px-3 py-1.5 text-sm text-gray-800">
					{oneToken.key_prefix}
				</p>
				<div className="w-px h-6 bg-gray-300"></div>
				<Tooltip content="Copy to clipboard">
					<button className="px-3 py-1.5 hover:bg-gray-100 transition-colors"
						onClick = {onCopy}>
						<img className="w-4 h-4 object-contain"
							src={CpyToClipBoardImg}/>
					</button>
				</Tooltip>
			</div>
			<button className="flex items-center justify-center w-8 h-8 text-red-600 border border-red-500 rounded-lg hover:bg-red-50 transition-colors"
				type="button"
				onClick={deleteKey}>
				✕
			</button>
		</div>
	)
}

export function ViewApiTokens({}) {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const navigate = useNavigate()

	const [loading, setLoading] = useState(true)
	const [tokens, setTokens] = useState(null)

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) {
			notifHandle.pushError("You need to be logged in to Manage Api-Keys")
			navigate('/');
		}
		const fetchTokens = async () => {
			const res = await apiGet("/api-keys")
			if (res.ok) {
				console.log(res.json)
				setTokens(res.json)
			} else {
				notifHandle.pushError(res.status)
			}
		}
		fetchTokens()
		setLoading(false)
	}, [userHandle.loading, loading])

	if (userHandle.loading || !userHandle.user)
		return <Loading/>
	return (
		<>
		{(!tokens || tokens.lenght == 0)
			? "No tokens"
			:  tokens.map((oneToken) => 
				<DisplayOneApiKey key={oneToken.id}
					oneToken = {oneToken}
					setLoadingTrue = {() => setLoading(true)}/>)
		}
		<NewApiKey
			setLoadingTrue = {() => {setLoading(true)}}/>
		</>
	)
}

export default function ApiTokenPage({}) {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const navigate = useNavigate()

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) {
			notifHandle.pushError("You need to be logged in to Manage Api-Keys")
			navigate('/');
		}
	}, [userHandle.loading])

	if (userHandle.loading || !userHandle.user)
		return <Loading/>

	return (
		<ViewApiTokens/>
	)

}
