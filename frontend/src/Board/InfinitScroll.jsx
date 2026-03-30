import {useState, useEffect, useRef} from "react"

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
	const refSentinelTop = useRef(null)
	const refSentinelBot = useRef(null)
	const [lowIndex, setLowIndex] = useState(0)
	const [loadingTop, setLoadingTop] = useState(false)
	const [loadingBot, setLoadingBot] = useState(true)
	const [hasMorePost, setHasMorePost] = useState(true)
	const [posts, setPosts] = useState([])

	const fetchTop = async () => {
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
			setHasMorePost(res.json.length === nPostOnScreen)
			notifHandle.pushSuccess(`Fetched post ${newLowIndex}-${newLowIndex + res.json.length}`)
		} else
			notifHandle.pushError(res.message)
		setLoadingBot(false)
	}

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach( entry => {
					if (!entry.isIntersecting) return
					if (entry.target === refSentinelBot.current) {
						notifHandle.pushNotif(`BotShow`)
						if (!loadingBot) {
							fetchBot()
						}
					}
					if (entry.target === refSentinelTop.current) {
						notifHandle.pushNotif(`TopShow`)
						if (!loadingTop && lowIndex != 0)
							fetchTop()
					}
				})
		}, {root: refInfinitScrolling.current, rootMargin: '0px 0px 200px 0px'})
		
		if (refSentinelTop.current)
			observer.observe(refSentinelTop.current)
		if (refSentinelBot.current)
			observer.observe(refSentinelBot.current)
		
		return () => observer.disconnect()
	}, [loadingBot, loadingTop, hasMorePost])

	useEffect(() => {
		const fetchPosts = async () => {
			const newLowIndex = 0
			const res = await apiGet(`/board/${boardName}/newthreads?cursor=${newLowIndex}&limit=${nPostOnScreen}`) //post
			if (res.ok) {
				setLowIndex(newLowIndex)
				setPosts(res.json)
				setHasMorePost(res.json.length === nPostOnScreen)
				notifHandle.pushSuccess(`Fetched post ${newLowIndex}-${newLowIndex + res.json.length}`)
			} else
				notifHandle.pushError(res.message)
			setLoadingBot(false)
		}
		fetchPosts()
	}, [refreshKeyThread])

	useEffect(() => {
		notifHandle.pushNotif(`LowIndex ${lowIndex}`)
	}, [lowIndex])

	return (
		<div ref={refInfinitScrolling}
				className="h-screen overflow-y-scroll">
			{loadingTop
				? <Loading/>
				: (lowIndex != 0 && <div ref={refSentinelTop}></div>)
			}
			{posts.map((oneThread) =>
					<Post key={oneThread.id}
						post={oneThread}
						privilegeLvl={privilegeLvl}
						refreshKey={setRefreshKeyThread}
					/>)
			}
			{loadingBot
				? <Loading/>
				: (hasMorePost && <div ref={refSentinelBot}></div>)
			}
		</div>
	)
}
