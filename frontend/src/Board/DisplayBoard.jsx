import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../User/AuthProvider";
import DisplayThreads from "./DisplayThreads";
import DisplayMods from "./DisplayMods";
import getDateDifferenceISO from "../Utils/date";

import { apiGet } from "../Utils/api";

import TextEdit from "../components/TextEdit";
import CreatePost from "./CreateThread";

// type Board struct {
// 	ID          int       `json:"id"`
// 	Name        string    `json:"name"`
// 	Description string    `json:"description"`
// 	OwnerID     int       `json:"owner_id"`
// 	CreatedAt   time.Time `json:"created_at"`
// }

// const getStrTimeDate = (dateISO) => {
// 	const dateAPI = new Date(dateISO);
	
// 	return getDateDifference(dateAPI)
// 	const time = dateAPI.toLocaleTimeString("fr-FR")
// 	const date = dateAPI.toLocaleDateString("fr-FR", { day: "numeric", month: "numeric", year: "2-digit"})
// 	// console.log(time," | ", date)
// 	return (time + " " + date)
// }

function DisplayBoardDescription({board, privilegeLvl}) {
	const [edit, setEdit] = useState(false)
	const [oldDescription, setOldDescription] = useState(board.description)
	const [description, setDescription] = useState(board.description)
	
	if (!description || description.lenght == 0){
		return (<></>)
	}	else if (privilegeLvl != 3) {
		return (<p>{description}</p>)
	} else {
		const saveEdit = () => {
			// console.log(description)	// TODO
			setEdit(false)
		}
		const discardEdit = () => {
			setDescription(oldDescription)
			saveEdit(description)
			setEdit(false)
		}
		return (<TextEdit baseValue={description}/>)
	}
}

export function DisplayBoardHeader({board, privilegeLvl, children}) {
	const navigate = useNavigate()
	const baseOwnerName = "<undefined>"
	const [ownerName, setOwnerName] = useState(baseOwnerName)

	const DisplayBoardOwner = (ownerName, privilegeLvl) => {
		if (ownerName === baseOwnerName) return <a>{baseOwnerName}</a>
		// console.log(privilegeLvl)
		const url = `/user/${ownerName}`
		return (
			<a onClick={ () => navigate(url) }>{ownerName}</a>
		)
	}

	useEffect(() => {
		const fetfchOwnerName = async () => {
			// const response = await apiGet(`/api/board/${boardname}/ismod`);
			// if (!response.ok)
			// 	return
			setOwnerName("Ca faut le faire") // TODO
		}
		fetfchOwnerName()
	}, [])

	return (
		<section>
			<header>
				<h1>{board.name}</h1>
				<div>
					<span>{DisplayBoardOwner(ownerName, privilegeLvl)}</span>
					<time dateTime = {board.created_at}>
						{getDateDifferenceISO(board.created_at)}
					</time>
				</div>
				<DisplayBoardDescription board={board} privilegeLvl={privilegeLvl}/>
			</header>
			{children}
		</section>
	)
}

export default function DisplayBoard() {
	const userHandle = useAuth()
	const { boardName } = useParams()

	const [refreshKeyThread, setRefreshKeyThread] = useState(0);
	const [refreshKeyBoard, setRefreshKeyBoard] = useState(0);
	const [loading, setLoading] = useState(true)
	const [privilegeLvl, setPrivilegeLvl] = useState(0);

	const [board, setBoard] = useState({
		id: undefined,
		name: undefined,
		description: undefined,
		owner_id: undefined,
		created_at: undefined,
	})

	useEffect(() => {
		if (userHandle.loading) return

		const checkIsMod = async (boardname) =>  {
			try {
				const response = await apiGet(`/board/${boardname}/ismod`);
				if (!response.ok) {
					throw (response.success)
				}
				return true;
			} catch (error) {
				// console.log(error)
				return false;
			}
		}
	
		const fetchBoard = async (boardName) => {
			try {
				const response = await apiGet(`/board/${boardName}`,)
				if (!response.ok) {
					throw (response.status)
				}
				// console.log(response.json)
				setBoard(response.json)
				if (userHandle.user) {
					setPrivilegeLvl(1)
					const user = userHandle.user
					if (user.id == response.json.owner_id) {
						setPrivilegeLvl(3)
					} else {
						const isMod = await checkIsMod(response.json.name) 
						if (isMod) {
							setPrivilegeLvl(2)
						}
					}
				}
			} catch (error) {
				console.log(error)
			}
		}
		fetchBoard(boardName)
		
		setLoading(false)
	}, [refreshKeyBoard, userHandle.loading])

	if (loading) {
		return ("loading")
	}
	if (!board.id) {
		return ("Pas de board")
	}
	return (
	<>
		<DisplayBoardHeader board = {board} privilegeLvl = {privilegeLvl}>
			{privilegeLvl >= 3 && <DisplayMods boardID={board.id}/>}
		</DisplayBoardHeader>
		<DisplayThreads board = {board} privilegeLvl = {privilegeLvl}
			refreshKeyThread={refreshKeyThread}
			setRefreshKeyThread={() => setRefreshKeyThread(refreshKeyThread + 1)}/>
		{privilegeLvl != 0 &&
			<CreatePost board={board}
				setRefreshKeyThread={() => setRefreshKeyThread(refreshKeyThread + 1)}/>
		}
	</>
	)
}
