import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button"
import TextInput from  "../components/TextInput"
import useAuth from "../AuthProvider";
import WrapError from "../components/WrapError";

// type BoardCreate struct {
// 	Name        string `json:"name"`
// 	Description string `json:"description"`
// }


export default function CreateBoard() {
	const navigate = useNavigate()
	const userHandler = useAuth()

	useEffect(() => {
		if (!userHandler.user)
			navigate('/');
	}, [])

	const [boardName, setBoardName] = useState("")
	const [boardDescription, setBoardDescription] = useState("")
	const [error, setError] = useState("")
	
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
			navigate("/board/" + boardName);
		} catch (error) {
			console.log(error)
			setError(error)
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
			<WrapError errorText={error}>
				<Button onClick={_CreateBoard}>
					Confirm
				</Button>
			</WrapError>
		</div>
	)
}
