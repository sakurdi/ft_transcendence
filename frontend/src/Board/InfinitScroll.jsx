import {useState, useEffect, useLayoutEffect, useRef} from "react"

import useNotif from "../components/Notif"
import { apiGet } from "../Utils/api";

import Loading from "../components/Loading"
import Post from "./DisplayPost/Post";


export default function InifitScroll({boardName, privilegeLvl, refreshKeyThread, setRefreshKeyThread})
{
	const nPostOnPage = 20
	const nPostOnScreen = nPostOnPage * 2
	const notifHandle = useNotif()

	const refInfinitScrolling = useRef(null)
	const refScrollAnchor = useRef(null)
	const refSentinelBot = useRef(null)
	const [connectObserver, setConnectObserver] = useState(0)
	const reconnectObserver = () => setConnectObserver(connectObserver + 1)

	const [lowIndex, setLowIndex] = useState(0)
	const [hasMorePost, setHasMorePost] = useState(true)
	const [posts, setPosts] = useState([])
	
	const [loading, setLoading] = useState(true)
	const [loadingTop, setLoadingTop] = useState(false)
	const [loadingBot, setLoadingBotState] = useState(false)
	const loadingBotRef = useRef(false)
	const setLoadingBot = (val)=> {loadingBotRef.current = val; setLoadingBotState(val)}

	const fetchTop = async () => {
		refScrollAnchor.current = refInfinitScrolling.current.scrollHeight
		setLoadingTop(true)
		const newLowIndex = (lowIndex >= nPostOnPage) ? (lowIndex - nPostOnPage) : 0
		const res = await apiGet(`/board/${boardName}/newthreads?cursor=${newLowIndex}&limit=${nPostOnScreen}`) //post
		if (res.ok) {
			setLowIndex(newLowIndex)
			setPosts(res.json)
			setHasMorePost(res.json.length === nPostOnScreen)
			notifHandle.pushSuccess(`Fetched post ${newLowIndex}-${newLowIndex + res.json.length}`)
		} else
			notifHandle.pushError(res.message)
		setLoadingTop(false)
	}

	const fetchBot = async () => {
		setLoadingBot(true)
		const newLowIndex = lowIndex + nPostOnPage
		const res = await apiGet(`/board/${boardName}/newthreads?cursor=${newLowIndex}&limit=${nPostOnScreen}`) //post
		if (res.ok) {
			setLowIndex(newLowIndex)
			setPosts(res.json)
			if (res.json.length === nPostOnScreen)
				reconnectObserver()
			setHasMorePost(res.json.length === nPostOnScreen)
			notifHandle.pushSuccess(`Fetched post ${newLowIndex}-${newLowIndex + res.json.length}`)
		} else
			notifHandle.pushError(res.message)
		setLoadingBot(false)
	}

	useEffect(() => {
		if (loading) return
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach( entry => {
					if (!entry.isIntersecting) return
					if (entry.target === refSentinelBot.current) {
						notifHandle.pushNotif(`BotShow`)
						if (!loadingBotRef.current)
							fetchBot()
					}
				})
		}, {root: refInfinitScrolling.current, rootMargin: '0px 0px 50px 0px'})
		
		if (refSentinelBot.current)
			observer.observe(refSentinelBot.current)
		
		return () => observer.disconnect()
	}, [connectObserver, loading])

	useLayoutEffect(() => {
		if (refScrollAnchor.current === null) return
		const newHeight = refInfinitScrolling.current.scrollHeight
		refInfinitScrolling.current.scrollTop += newHeight - refScrollAnchor.current
		refScrollAnchor.current = null
	}, [posts])

	useEffect(() => {
		setLoading(true)
		const fetchPosts = async () => {
			const newLowIndex = 0
			const res = await apiGet(`/board/${boardName}/newthreads?cursor=${newLowIndex}&limit=${nPostOnScreen}`) //post
			if (res.ok) {
				setLowIndex(newLowIndex)
				setPosts(res.json)
				setHasMorePost(res.json.length === nPostOnScreen)
				if (res.json.length === nPostOnScreen)
					reconnectObserver()
				notifHandle.pushSuccess(`Fetched post ${newLowIndex}-${newLowIndex + res.json.length}`)
			} else
				notifHandle.pushError(res.message)
			setLoading(false)
		}
		fetchPosts()
	}, [refreshKeyThread])

	useEffect(() => {
		notifHandle.pushNotif(`LowIndex ${lowIndex}`)
	}, [lowIndex])

	return (
		<div ref={refInfinitScrolling}
				className="h-screen overflow-y-scroll">
			{lowIndex !== 0 && (
				<button onClick = {fetchTop}>
					{loadingTop ? <Loading/> : "Load previous"}
				</button>
			)}
			{posts.map((oneThread) =>
					<Post key={oneThread.id}
						post={oneThread}
						privilegeLvl={privilegeLvl}
						refreshKey={setRefreshKeyThread}
					/>)
			}
			{(loadingBot && !loading)
				? <Loading/>
				: (hasMorePost && <div ref={refSentinelBot}></div>)
			}
		</div>
	)
}
