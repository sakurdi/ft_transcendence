import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../User/AuthProvider";
import DisplayThreads from "./DisplayThreads";
import DisplayMods from "./DisplayMods";
import getDateDifferenceISO from "../Utils/date";
import InfinitScrollThreads from "./InfinitScrollThreads"

import { apiGet, apiPut } from "../Utils/api";

import TextEdit from "../components/TextEdit";
import CreatePost from "./CreateThread";
import Loading from "../components/Loading";
import useNotif from "../components/Notif";

// type BoardCreate struct {
// 	Name        string `json:"name"`
// 	Description string `json:"description"`
// }

function DisplayBoardDescription({description, privilegeLvl, saveEdit}) {
	
	if (!description || description.lenght == 0){
		return (<></>)
	}	else if (privilegeLvl != 3) {
		return (<p>{description}</p>)
	} else {
		return (<TextEdit baseValue={description} onValueSave={saveEdit}/>)
	}
}

export function DisplayBoardHeader({board, privilegeLvl, setRefreshKeyBoard}) {
	const navigate = useNavigate()
	const notifHandle = useNotif()

	const undefinedOwnerName = "<undefined>"
	const [ownerName, setOwnerName] = useState(undefined)

	const DisplayBoardOwner = (ownerName) => {
		if (ownerName == undefined) {
			return (
				<p>
					{undefinedOwnerName}
				</p>
			)
		}
		return (
			<p onClick={() => navigate(`/user/${ownerName}`)}>
				{ownerName}
			</p>
		)
	}

	useEffect(() => {
		const fetchOwnerName = async (ownerId) => {
			const response = await apiGet(`/user/id/${ownerId}`)
			if (response.ok) {
				const owner = response.json 
				setOwnerName(owner.username)
			} else {
				setOwnerName(undefined)
				notifHandle.pushError(response.status)
			}
		}
		fetchOwnerName(board.owner_id)
	}, [])

	const saveEdit = async (newDescription) => {
		const res = await apiPut(`board/${board.id}`, {
			body: JSON.stringify({
				'name': board.name,
				'description': newDescription,
			})
		})
		if (res.ok) {
			notifHandle.pushSuccess("Board edited")
			setRefreshKeyBoard()
		} else
			notifHandle.pushError(res.status)
	}

	return (
		<section>
			<header>
				<h1>{board.name}</h1>
				<div>
					<span>{DisplayBoardOwner(ownerName)}</span>
					<time dateTime = {board.created_at}>
						{getDateDifferenceISO(board.created_at)}
					</time>
				</div>
				<DisplayBoardDescription description={board.description} privilegeLvl={privilegeLvl} saveEdit={saveEdit}/>
			</header>
			{privilegeLvl >= 3 && <DisplayMods boardID={board.id}/>}
		</section>
	)
}

export default function DisplayBoard() {
	const userHandle = useAuth()
	const notifHandle = useNotif()
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
		setLoading(true)
		if (userHandle.loading) return

		const checkIsMod = async (boardname) =>  {
			try {
				const response = await apiGet(`/board/${boardname}/ismod`);
				if (!response.ok) {
					throw (response.status)
				}
				return response.json.ismod;
			} catch (error) {
				return false;
			}
		}
	
		const fetchBoard = async (boardName) => {
			const response = await apiGet(`/board/${boardName}`,)
			if (response.ok) {
				const nBoard = response.json 
				const user = userHandle.user
				if (user) {
					setPrivilegeLvl(1)
					if (user.id == nBoard.owner_id) {
						setPrivilegeLvl(3)
					} else {
						const isMod = await checkIsMod(nBoard.name)
						if (isMod) {
							setPrivilegeLvl(2)
						}
					}
				} else
					setPrivilegeLvl(0)
				setBoard(nBoard)
			} else
				notifHandle.pushError(response.status)
		}
		fetchBoard(boardName)
		setLoading(false)
	}, [refreshKeyBoard, userHandle.loading, userHandle.user])

	if (loading) return <Loading/>
	if (!board.id) {
		return ("Pas de board")
	}
	console.log(board)
	return (
	<>
		<DisplayBoardHeader board = {board} privilegeLvl = {privilegeLvl} setPrivilegeLvl = {setPrivilegeLvl}
			setRefreshKeyBoard={() => setRefreshKeyBoard(refreshKeyBoard + 1)}/>
		<InfinitScrollThreads boardName = {boardName} privilegeLvl = {privilegeLvl}
			refreshKeyThread={refreshKeyThread}
			setRefreshKeyThread={() => setRefreshKeyThread(refreshKeyThread + 1)}/>
		{userHandle.user &&
			<CreatePost board={board}
				setRefreshKeyThread={() => setRefreshKeyThread(refreshKeyThread + 1)}/>
		}
	</>
	)
}
