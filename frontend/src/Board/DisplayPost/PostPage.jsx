import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../../User/AuthProvider";
import useNotif from "../../components/Notif";

import Loading from "../../components/Loading";
import { apiGet, apiPost } from "../../Utils/api";
import Post from "./Post";

import TextArea from "../../components/TextArea";
import Button from "../../components/Button"

import WrapReplies from "./WrapReply"
import InfinitScrollReplies from "./InfinitScrollReplies";

// type PostCreate struct {
// 	Title    *string `json:"title"`
// 	Content  string  `json:"content"`
// 	ParentID *int    `json:"parent_id"`
// }

export function InputReply({updateReplies, postID, boardID}) {
	const notifHandle = useNotif()
	const [content, setContent] = useState("")

	const onSubmit = async () => {
		const res = await apiPost(`/post/${postID}/reply`, {
			body: JSON.stringify({
				'content': content,
			})
		})
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

export function DisplayPostReplies({postID, privilegeLvl}) {
	const userHandle = useAuth()

	const [updateRepliesKey, setUpdateRepliesKey] = useState(0)

	const updateReplies = () => {setUpdateRepliesKey(1 +updateRepliesKey)}

	return (
		<WrapReplies>
			<InfinitScrollReplies postID = {postID}
				privilegeLvl = {privilegeLvl}
				refreshKeyReplies = {updateRepliesKey}
				setRefreshKeyReplies = {updateReplies}/>
			{userHandle.loading
				? <Loading/>
				: (userHandle.user &&
					<InputReply updateReplies = {updateReplies}
						postID = {postID}/>)
			}
		</WrapReplies>
	)
}

export default function PostPage({}) {
	const { postID } = useParams()
	// const userHandle = useAuth()
	const notifHandle = useNotif()

	const [loading, setLoading] = useState(true)
	const [post, setPost] = useState(null)
	const [refreshPostKey, setRefreshPostKey] = useState(0)

	const [privilegeLvl, setPrivilegeLvl] = useState(0)

	const refreshPost = () => {setRefreshPostKey(refreshPostKey + 1)}

	useEffect(() => {
		const fetchPost = async () => {
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
		fetchPost()
		// console.log(postID)
	}, [refreshPostKey, postID])

	if (loading) return <Loading/>
	if (!post) return "No post"
	// console.log(post)
	return (
		<>
			<Post key={post.id}
				post = {post}
				privilegeLvl={privilegeLvl}
				update={refreshPost}
				canClickLink = {false}/>
			<DisplayPostReplies postID={post.id}/>
		</>
	)
}
