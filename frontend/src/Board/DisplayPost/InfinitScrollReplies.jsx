import {useState, useEffect, useRef} from "react"

import useNotif from "../components/Notif"
import { apiGet } from "../Utils/api";

import Loading from "../components/Loading"
import Post from "./DisplayPost/Post";

function ButtonScrollTop({fetchTop, reloadPost})
{
	return (
		<div className="max-w-screen-xl w-full flex items-center gap-2 h-fit">
			<button onClick = {fetchTop}>
				Load previous
			</button>
			<button onClick = {reloadPost}>
				Back to the top
			</button>
		</div>
	)
}

export default function InfinitScrollReplies({postID, privilegeLvl, refreshKeyThread, setRefreshKeyThread})
{
	const nReplyOnPage = 20
	const nReplyOnScreen = nReplyOnPage * 2
	const notifHandle = useNotif()

	const refInfinitScrolling = useRef(null)
	const refSentinelBot = useRef(null)
	const [connectObserver, setConnectObserver] = useState(0)
	const reconnectObserver = () => setConnectObserver(connectObserver + 1)

	const [lowIndex, setLowIndex] = useState(0)
	const [hasMoreReply, setHasMoreReply] = useState(true)
	const [replies, setReplies] = useState([])
	
	const [loading, setLoading] = useState(true)
	const [loadingTop, setLoadingTop] = useState(false)
	const [loadingBot, setLoadingBotState] = useState(false)
	const loadingBotRef = useRef(false)
	const setLoadingBot = (val)=> {loadingBotRef.current = val; setLoadingBotState(val)}

	const fetchPost = async (lowIndex) => {
		const res = await apiGet(`/post/${postID}/newreplies?cursor=${lowIndex}&limit=${nReplyOnScreen}`) //post
		if (res.ok) {
			setLowIndex(lowIndex)
			setPosts(res.json)
			if (res.json.length === nReplyOnScreen)
				reconnectObserver()
			setHasMoreReply(res.json.length === nReplyOnScreen)
			notifHandle.pushSuccess(`Fetched post ${lowIndex}-${lowIndex + res.json.length}`)
		} else
			notifHandle.pushError(res.message)
	}

	const fetchIndex0 = async () => {
		setLoading(true)
		await fetchPost(0)
		setLoading(false)
	}

	const fetchTop = async () => {
		setLoadingTop(true)
		const newLowIndex = (lowIndex >= nReplyOnPage) ? (lowIndex - nReplyOnPage) : 0
		await fetchPost(newLowIndex)
		setLoadingTop(false)
	}

	const fetchBot = async () => {
		setLoadingBot(true)
		const newLowIndex = lowIndex + nReplyOnPage
		await fetchPost(newLowIndex)
		setLoadingBot(false)
	}

	useEffect(() => {
		if (loading) return
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach( entry => {
					if (!entry.isIntersecting) return
					if (entry.target === refSentinelBot.current) {
						if (!loadingBotRef.current)
							fetchBot()
					}
				})
		}, {root: refInfinitScrolling.current, rootMargin: '0px 0px 100px 0px'})
		
		if (refSentinelBot.current)
			observer.observe(refSentinelBot.current)
		
		return () => observer.disconnect()
	}, [connectObserver, loading])

	useEffect(() => {
		setLoading(true)
		const fetchPosts = async () => {
			await fetchPost(lowIndex)
			setLoading(false)
		}
		fetchPosts()
	}, [refreshKeyThread])

	// useEffect(() => {
	// 	notifHandle.pushNotif(`LowIndex ${lowIndex}`)
	// }, [lowIndex])

	return (
		<div ref={refInfinitScrolling}
				className="h-screen overflow-y-auto overflow-x-hidden w-[90%] mx-auto ">
			{lowIndex !== 0 && (
				loadingTop
					? <Loading/>
					: <ButtonScrollTop fetchTop={fetchTop} reloadPost={fetchIndex0}/>
			)}
			{posts.map((oneThread) =>
					<Post key={oneThread.id}
						post={oneThread}
						privilegeLvl={privilegeLvl}
						update={setRefreshKeyThread}
					/>)
			}
			{(loadingBot && !loading)
				? <Loading/>
				: (hasMoreReply && <div ref={refSentinelBot}></div>)
			}
		</div>
	)
}
