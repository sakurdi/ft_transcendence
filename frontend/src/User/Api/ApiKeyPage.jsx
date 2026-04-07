import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

import useAuth from "../AuthProvider";
import useNotif from "../../components/Notif";
import Loading from "../../components/Loading";
import { apiDelete, apiGet, apiPost } from "../../Utils/api";
import Button from "../../components/Button";

// r.Get("/api-keys", users.ListAPIKeysHandler(c))
// r.Post("/api-keys", users.CreateAPIKeyHandler(c))
// r.Delete("/api-keys/{keyID}", users.RevokeAPIKeyHandler(c))

// type APIKeyCreate struct {
// 	Name string `json:"name"`
// }

export function NewApiKey({setLoadingTrue}) {
	const [keyName, setKeyName] = useState("Default")

	const onClick = async () => {
		const rest = await apiPost("/api-keys", {
			body: JSON.stringify({
				'name': keyName,
			})
		})
		setLoadingTrue()
	}

	return (
		<Button onClick={onClick}>
			Create Api Key
		</Button>
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
		<NewApiKey
			setLoadingTrue = {() => {setLoading(true)}}/>
	)
}
created_at: "2026-04-07T11:09:08.029779Z"
key_prefix: "ftpub_dc9b"
name: "Default"
function DisplayOneApiKey({APIkey, setLoadingTrue})
{
	const deleteKey = async () => {
		// ask for consent
		const res = await apiDelete(`/api-keys/${APIkey.id}`)
		//refresh loading
	}


	return (
		<div>
			<span>{APIkey.name}</span>
			<span>{`Value : ${APIkey.key_prefix}`}</span>
			<time>APIKey.created_at</time> 
			{/* readable */}
			<Button onClick={deleteKey}>
				Delete
			</Button>
		</div>
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
