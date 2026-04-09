import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"

import getFileFormat from "../../Utils/Data";
import { BASE } from "../../Utils/api.jsx";

import useAuth from "../../User/AuthProvider";
import useNotif from "../../components/Notif";

import { apiDelete, apiPut } from "../../Utils/api";
import { getRandomPastelDate } from "../../Utils/colors";
import getDateDifferenceISO from "../../Utils/date";

import TextButton, { TextLink } from "../../components/TextButton";
import TextArea, { TextAreaTitle } from "../../components/TextArea";
import Tooltip from "../../components/Tooltip";
import Loading from "../../components/Loading";

export function EditComponentButtons({isEditing, saveEdit, discardEdit, setEditing}) {
	return (
		<div>
		{ isEditing ?
			<>
			<TextButton text = "Save"
				onClick={(e) => saveEdit()}/>
			<TextButton text = "Discard"
				onClick={discardEdit}/>
			</>
		:
			<TextButton text = "Edit"
				onClick={setEditing}/>
		}
		</div>
	)
}

function MediaRenderer({path}) {
	if (!path)
		return

	var ext = path.substr(path.lastIndexOf('.') + 1);
	var format = getFileFormat(ext);
	
	switch (format) {
		case 'image':
			return <p>
				<img src={path}
							alt="upload123"
							className="w-24 h-24 object-cover border-2 border-stone-200"/>
			</p>

		case 'audio':
			return <p>
				<audio controls src={path}/>
			</p>

		case 'video':
			return <p>
					<video controls src={path}/>
			</p>
			
		default:
			<></>
	}
}

function DisplayFile({post}) {
	return <div>
		<MediaRenderer path={`${BASE}`+post.upload_path} />
	</div>
}

export default function DisplayPost({post, privilegeLvl, update, canClickLink = true})
{
	const navigate = useNavigate()
	const userHandle = useAuth()
	const notifHandle = useNotif()

	const [loading, setLoading] = useState(true)

	const [canEdit, setCanEdit] = useState(false)
	const [canDelete, setCanDelete] = useState(privilegeLvl >= 2)

	const [isEditing, setIsEditing] = useState(false)
	const [postInfo, setPostInfo] = useState({title: post.title, content: post.content})
	const titleRef = useRef(null)
	const contentRef = useRef(null)

	const postColor = getRandomPastelDate(post.created_at) 
	
	useEffect(() => {
		// if (postInfo.title === null) return
		if (isEditing == true && titleRef.current) {
			const refArea = titleRef.current
			refArea.focus()
			refArea.setSelectionRange(refArea.value.length, refArea.value.length)
		}
	}, [isEditing])

	useEffect(() => {
		if (userHandle.loading) return
		if (userHandle.user) {
			const userID = userHandle.user.id
			setCanEdit(userID === post.author_id)
			if (!canDelete)
				setCanDelete(userID === post.author_id)
		}
		setLoading(false)
	}, [userHandle.loading, userHandle.user])

	if (loading) return <Loading/>

	function onEnterTitle() {
		if (contentRef.current) {
			const refArea = contentRef.current
			refArea.focus()
			refArea.setSelectionRange(refArea.value.length, refArea.value.length)
		}
	}

	async function deletePost(e) {
		// console.log(post)
		if (window.confirm(`Delete "${post.title}"? This action cannot be undone.`)) {
			const res = await apiDelete(`/board/${post.board_id}/post/${post.id}`)
			if (res.ok) {
				notifHandle.pushSuccess("Post deleted")
				navigate(`/board/${post.board_id}`)
			} else
				notifHandle.pushError(res.status)
		}
	}
	
	async function saveEdit() {
		const res = await apiPut(`/post/${post.id}`, {
			body: JSON.stringify({
				'content': postInfo.content
			})
		})
		if (res.ok) {
			notifHandle.pushSuccess("Post edited")
			setIsEditing(false)
			update()
		} else {
			notifHandle.pushError(res.message)
		}
	}

	function discardEdit() {
		setPostInfo({title: post.title, content: post.content})
		setIsEditing(false)
	}

	return (
	<article onClick={() => ((canClickLink && !isEditing) && navigate(`/post/${post.id}`))}
			className="bg-zinc-700 rounded-xl p-2 cursor-pointer hover:bg-zinc-700 transition"
			style={{ borderWidth: '5px', borderStyle: 'solid', borderColor: postColor }}>
		<header className="mb-2">
			{	postInfo.title != null &&
				(isEditing ?
					<TextAreaTitle
						value = {postInfo.title}
						setValue = {(value) => {setPostInfo(prev => ({...prev, "title": value}))}}
						onEscape = {discardEdit}
						bgColor = {postColor}
						onEnter = {() => onEnterTitle()}
						ref = {titleRef}
					/>
				:
					<h6 className="text-white font-bold text-base">
						{postInfo.title}
					</h6>
				)
			}
			<div className="flex items-center gap-3">
				<time dateTime={post.created_at}
					className="text-xs text-zinc-400">
					{getDateDifferenceISO(post.created_at)}
				</time>
				<TextLink text={post.username}
					link={`/user/${post.username}`}
					className="text-xs text-zinc-400"/>
				{canDelete &&
					<Tooltip content = "Delete">
						<TextButton onClick = {deletePost}
							text = "❌"/>
					</Tooltip>
				}
			</div>
		</header>
		<hr className="mb-2 -mx-4" style={{borderStyle: 'solid', borderColor: postColor, borderTopWidth: '3px'}}/>
		<section>
			{ isEditing ?
				<TextArea value = {postInfo.content}
					setValue = {(value) => {setPostInfo(prev => ({...prev, "content": value}))}}
					onEscape = {discardEdit}
					bgColor = {postColor}
					ref = {contentRef}
				/>
			:
				<p className="text-gray-200 text-sm break-words whitespace-pre-wrap">
					{postInfo.content}
				</p>
			}
				<DisplayFile post={post}/>
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
