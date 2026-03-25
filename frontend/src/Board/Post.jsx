import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../User/AuthProvider";
import useNotif from "../components/Notif";

import Loading from "../components/Loading";
import { apiGet, apiPost } from "../Utils/api";
import DisplayPost from "./DisplayPost";
import TextArea from "../components/TextArea";
import Button from "../components/Button"


export function InputReply({updateReplies, postID, boardID}) {
	const notifHandle = useNotif()
	const [content, setContent] = useState("")

	const onSubmit = () => {
		const res = apiPost(`/post/${postID}/reply`)
		if (!res.ok) {
			notifHandle.pushError(res.status)
		} else {
			
			notifHandle.pushSuccess("Reply posted")
			updateReplies()
		}
	}

	return (
		<form onSubmit={(e) => {e.preventDefault(); onSubmit()}}>
			<TextArea value = {content}
				setValue = {setContent}/>
			<Button type = "submit">
				Reply
			</Button>
		</form>
	)
}

export function DisplayPostReplies({postID}) {
	const userHandle = useAuth()
	const notifHandle = useNotif()

	const [keyReplies, setKeyReplies] = useState(0)
	const [loading, setLoading] = useState(true)
	const [replies, setReplies] = useState([])
	
	const updateReplies = () => {setKeyReplies(keyReplies + 1)}

	useEffect(() => {
		setLoading(true)
		const fetchReplies = async (postID) => {
			const res = await apiGet(`/post/${postID}/replies`)
			if (res.ok) {
				setReplies(res.json)
			} else {
				notifHandle.pushError(res.status)
				console.log('2')
			}
			setLoading(false)
		}
		fetchReplies(postID)
	}, [keyReplies])

	if (loading) return <Loading/>
	// if (!replies || replies.length == 0) return "No replies"
	if (replies?.length != 0)
		console.log(replies)
	return (
		<>
		{
			!replies || replies.length == 0
				?	"No replies"
				:	replies.map((oneReply) =>
						<DisplayReply key={oneReply.id}
							post={oneReply}
							privilegeLvl={privilegeLvl}
							refreshKey={setRefreshKeyThread}
						/>)
		}
		{(!userHandle.loading && userHandle.user) &&
			<InputReply updateReplies = {updateReplies}
				postID = {postID}/>
		}
		</>
	)
}

export default function PostPage({}) {
	const { postID } = useParams()
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const navigate = useNavigate()

	const [loading, setLoading] = useState(true)
	const [post, setPost] = useState(null)
	const [refreshPostKey, setRefreshPostKey] = useState(0)

	const refreshPost = () => {setRefreshPostKey(refreshPostKey + 1)}

	useState(() => {
		const fetchPost = async () => {
			setLoading(true)
			const res = await apiGet(`/post/${postID}`)
			// console.log(res)
			if (!res.ok) {
				notifHandle.pushError(res.status)
				console.log('1')
				setPost(null)
			} else {
				setPost(res.json)
			}
			setLoading(false)
		}
		fetchPost()
	}, [refreshPostKey])

	if (loading) return <Loading/>
	if (!post) return "No post"
	// console.log(post)
	return (
		<>
			<DisplayPost key={post.id}
				post = {post}
				privilegeLvl={0}
				refreshKey={refreshPostKey}/>
			<DisplayPostReplies post={post}/>
		</>
	)
}
