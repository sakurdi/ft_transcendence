import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../../User/AuthProvider";
import useNotif from "../../components/Notif";

import Loading from "../../components/Loading";
import { apiGet, apiPost } from "../../Utils/api";
import Post from "./Post";
import Button from "../../components/Button"
import WrapReplies from "./WrapReply"
import InfinitScrollReplies from "./InfinitScrollReplies";

export function InputReply({ updateReplies, postID }) {
	const notifHandle = useNotif()
	const [content, setContent] = useState("")

	const onSubmit = async () => {
		const res = await apiPost(`/post/${postID}/reply`, {
			body: JSON.stringify({ 'content': content })
		})
		if (!res.ok) {
			notifHandle.pushError(res.status)
		} else {
			notifHandle.pushSuccess("Reply posted")
			setContent("")
			updateReplies()
		}
	}

	return (
		<form onSubmit={(e) => { e.preventDefault(); onSubmit() }}
			className="mt-4 glass rounded-xl p-4 space-y-3">
			<p className="text-xs font-semibold text-[#55556a] uppercase tracking-wider">
				Write a reply
			</p>
			<textarea
				value={content}
				onChange={e => setContent(e.target.value)}
				placeholder="Share your thoughts…"
				rows={3}
				className="resize-none"
			/>
			<div className="flex justify-end">
				<Button type="submit" className="text-xs px-4 py-2 shadow-md shadow-g_seagreen/20">
					Reply
				</Button>
			</div>
		</form>
	)
}

export function DisplayPostReplies({ postID, privilegeLvl }) {
	const userHandle = useAuth()
	const [updateRepliesKey, setUpdateRepliesKey] = useState(0)
	const updateReplies = () => setUpdateRepliesKey(1 + updateRepliesKey)

	return (
		<WrapReplies>
			<InfinitScrollReplies
				postID={postID}
				privilegeLvl={privilegeLvl}
				refreshKeyReplies={updateRepliesKey}
				setRefreshKeyReplies={updateReplies}
			/>
			{userHandle.loading
				? <Loading />
				: userHandle.user && <InputReply updateReplies={updateReplies} postID={postID} />
			}
		</WrapReplies>
	)
}

export default function PostPage() {
	const { postID } = useParams()
	const notifHandle = useNotif()
	const navigate = useNavigate()

	const [loading, setLoading] = useState(true)
	const [post, setPost] = useState(null)
	const [refreshPostKey, setRefreshPostKey] = useState(0)
	const [privilegeLvl] = useState(0)

	const refreshPost = () => setRefreshPostKey(refreshPostKey + 1)

	useEffect(() => {
		const fetchPost = async () => {
			setLoading(true)
			const res = await apiGet(`/post/${postID}`)
			if (!res.ok) { notifHandle.pushError(res.status); setPost(null) }
			else setPost(res.json)
			setLoading(false)
		}
		fetchPost()
	}, [refreshPostKey, postID])

	if (loading) return <Loading />
	if (!post) return (
		<div className="flex flex-col items-center justify-center py-24 gap-4">
			<p className="text-[#55556a] text-lg">Post not found</p>
			<button onClick={() => navigate(-1)} className="text-g_seagreen text-sm hover:underline">
				Go back
			</button>
		</div>
	)

	return (
		<div className="space-y-4">
			<Post key={post.id} post={post} privilegeLvl={privilegeLvl} update={refreshPost} canClickLink={false} />
			<DisplayPostReplies postID={post.id} />
		</div>
	)
}
