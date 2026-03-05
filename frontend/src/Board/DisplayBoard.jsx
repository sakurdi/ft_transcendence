import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button, {ButtonLink} from "../components/Button";
import TextInput from "../components/TextInput";
import useAuth from "../AuthProvider";

// type Board struct {
// 	ID          int       `json:"id"`
// 	Name        string    `json:"name"`
// 	Description string    `json:"description"`
// 	OwnerID     int       `json:"owner_id"`
// 	CreatedAt   time.Time `json:"created_at"`
// }



export default function DisplayBoard() {
	const userHandle = useAuth()
	const navigate = useNavigate()
	const { boardName } = useParams()
	const [loading, setLoading] = useState(true)
	const [isMod, setIsMod] = useState(false)
	const [isAdmin, setIsAdmin] = useState(false)
	const [board, setBoard] = useState({
		id: undefined,
		name: undefined,
		description: undefined,
		owner_id: undefined,
		created_at: undefined,
	})

	useEffect(() => {
		const checkIsMod = async (boardname) =>  {
			try {
				const response = await fetch("/api/board/" + boardname + "/ismod");
				if (!response.ok) {
					throw (await response.text())
				}
				const data = await response.json()
				if (data.success == false)
					throw (data.context)
				return true;
			} catch (error) {
				console.log(error)
				return false;
			}
		}
	
		const fetchBoard = async (boardName) => {
			try {
				const response = await fetch("/api/board/" + boardName,)
				if (!response.ok) {
					throw (await response.text())
				}
				console.log(response)
				const data = await response.json()
				if (data.success == false)
					throw (data.context)
				console.log(data)
				setBoard(data)
				if (userHandle.user) {
					const user = userHandle.user
					if (user.id == data.owner_id) {
						setIsAdmin(true)
					} else {
						const isMod = await checkIsMod(data.name) 
						if (isMod) {
							setIsMod(true)
						}
					}
				}
			} catch (error) {
				console.log(error)
			}
		}
		fetchBoard(boardName)
		
		setLoading(false)
	}, [boardName, userHandle])

	if (loading) {
		return ("loading")
	}
	if (!board.id) {
		return ("Pas de board")
	}
	if (isAdmin) {
		return "Admin view"
	}
	if (isMod) {
		return "Mod View"
	}
	if (userHandle.user) {
		return "User View"
	}
	return "NoUser View"
	return (
		<div>
			DisplayBoard !
			{board.id}<br/>
			{board.name}<br/>
			{board.description}<br/>
			{board.owner_id}<br/>
			{board.created_at}<br/>
		</div>
	)
}
