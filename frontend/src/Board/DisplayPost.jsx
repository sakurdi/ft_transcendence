import { useEffect, useState } from "react";
import { useNavigation } from "react-dom"
import useAuth from "../User/AuthProvider";


export default function DisplayPost({board, postID}) {
	const baseURL = "/board/" + board.name + "/"
	const userHandler = useAuth()
	const [loading, setLoading] = useState(true)
	const [post, setPost] = useState([])
	
	useEffect(() => {
		const getPost = async (postID) => {
			try {
				// const response = await fetch("/api/board/" + boardName,)
				// if (!response.ok) {
				// 	throw (await response.text())
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
