import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "./AuthProvider";
import useNotif	from "../components/Notif"
import { apiPut } from "../Utils/api";

import Loading from "../components/Loading";
import { PasswordInput } from "../components/TextInput";
import Button from "../components/Button";

// r.Put("/user/{username}", users.UpdateUserHandler(c))
// type UserEdit struct {
// 	Login    string `json:"username"`
// 	Email    string `json:"email"`
// 	Password string `json:"password"`
// }

function checkPassword(password, password2, pushError) {
	if (password === "") {
		pushError("Password cannot be empty")
		return false
	}
	if (password.length <= 3) {
		pushError("Password needs to be a least 4 characters")
		return false
	}
	if (password !== password2) {
		pushError("Passwords don't match")
		return false
	}
	return true
}

export default function ChangePassword() {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const navigate = useNavigate()

	const [pwInfo, setPwInfo] = useState( {old: "", p1: "", p2: ""} )

	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) {
			notifHandle.pushError("You are not logged in")
			navigate('/')
		}
	}, [userHandle.loading])

	function handleEnter(event) {
		if (event.key == "Enter") {
			event.preventDefault()
			const form = event.target.form;
			const index = [...form].indexOf(event.target);
			form[index + 1].focus();
		}
	}

	const onSubmit = async () => {
		if (checkPassword(pwInfo.p1, pwInfo.p2, notifHandle.pushError)) {
			res = await apiPut("TODO") // TODO
			if (!res.ok) {
				notifHandle.pushError(res.status)
				setPwInfo({old: "", p1: "", p2: ""})
			} else {
				notifHandle.pushSuccess("Password changed")
				navigate('/')
			}
		} else {
			setPwInfo({old: "", p1: "", p2: ""})
		}
	}

	if (userHandle.loading)	return <Loading/>
	return (
		<form  onSubmit= {(e) => {e.preventDefault(); onSubmit()}}>
			<PasswordInput
				value={pwInfo.old}
				onChange={(old) => setPwInfo(prev => ({...prev, "old": old}))}
				placeholder="Old password"
				onKeypress={handleEnter}
				/>
			<PasswordInput
				value={pwInfo.p1}
				onChange={(p1) => setPwInfo(prev => ({...prev, "p1": p1}))}
				placeholder="New password"
				onKeypress={handleEnter}
			/>
			<PasswordInput
				value={pwInfo.p2}
				onChange={(p2) => setPwInfo(prev => ({...prev, "p2": p2}))}
				placeholder="Confirm new password"
				onEnter={onSubmit}
			/>
			<Button type="submit">
				Change Password
			</Button>
		</form>
	)
}
