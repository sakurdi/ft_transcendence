import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import useNotif from "../components/Notif"
import useAuth from "../User/AuthProvider"

import { apiDelete, apiPut } from "../Utils/api";
import { getRandomPastelDate } from "../Utils/colors";
import getDateDifferenceISO from "../Utils/date";

import TextButton, { TextLink } from "../components/TextButton";
import TextArea, { TextAreaTitle } from "../components/TextArea";
import Tooltip from "../components/Tooltip";
import Loading from "../components/Loading";

import { EditComponentButtons } from "./DisplayPost"

export function WrapReplies({children}) {
	return (
		<div className="ml-3">
			{children}
		</div>
	)
}

function getCanDelete({userId, replyAuthorId, userRole, boardName}) {
	if (userId === replyAuthorId) return true
	if (userRole === "superadmin") return true
	
	// TOTO: fetch board userRole (need board name for that)	

	return false
}

// Object { id: 12, board_id: 2, author_id: 2,
// username: "gaeudes", title: null, content: "g",
// parent_id: 7, created_at: "2026-03-25T15:22:36.881258Z" }


export default function DisplayReply({reply, updateReplies}) {
	const navigate = useNavigate()
	const userHandle = useAuth()
	const notifHandle = useNotif()

	const replyColor = getRandomPastelDate(reply.created_at) 

	const [content, setContent] = useState(reply.content)
	const [isEditing, setIsEditing] = useState(false)
	const [canEdit, setCanEdit] = useState(false)
	const [canDelete, setCanDelete] = useState(false)


	useEffect(() => {
		if (userHandle.loading) return
		if (!userHandle.user) {
			setCanDelete(false)
			setCanEdit(false)
		} else {
			setCanEdit(userHandle.user.id == reply.author_id)
			setCanDelete(getCanDelete(userHandle.user.id, reply.author_id, userHandle.user.role, "<Undefined>"))
		}
	}, [userHandle.loading])
	console.log(reply)

	const saveEdit = async () => {
		const res = await apiPut(`/post/${reply.id}`, {
			body: JSON.stringify({
				'content': content
			})
		})
		if (res.ok) {
			notifHandle.pushSuccess("Post edited")
			updateReplies()
			setIsEditing(false)
		} else {
			notifHandle.pushError(res.message)
		}
	}

	const discardEdit = () => {
		setContent(reply.content)
		setIsEditing(false)
	}

	const deleteReply = async () => {
		console.log(`Deleting '${reply.content}'`)
		updateReplies()
	}

	return (
	<article onClick={() => (!isEditing && navigate(`/post/${reply.id}`))}
			className="bg-zinc-700 rounded-xl p-2 cursor-pointer hover:bg-zinc-700 transition"
			style={{ borderWidth: '5px', borderStyle: 'solid', borderColor: replyColor }}>
		<div className="flex items-center gap-3">
			<time dateTime={reply.created_at}
				className="text-xs text-zinc-400">
				{getDateDifferenceISO(reply.created_at)}
			</time>
			<TextLink text={reply.username}
				link={`/user/${reply.username}`}
				className="text-xs text-zinc-400"/>
			{canDelete &&
				<Tooltip content = "Delete">
					<TextButton onClick = {deleteReply}
						text = "❌"/>
				</Tooltip>
			}
		</div>
		<section>
			{ isEditing ?
				<TextArea value = {content}
					setValue = {setContent}
					onEscape = {discardEdit}
					bgColor = {replyColor}
				/>
			:
				<p className="text-gray-200 text-sm break-words whitespace-pre-wrap">
					{content}
				</p>
			}
		</section>
		<footer>
			{canEdit &&
				<EditComponentButtons isEditing = {isEditing}
					saveEdit = {() => {saveEdit()}}
					discardEdit = {discardEdit}
					setEditing = {() => {setIsEditing(true)}}
				/>
			}
		</footer>
	</article>
	)
}
