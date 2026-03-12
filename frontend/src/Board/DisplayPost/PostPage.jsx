import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import useAuth from "../../User/AuthProvider";
import useNotif from "../../components/Notif";

import Loading from "../../components/Loading";
import { apiGet, apiPost } from "../../Utils/api";
import Post from "./Post";

import TextArea from "../../components/TextArea";
import Button from "../../components/Button"

import WrapReplies from "./WrapReply"
import InfinitScrollReplies from "./InfinitScrollReplies";

export function InputReply({updateReplies, postID}) {
	const notifHandle = useNotif()
	const { user } = useAuth()
	const [content, setContent] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const onSubmit = async (e) => {
		if (e) e.preventDefault()
		if (!content.trim()) return

		setIsSubmitting(true)
		const res = await apiPost(`/post/${postID}/reply`, {
			body: JSON.stringify({ 'content': content })
		})
		setIsSubmitting(false)

		if (!res.ok) {
			notifHandle.pushError(res.status)
		} else {
			notifHandle.pushSuccess("Reply posted")
			setContent("")
			updateReplies()
		}
	}

	if (!user) return (
		<div className="bg-surface-50 border border-surface-200 rounded-2xl p-6 text-center mt-8">
			<p className="text-surface-500 text-sm mb-4 font-medium text-center">Join the discussion to share your thoughts.</p>
			<div className="flex justify-center gap-3">
				<Button onClick={() => window.location.href='/login'} variant="outline" size="sm">Login</Button>
				<Button onClick={() => window.location.href='/register'} variant="primary" size="sm">Sign Up</Button>
			</div>
		</div>
	)

	return (
		<div className="mt-8 flex gap-4">
			<div className="flex-shrink-0 hidden sm:block">
				<div className="w-10 h-10 rounded-full bg-brand-400 flex items-center justify-center text-white font-black text-sm">
					{user.username[0].toUpperCase()}
				</div>
			</div>
			<form onSubmit={onSubmit} className="flex-1 space-y-3">
				<textarea 
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Write your response..."
					className="w-full px-4 py-3 bg-white border border-surface-200 rounded-2xl text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all min-h-[100px] resize-none shadow-soft"
				/>
				<div className="flex justify-end">
					<Button type="submit" disabled={isSubmitting || !content.trim()} size="sm">
						{isSubmitting ? "Posting..." : "Post Response"}
					</Button>
				</div>
			</form>
		</div>
	)
}

export function DisplayPostReplies({postID, privilegeLvl}) {
	const userHandle = useAuth()
	const [updateRepliesKey, setUpdateRepliesKey] = useState(0)
	const updateReplies = () => {setUpdateRepliesKey(prev => prev + 1)}

	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<InfinitScrollReplies 
					postID={postID}
					privilegeLvl={privilegeLvl}
					refreshKeyReplies={updateRepliesKey}
					setRefreshKeyReplies={updateReplies}
				/>
			</div>
			
			{userHandle.loading ? <Loading/> : <InputReply updateReplies={updateReplies} postID={postID}/>}
		</div>
	)
}

export default function PostPage() {
	const { postID } = useParams()
	const notifHandle = useNotif()
	const navigate = useNavigate()

	const [loading, setLoading] = useState(true)
	const [post, setPost] = useState(null)
	const [refreshPostKey, setRefreshPostKey] = useState(0)
	const [privilegeLvl, setPrivilegeLvl] = useState(0)

	const refreshPost = () => {setRefreshPostKey(prev => prev + 1)}

	useEffect(() => {
		const fetchPostData = async () => {
			setLoading(true)
			const res = await apiGet(`/post/${postID}`)
			if (!res.ok) {
				notifHandle.pushError(res.status)
				setPost(null)
			} else {
				setPost(res.json)
			}
			setLoading(false)
		}
		fetchPostData()
	}, [refreshPostKey, postID, notifHandle])

	if (loading) return <div className="p-24"><Loading/></div>
	if (!post) return <div className="p-24 text-center text-surface-500 font-medium">Post not found</div>

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				
				{/* Simple navigation breadcrumb */}
				<nav className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest text-surface-400">
					<Link to="/board" className="hover:text-brand-600 transition-colors">Boards</Link>
					<span>/</span>
					<Link to={`/board/${post.board_name || '...'}`} className="hover:text-brand-600 transition-colors truncate max-w-[150px]">
						{post.board_name || 'Community'}
					</Link>
					<span>/</span>
					<span className="text-surface-900 truncate max-w-[200px]">Thread</span>
				</nav>

				<main>
					{/* Primary Post */}
					<div className="mb-16">
						<Post 
							key={post.id}
							post={post}
							privilegeLvl={privilegeLvl}
							update={refreshPost}
							canClickLink={false}
						/>
					</div>
					
					{/* Discussion Section */}
					<div className="relative">
						<div className="flex items-center justify-between mb-8">
							<h3 className="text-xl font-black text-surface-900 tracking-tight italic">The Discussion</h3>
							<div className="h-px flex-1 bg-surface-100 mx-6"></div>
						</div>
						
						<DisplayPostReplies postID={post.id} privilegeLvl={privilegeLvl}/>
					</div>
				</main>
			</div>
		</div>
	)
}
