import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"

import getFileFormat from "../../Utils/Data";
import { BASE } from "../../Utils/api.jsx";

import useAuth from "../../User/AuthProvider";
import useNotif from "../../components/Notif";

import { apiDelete, apiPut } from "../../Utils/api";
import { getRandomPastelDate } from "../../Utils/colors";
import getDateDifferenceISO from "../../Utils/date";

import { TextLink } from "../../components/TextButton";
import Button from "../../components/Button";
import TextArea, { TextAreaTitle } from "../../components/TextArea";
import Tooltip from "../../components/Tooltip";

export function EditComponentButtons({isEditing, saveEdit, discardEdit, setEditing}) {
	return (
		<div className="flex gap-2">
		{ isEditing ?
			<>
				<Button size="sm" variant="primary" onClick={saveEdit}>
					Save
				</Button>
				<Button size="sm" variant="ghost" onClick={discardEdit}>
					Discard
				</Button>
			</>
		:
			<Button size="sm" variant="ghost" className="text-surface-400 hover:text-brand-600" onClick={setEditing}>
				Edit
			</Button>
		}
		</div>
	)
}

function MediaRenderer({path}) {
	if (!path)
		return null

	var ext = path.substr(path.lastIndexOf('.') + 1);
	var format = getFileFormat(ext);
	
	switch (format) {
		case 'image':
			return (
				<div className="mt-4 rounded-xl overflow-hidden border border-surface-200 shadow-sm w-fit max-w-full">
					<img src={path} alt="Upload" className="max-h-96 object-contain"/>
				</div>
			)
		case 'audio':
			return <audio className="mt-4 w-full" controls src={path}/>
		case 'video':
			return <video className="mt-4 w-full rounded-xl" controls src={path}/>
		default:
			return null
	}
}

function DisplayFile({post}) {
	if (!post.upload_path) return null
	return <MediaRenderer path={`${BASE}${post.upload_path}`} />
}

export default function DisplayPost({post, privilegeLvl, update, canClickLink = true, isReply = false})
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
		if (isEditing && titleRef.current) {
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
	}, [userHandle.loading, userHandle.user, post.author_id, canDelete])

	if (loading) return null

	async function deletePost(e) {
		e.stopPropagation()
		if (window.confirm(`Delete this post?`)) {
			// Using the board-contextual deletion route
			const res = await apiDelete(`/board/${post.board_id}/post/${post.id}`)
			if (res.ok) {
				notifHandle.pushSuccess("Post removed")
				if (update) {
					update()
				} else {
					navigate(`/board`)
				}
			} else {
				notifHandle.pushError(res.status || "Failed to delete post")
			}
		}
	}
	
	async function saveEdit() {
		const res = await apiPut(`/post/${post.id}`, {
			body: JSON.stringify({ 'content': postInfo.content })
		})
		if (res.ok) {
			notifHandle.pushSuccess("Post updated")
			setIsEditing(false)
			update()
		} else {
			notifHandle.pushError(res.status)
		}
	}

	// Simplification for Discussion Focus:
	// Replies are much flatter and use less "card" space.
	if (isReply) {
		return (
			<div className="group flex gap-4 py-6 border-b border-surface-100 last:border-0 transition-colors hover:bg-surface-50/50 -mx-4 px-4">
				<div className="flex-shrink-0">
					<div 
						className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-sm"
						style={{ backgroundColor: postColor }}
					>
						{post.username[0].toUpperCase()}
					</div>
				</div>
				<div className="flex-1 min-w-0">
					<header className="flex justify-between items-center mb-1">
						<div className="flex items-center gap-2 text-sm">
							<span className="font-bold text-surface-900 cursor-pointer hover:text-brand-600" onClick={() => navigate(`/user/${post.username}`)}>
								{post.username}
							</span>
							<span className="text-surface-300">•</span>
							<time className="text-xs text-surface-400">{getDateDifferenceISO(post.created_at)}</time>
						</div>
						{canDelete && (
							<button onClick={deletePost} className="opacity-0 group-hover:opacity-100 text-surface-300 hover:text-red-500 transition-all text-xs font-bold uppercase tracking-widest">
								Delete
							</button>
						)}
					</header>
					
					<div className="text-surface-700 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
						{isEditing ? (
							<TextArea 
								value={postInfo.content}
								setValue={(value) => setPostInfo(prev => ({...prev, content: value}))}
								bgColor={postColor}
								ref={contentRef}
							/>
						) : (
							<p>{post.content}</p>
						)}
						<DisplayFile post={post}/>
					</div>

					<footer className="mt-2">
						{canEdit && (
							<EditComponentButtons 
								isEditing={isEditing}
								saveEdit={saveEdit}
								discardEdit={() => { setPostInfo({title: post.title, content: post.content}); setIsEditing(false); }}
								setEditing={() => setIsEditing(true)}
							/>
						)}
					</footer>
				</div>
			</div>
		)
	}

	return (
		<article 
			onClick={() => ((canClickLink && !isEditing) && navigate(`/post/${post.id}`))}
			className={`bg-white rounded-3xl border border-surface-200 p-8 transition-all duration-200 shadow-soft hover:shadow-md ${canClickLink && !isEditing ? 'cursor-pointer' : ''}`}
		>
			<header className="flex justify-between items-start mb-6">
				<div className="flex-1 min-w-0">
					{postInfo.title != null && (
						isEditing ? (
							<TextAreaTitle
								value={postInfo.title}
								setValue={(value) => setPostInfo(prev => ({...prev, title: value}))}
								bgColor={postColor}
								ref={titleRef}
							/>
						) : (
							<h1 className="text-3xl font-black text-surface-900 mb-2 leading-tight tracking-tight">
								{postInfo.title}
							</h1>
						)
					)}
					<div className="flex items-center gap-3">
						<div className="w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center text-[10px] font-black" style={{ color: postColor }}>
							{post.username[0].toUpperCase()}
						</div>
						<div className="flex items-center gap-2 text-xs text-surface-400">
							<span className="font-bold text-surface-900 hover:text-brand-600 transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/user/${post.username}`) }}>
								@{post.username}
							</span>
							<span>•</span>
							<time>{getDateDifferenceISO(post.created_at)}</time>
						</div>
					</div>
				</div>

				{canDelete && (
					<Button variant="ghost" size="sm" onClick={deletePost} className="text-surface-300 hover:text-red-500 p-2 h-auto rounded-full">
						✕
					</Button>
				)}
			</header>

			<section className="mb-8">
				{isEditing ? (
					<TextArea 
						value={postInfo.content}
						setValue={(value) => setPostInfo(prev => ({...prev, content: value}))}
						bgColor={postColor}
						ref={contentRef}
					/>
				) : (
					<p className="text-surface-700 text-lg leading-relaxed whitespace-pre-wrap break-words">
						{postInfo.content}
					</p>
				)}
				<DisplayFile post={post}/>
			</section>

			{canEdit && (
				<footer className="pt-6 border-t border-surface-100">
					<EditComponentButtons 
						isEditing={isEditing}
						saveEdit={saveEdit}
						discardEdit={() => { setPostInfo({title: post.title, content: post.content}); setIsEditing(false); }}
						setEditing={(e) => { e.stopPropagation(); setIsEditing(true); }}
					/>
				</footer>
			)}
		</article>
	)
}
