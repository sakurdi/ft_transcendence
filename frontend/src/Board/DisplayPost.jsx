import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import useAuth from "../User/AuthProvider";
import { apiDelete, apiGet } from "../Utils/api";
import TextButton, { TextLink } from "../components/TextButton";
import getRandomPastel from "../Utils/colors";
import TextArea, { TextAreaTitle } from "../components/TextArea";
import Tooltip from "../components/Tooltip";
import getFileFormat from "../Utils/Data";
import { BASE } from "../Utils/api.jsx";

function getSeedpostColor(post) {
	const date = new Date(post.created_at)
	return date.getMilliseconds() + (date.getSeconds() + date.getMinutes() * 60) * 1000 
}

function EditComponentButtons({isEditing, saveEdit, discardEdit, setEditing}) {
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
		
		case 'application':
			return <p>
					<embed src={path} width="600px" height="300px"/>
			</p>

		case 'text':
			return <p>
					<a href src={path} download="file">Download</a> <a/>
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

export default function DisplayPost({post, privilegeLvl, refreshKey})
{
	const navigate = useNavigate()
	const user = useAuth().user

	const canEdit = (!user ? false : (post.author_id === user.id))
	const canDelete = privilegeLvl >= 2 || canEdit

	const [isEditing, setIsEditing] = useState(false)
	const [postInfo, setPostInfo] = useState({title: post.title, content: post.content})
	const titleRef = useRef(null)
	const contentRef = useRef(null)

	const postColor = getRandomPastel(getSeedpostColor(post)) 
	
	useEffect(() => {
		if (isEditing == true && titleRef.current) {
			const refArea = titleRef.current
			console.log("Trying to focus")
			refArea.focus()
			refArea.setSelectionRange(refArea.value.length, refArea.value.length)
		}
	}, [isEditing])

	function onEnterTitle() {
		if (contentRef.current) {
			const refArea = contentRef.current
			console.log("Trying to focus on content")
			refArea.focus()
			refArea.setSelectionRange(refArea.value.length, refArea.value.length)

		}
	}

	async function deletePost(e) {
		console.log(post)
		if (window.confirm(`Delete "${post.title}"? This action cannot be undone.`)) {
			const res = await apiDelete(`/board/${post.board_id}/post/${post.id}`)
			if (res.ok) {
				console.log("Post deleted")
				refreshKey()
			} else
				console.log("Post not deleted: " + res.status)
		}
	}
	
	async function saveEdit() {
		setIsEditing(false)
		console.log(postInfo.content)
		if (false) {
			//api
			refreshKey()
		}
	}

	function discardEdit() {
		setPostInfo({title: post.title, content: post.content})
		setIsEditing(false)
	}

	return (
	<article onClick={() => (!isEditing && navigate(`/post/${post.id}`))}
			className="bg-zinc-700 rounded-xl p-2 cursor-pointer hover:bg-zinc-700 transition"
			style={{ borderWidth: '5px', borderStyle: 'solid', borderColor: postColor }}>
		<header className="mb-2">
			{isEditing ?
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
			}
			<div className="flex items-center gap-3">
				<time dateTime={post.created_at}
					className="text-xs text-zinc-400">
					{post.created_at}
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
			{canEdit &&
				<EditComponentButtons isEditing = {isEditing}
					saveEdit = {() => {saveEdit()}}
					discardEdit = {discardEdit}
					setEditing = {() => {setIsEditing(true)}}
				/>
			}
			<DisplayFile post={post}/>
		</section>

	</article>
	)
}
