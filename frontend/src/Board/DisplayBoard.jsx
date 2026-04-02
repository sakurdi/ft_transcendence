import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../User/AuthProvider";
import DisplayThreads from "./DisplayThreads";
import DisplayMods from "./DisplayMods";
import getDateDifferenceISO from "../Utils/date";
import InfinitScrollThreads from "./InfinitScrollThreads"

import { apiGet } from "../Utils/api";

import TextEdit from "../components/TextEdit";
import CreatePost from "./CreateThread";
import Loading from "../components/Loading";
import useNotif from "../components/Notif";

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

export function DisplayBoardHeader({board, privilegeLvl}) {
	const navigate = useNavigate()
	const baseOwnerName = "<undefined>"
	const [ownerName, setOwnerName] = useState(baseOwnerName)

	const DisplayBoardOwner = (ownerName, privilegeLvl) => {
		if (ownerName === baseOwnerName) return <a>{baseOwnerName}</a>
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
	return (
	<>
		<DisplayBoardHeader board = {board} privilegeLvl = {privilegeLvl} setPrivilegeLvl = {setPrivilegeLvl}/>
		{/* <DisplayThreads boardName = {boardName} privilegeLvl = {privilegeLvl}
			refreshKeyThread={refreshKeyThread}
			setRefreshKeyThread={() => setRefreshKeyThread(refreshKeyThread + 1)}/> */}
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
