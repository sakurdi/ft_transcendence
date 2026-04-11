import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "./AuthProvider";
import useNotif from "../components/Notif"
import { apiPut } from "../Utils/api";

import Loading from "../components/Loading";
import { PasswordInput } from "../components/TextInput";
import Button from "../components/Button";
import Card from "../components/Card";

function checkPassword(password, password2, pushError) {
	if (password === "") { pushError("Password cannot be empty"); return false }
	if (password.length <= 3) { pushError("Password must be at least 4 characters"); return false }
	if (password !== password2) { pushError("Passwords don't match"); return false }
	return true
}

export default function ChangePassword() {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const navigate = useNavigate()

	const [pwInfo, setPwInfo] = useState({ old: "", p1: "", p2: "" })

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) {
			notifHandle.pushError("You are not logged in")
			navigate('/')
		}
	}, [userHandle.loading])

	function handleEnter(event) {
		if (event.key === "Enter") {
			event.preventDefault()
			const form = event.target.form
			const index = [...form].indexOf(event.target)
			form[index + 1]?.focus()
		}
	}

	const onSubmit = async () => {
		if (checkPassword(pwInfo.p1, pwInfo.p2, notifHandle.pushError)) {
			const res = await apiPut(`/user/${userHandle.user.username}/password`, {
				body: JSON.stringify({ old_password: pwInfo.old, new_password: pwInfo.p1 })
			})
			if (!res.ok) {
				notifHandle.pushError(res.status)
				setPwInfo({ old: "", p1: "", p2: "" })
			} else {
				notifHandle.pushSuccess("Password changed")
				navigate('/')
			}
		} else {
			setPwInfo({ old: "", p1: "", p2: "" })
		}
	}

	if (userHandle.loading) return <Loading />

	return (
		<Card title="Change Password" description="Enter your current password and choose a new one.">
			<form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
				<PasswordInput
					value={pwInfo.old}
					onChange={(old) => setPwInfo(prev => ({ ...prev, old }))}
					placeholder="Current password"
					onKeypress={handleEnter}
				/>
				<PasswordInput
					value={pwInfo.p1}
					onChange={(p1) => setPwInfo(prev => ({ ...prev, p1 }))}
					placeholder="New password"
					onKeypress={handleEnter}
				/>
				<PasswordInput
					value={pwInfo.p2}
					onChange={(p2) => setPwInfo(prev => ({ ...prev, p2 }))}
					placeholder="Confirm new password"
					onEnter={onSubmit}
				/>
				<Button type="submit" className="w-full justify-center py-2.5 mt-1">
					Update Password
				</Button>
			</form>
		</Card>
	)
}
