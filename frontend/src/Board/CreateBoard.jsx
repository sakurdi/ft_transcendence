import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import TextInput from  "../components/TextInput"
import useAuth from "../AuthProvider";

// type BoardCreate struct {
// 	Name        string `json:"name"`
// 	Description string `json:"description"`
// }


export default function CreateBoard() {
	const navigate = useNavigate()
	const [boardName, setBoardName] = useState("")
	const [boardDescription, setBoardDescription] = useState("")
	
	const _CreateBoard = async () => {
		try {
			console.log(boardName, boardDescription)
			const response = await fetch("/api/board/new",
				{method: 'POST',
				body: JSON.stringify({
				'name': boardName,
				'description': boardDescription}
			)} )
			if (!response.ok) {
				throw (await response.text())
			}
			console.log(response)
			const data = await response.json()
			if (data.success == false)
				throw (data.context)
			console.log(data)
			navigate("/board/" + data.id);
		} catch (error) {
			console.log(error)
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
