import { useEffect, useState } from "react";
import { useNavigation } from "react-dom"
import useAuth from "../User/AuthProvider";
import { apiGet } from "../Utils/api";


export default function DisplayPost({board, postID}) {
	const baseURL = `/board/${board.name}/`
	const userHandler = useAuth()
	const [loading, setLoading] = useState(true)
	const [post, setPost] = useState([])
	
	useEffect(() => {
		const getPost = async (postID) => {
			try {
				// const response = await apiGet(`/board/${boardName}`)
				// if (!response.ok) {
				// 	throw (await response.status)
				// }
				// console.log(response)
				// const data = await response.json()
				// if (data.success == false)
				// 	throw (data.context)
				// setPost(data)
			} catch (err) {
				console.log(err)
			}
		}
		getPost(postID)
		setLoading(false)
	}, [])

	if (loading) return "loading"
	
	return(
		<></>
	)
}
