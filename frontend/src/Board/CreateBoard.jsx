import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import TextInput from  "../components/TextInput"
import useAuth from "../User/AuthProvider";
import useNotif from "../components/Notif";

import { apiPost } from "../Utils/api";

// type BoardCreate struct {
// 	Name        string `json:"name"`
// 	Description string `json:"description"`
// }


export default function CreateBoard() {
	const navigate = useNavigate()
	const userHandler = useAuth()
	const notifHandle = useNotif()

	useEffect(() => {
		if (userHandler.loading) return
		if (!userHandler.user) {
			notifHandle.pushError("You need to be logged in to create a board")
			navigate('/');
		}
	}, [userHandler.loading])

	const [boardName, setBoardName] = useState("")
	const [boardDescription, setBoardDescription] = useState("")
	
	const _CreateBoard = async () => {
		try {
			// console.log(boardName, boardDescription)
			const response = await apiPost("//board/new",
				{body: JSON.stringify({
					'name': boardName,
					'description': boardDescription}
			)} )
			if (!response.ok) {
				throw (await response.status)
			}
			// console.log(response.json)
			notifHandle.pushSuccess(`Board "${boardName}" succesfully created`)
			navigate("/board/" + boardName);
		} catch (error) {
			// console.log(error)
			notifHandle.pushError(error)
		}
	}

	return (
		<div>	
			<h1>New Board</h1>
			<TextInput value = {boardName}
				onChange = {setBoardName}
				placeHolder = "Name"/>
			<TextInput value = {boardDescription}
				onChange = {setBoardDescription}
				placeHolder = "Description"/>
			<Button onClick={_CreateBoard}>
				Confirm
			</Button>
		</div>
	)
}
