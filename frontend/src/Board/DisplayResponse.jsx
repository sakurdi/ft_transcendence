import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../UserHandle/AuthProvider";

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

export default function DisplayResponse({resposeID}) {
	const userHandle = useAuth()
	const navigation = useNavigate()
	
	const [loading, setLoading] = useState(true)
	const [response, setResponse] = useState({
		id: [],
		ownerUsername: [],
		content: "Salut",
	})

	if (loading) return "Loading"

	
	

}
