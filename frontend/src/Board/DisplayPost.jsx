import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import useAuth from "../User/AuthProvider";
import { apiGet } from "../Utils/api";

// mux.Get("/thread/{postID}/replies", boards.GetRepliesHandler(c))
// type Post struct {
// 	ID        int       `json:"id"`
// 	BoardID   int       `json:"board_id"`
// 	AuthorID  *int      `json:"author_id"`
// 	Username  string    `json:"username"`
// 	Title     *string   `json:"title"`
// 	Content   string    `json:"content"`
// 	ParentID  *int      `json:"parent_id"`
// 	CreatedAt time.Time `json:"created_at"`
// }
export default function DisplayPost({postID}) {
	const navigate = useNavigate()
	const userHandler = useAuth()

	const [loading, setLoading] = useState(true)
	
	const loggedIn = (userHandler.user != null)
	const [canEdit, setCanEdit] = useState(false)
	const [post, setPost] = useState({})
	const [replies, setReplies] = useState([])
	const [prevPost, setPrevPost] = useState([])

	useEffect(() => {
		const getPost = async (postID) => {
			try {
				const response = await apiGet(`/thread/${boardName}`)
				if (!response.ok) {
					throw (await response.status)
				}
				console.log(response)
				const data = await response.json()
				if (data.success == false)
					throw (data.context)
				setPost(data)
			} catch (err) {
				console.log(err)
			}
		}
		getPost(postID)
		setLoading(false)
	}, [])

	if (loading) return "loading"
	
	return (
		<></>
	)
}
