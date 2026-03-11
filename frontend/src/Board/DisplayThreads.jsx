import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import useAuth from "../User/AuthProvider";
import { apiDelete, apiGet } from "../Utils/api";
import TextButton, { TextLink } from "../components/TextButton";
import getRandomPastel from "../Utils/colors";
import TextArea, { TextAreaTitle } from "../components/TextArea";

// author_id: 2
// board_id: 3
// content: "A tous"
// created_at: "2026-03-09T15:22:33.048745Z"
// id: 4
// parent_id: null
// title: "Bonjour"
// username: "gaeudes"

function OneThreadHeaderDeleteButton({deleteThread}) {
	// console.log("Deletebutton")
	return (
		<TextButton onClick={deleteThread}
			text="❌"/>
	)
}

function OneThreadHeader({
		thread,
		title,
		setTitle,
		isEditing,
		canDelete,
		deleteThread,
		discardEdit,
		bgColor})
{
	return (
		<header className="mb-2">
			{isEditing ?
					// <textarea className = "text-white font-bold text-base bg-transparent resize-none focus:outline-none rounded-xl "
					// 	value = {title}
					// 	onChange = {(e) => {e.stopPropagation(); e.key != "Enter" && setTitle(e.target.value)}}
					// 	onClick = {(e) => {e.stopPropagation()}}
					// 	rows = "1" cols="30"
					// />
					<TextAreaTitle
						setValue = {setTitle}
						value = {title}
						onEscape = {discardEdit}
						bgColor = {bgColor}
					/>
				:
					<h6 className="text-white font-bold text-base">
						{title}
					</h6>
			}
			<div className="flex items-center gap-3">
				<time dateTime={thread.created_at}
					className="text-xs text-zinc-400">
					{thread.created_at}
				</time>
				<TextLink text={thread.username}
					link={`/user/${thread.username}`}
					className="text-xs text-zinc-400"/>
				{canDelete &&
					<OneThreadHeaderDeleteButton deleteThread = {deleteThread}/>
				}
			</div>
		</header>
	)
}

function OneThreadContent({
		content, 
		setContent, 
		canEdit, 
		isEditing, 
		setIsEditing, 
		saveEdit, 
		discardEdit,
		bgColor})
{
	const EditComponent = () => {
		return (
			<div>
			{ isEditing ?
				<>
				<TextButton text = "Save"
					onClick={saveEdit}/>
				<TextButton text = "Discard"
					onClick={discardEdit}/>
				</>
			:
				<TextButton text = "Edit"
					onClick={() => setIsEditing(true)}/>
			}
			</div>
		)
	}
	return (
		<section>
			{isEditing ? 
				<TextArea value = {content}
					setValue = {setContent}
					onEscape = {discardEdit}
					bgColor = {bgColor}
				/>
			:
				<p className="text-gray-200 text-sm break-words whitespace-pre-wrap">
					{content}
				</p>
			}
			{canEdit ? EditComponent() : <></>}
		</section>
	)
}

export function DisplayOneThread({thread, privilegeLvl, setRefreshKeyThread})
{
	const navigate = useNavigate()
	const user = useAuth().user

	const canEdit = (!user ? false : (thread.author_id === user.id))
	const canDelete = privilegeLvl >= 2 || canEdit
	// console.log(`CanEdit: ${canEdit} | CanDelete: ${canDelete}`)

	const [isEditing, setIsEditing] = useState(false)
	const [postInfo, setPostInfo] = useState({title: thread.title, content: thread.content})

	const postColor = getRandomPastel(getSeedThreadColor(thread)) 

	function getSeedThreadColor(thread) {
		const date = new Date(thread.created_at)
		return date.getMilliseconds() + (date.getSeconds() + date.getMinutes() * 60) * 1000 
	}

	async function deleteThread(e) {
		console.log(thread)
		if (window.confirm(`Delete "${thread.title}"? This action cannot be undone.`)) {
			const res = await apiDelete(`/board/${thread.board_id}/post/${thread.id}`)
			if (res.ok) {
				console.log("Post deleted")
				setRefreshKeyThread()
			} else
				console.log("Post not deleted: " + res.status)
		}
	}
	
	const saveEdit = async () => {
		setIsEditing(false)
		console.log(postInfo.content)
		if (false) {
			//api
			setRefreshKeyThread()
		}
	}
	const discardEdit = () => {
		setPostInfo({title: thread.title, content: thread.content})
		setIsEditing(false)
	}

	return (
		<article onClick={() => (!isEditing && navigate(`/post/${thread.id}`))}
			className="bg-zinc-700 rounded-xl p-2 cursor-pointer hover:bg-zinc-700 transition"
			style={{ borderWidth: '5px', borderStyle: 'solid', borderColor: postColor }}>
			<OneThreadHeader
				thread = {thread}
				title = {postInfo.title}
				setTitle = {(value) => {setPostInfo(prev => ({...prev, ["title"]: value}))}}
				isEditing = {isEditing}
				canDelete = {canDelete}
				deleteThread = {deleteThread}
				discardEdit = {discardEdit}
				bgColor = {postColor}
			/>
			<hr className="mb-2 -mx-4" style={{borderStyle: 'solid', borderColor: postColor, borderTopWidth: '3px'}}/>
			<OneThreadContent content = {postInfo.content}
				setContent = { (value) => {setPostInfo(prev => ({...prev, ["content"]: value}))}}
				canEdit = {canEdit}
				isEditing = {isEditing}
				setIsEditing = {setIsEditing}
				saveEdit = {saveEdit}
				discardEdit = {discardEdit}
				bgColor = {postColor}
			/>
			
		</article>
	)
}

export default function DisplayThreads({board, privilegeLvl, refreshKeyThread, setRefreshKeyThread}) {
	const userHandler = useAuth()
	const [loading, setLoading] = useState(true)
	const [threads, setThreads] = useState([])
	
	useEffect(() => {
		const fetchThreads = async (boardName) => {
			const res = await apiGet(`/board/${boardName}/threads`)
			if (res.ok) {
				// console.log(res)
				setThreads(res.json)
				setLoading(false)
			}
		}
		fetchThreads(board.name)
		// console.log(board)
	}, [refreshKeyThread])

	if (loading) return "loading"
	// console.log("Threads: "+threads)
	return(
	<>
		{threads.map((oneThread) =>
			<DisplayOneThread key={oneThread.id}
				thread={oneThread}
				privilegeLvl={privilegeLvl}
				setRefreshKeyThread={setRefreshKeyThread}
			/>)
		}
	</>
	)
}
