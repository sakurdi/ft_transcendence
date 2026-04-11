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
import TextArea, { TextAreaTitle } from "../../components/TextArea";
import Tooltip from "../../components/Tooltip";
import Loading from "../../components/Loading";

export function EditComponentButtons({ isEditing, saveEdit, discardEdit, setEditing }) {
	return (
		<div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/6">
			{isEditing ? (
				<>
					<button
						onClick={saveEdit}
						className="px-3 py-1 rounded-lg text-xs font-semibold
							bg-g_seagreen text-white hover:bg-g_seagreen-600
							transition-colors duration-100 shadow-sm shadow-g_seagreen/20">
						Save
					</button>
					<button
						onClick={discardEdit}
						className="px-3 py-1 rounded-lg text-xs font-medium
							text-[#9898b8] hover:text-[#eaeaf4]
							transition-colors duration-100">
						Discard
					</button>
				</>
			) : (
				<button
					onClick={setEditing}
					className="px-3 py-1 rounded-lg text-xs font-medium
						text-[#55556a] hover:text-g_seagreen border border-transparent
						hover:border-g_seagreen/30 hover:bg-g_seagreen/5
						transition-all duration-100">
					Edit
				</button>
			)}
		</div>
	)
}

function MediaRenderer({ path }) {
	if (!path) return null

	const ext = path.substr(path.lastIndexOf('.') + 1)
	const format = getFileFormat(ext)

	switch (format) {
		case 'image':
			return (
				<div className="mt-3">
					<img src={path} alt="upload"
						className="max-w-xs max-h-64 rounded-xl object-cover
							border border-white/10 cursor-zoom-in
							hover:border-white/20 transition-all duration-150
							shadow-lg shadow-black/30" />
				</div>
			)
		case 'audio':
			return <div className="mt-3"><audio controls src={path} className="w-full max-w-xs h-10" /></div>
		case 'video':
			return (
				<div className="mt-3">
					<video controls src={path}
						className="max-w-xs max-h-64 rounded-xl border border-white/10 shadow-lg shadow-black/30" />
				</div>
			)
		default:
			return null
	}
}

function DisplayFile({ post }) {
	return <MediaRenderer path={`${BASE}` + post.upload_path} />
}

export default function DisplayPost({ post, privilegeLvl, update, canClickLink = true }) {
	const navigate = useNavigate()
	const userHandle = useAuth()
	const notifHandle = useNotif()

	const [loading, setLoading] = useState(true)
	const [canEdit, setCanEdit] = useState(false)
	const [canDelete, setCanDelete] = useState(privilegeLvl >= 2)
	const [isEditing, setIsEditing] = useState(false)
	const [postInfo, setPostInfo] = useState({ title: post.title, content: post.content })
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
			const isSuperAdmin = userHandle.user.role === 'superadmin'
			setCanEdit(userID === post.author_id)
			setCanDelete(isSuperAdmin || privilegeLvl >= 2 || userID === post.author_id)
		} else {
			setCanEdit(false)
			setCanDelete(false)
		}
		setLoading(false)
	}, [userHandle.loading, userHandle.user])

	if (loading) return <Loading />

	function onEnterTitle() {
		if (contentRef.current) {
			const refArea = contentRef.current
			refArea.focus()
			refArea.setSelectionRange(refArea.value.length, refArea.value.length)
		}
	}

	async function deletePost() {
		if (window.confirm(`Delete "${post.title}"? This action cannot be undone.`)) {
			const res = await apiDelete(`/board/${post.board_id}/post/${post.id}`)
			if (res.ok) {
				notifHandle.pushSuccess("Post deleted")
				if (update) update()
				else navigate(`/board/${post.board_id}`)
			} else {
				notifHandle.pushError(res.status)
			}
		}
	}

	async function saveEdit() {
		const res = await apiPut(`/post/${post.id}`, {
			body: JSON.stringify({ 'content': postInfo.content })
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
		setPostInfo({ title: post.title, content: post.content })
		setIsEditing(false)
	}

	return (
		<article
			onClick={() => (canClickLink && !isEditing) && navigate(`/post/${post.id}`)}
			className="group relative glass rounded-xl overflow-hidden
				transition-all duration-200
				hover:bg-white/8 hover:border-white/14"
			style={{
				borderLeftWidth: '3px',
				borderLeftColor: postColor,
				cursor: canClickLink ? 'pointer' : 'default',
			}}>

			<div className="p-4 pl-5">
				{/* Header */}
				<header className="mb-3">
					{postInfo.title != null && (
						// isEditing ? (
						// 	<TextAreaTitle
						// 		value={postInfo.title}
						// 		setValue={(value) => setPostInfo(prev => ({ ...prev, title: value }))}
						// 		onEscape={discardEdit}
						// 		bgColor="transparent"
						// 		onEnter={onEnterTitle}
						// 		ref={titleRef}
						// 	/>
						// ) : (
							<h6 className="text-[#eaeaf4] font-bold text-base leading-snug mb-2
								group-hover:text-white transition-colors duration-150">
								{postInfo.title}
							</h6>
						// )
					)}

					<div className="flex items-center gap-2 flex-wrap">
						<time dateTime={post.created_at} className="text-xs text-[#55556a]">
							{getDateDifferenceISO(post.created_at)}
						</time>
						<span className="text-[#55556a] text-xs">·</span>
						<TextLink text={post.username}
							link={`/user/${post.username}`}
							className="text-xs text-[#9898b8] hover:text-g_seagreen font-medium" />
						{canClickLink && (
							<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full
								text-[0.65rem] font-semibold border ${
								(post.reply_count ?? 0) === 0
									? "text-[#9898b8] bg-white/[0.06] border-white/[0.12]"
									: (post.reply_count ?? 0) >= 10
										? "text-red-400 bg-red-500/10 border-red-500/25"
										: "text-g_seagreen bg-g_seagreen/10 border-g_seagreen/25"
							}`}>
								↩ {post.reply_count ?? 0}
							</span>
						)}
						{canDelete && (
							<Tooltip content="Delete post">
								<button
									onClick={(e) => { e.stopPropagation(); deletePost() }}
									className="ml-auto text-xs text-[#55556a] hover:text-red-400
										transition-colors duration-100 px-1.5 py-0.5 rounded
										hover:bg-red-400/10">
									✕
								</button>
							</Tooltip>
						)}
					</div>
				</header>

				{/* Gradient divider using the post accent color */}
				<div className="h-px mb-3 -mx-5 -mr-4"
					style={{ background: `linear-gradient(to right, ${postColor}55, transparent 60%)` }} />

				{/* Content */}
				<section>
					{isEditing ? (
						<TextArea
							value={postInfo.content}
							setValue={(value) => setPostInfo(prev => ({ ...prev, content: value }))}
							onEscape={discardEdit}
							bgColor="transparent"
							ref={contentRef}
						/>
					) : (
						<p className="text-[#c8c8dc] text-sm leading-relaxed break-words whitespace-pre-wrap">
							{postInfo.content}
						</p>
					)}
					<DisplayFile post={post} />
				</section>

				{canEdit && (
					<footer onClick={e => e.stopPropagation()}>
						<EditComponentButtons
							isEditing={isEditing}
							saveEdit={saveEdit}
							discardEdit={discardEdit}
							setEditing={() => setIsEditing(true)}
						/>
					</footer>
				)}
			</div>
		</article>
	)
}
