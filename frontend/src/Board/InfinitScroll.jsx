import {useState, useEffect, useLayoutEffect, useRef} from "react"

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

export default function InifitScroll({boardName, privilegeLvl, refreshKeyThread, setRefreshKeyThread})
{
	const nPostOnPage = 20
	const nPostOnScreen = nPostOnPage * 2
	const notifHandle = useNotif()

	const refInfinitScrolling = useRef(null)
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

	const fetchPost = async (lowIndex) => {
		const res = await apiGet(`/board/${boardName}/newthreads?cursor=${lowIndex}&limit=${nPostOnScreen}`) //post
		if (res.ok) {
			setLowIndex(lowIndex)
			setPosts(res.json)
			if (res.json.length === nPostOnScreen)
				reconnectObserver()
			setHasMorePost(res.json.length === nPostOnScreen)
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
		const newLowIndex = (lowIndex >= nPostOnPage) ? (lowIndex - nPostOnPage) : 0
		await fetchPost(newLowIndex)
		setLoadingTop(false)
	}

	const fetchBot = async () => {
		setLoadingBot(true)
		const newLowIndex = lowIndex + nPostOnPage
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
				: (hasMorePost && <div ref={refSentinelBot}></div>)
			}
		</div>
	)
}
