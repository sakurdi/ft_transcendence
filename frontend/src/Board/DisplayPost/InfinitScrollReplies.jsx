import {useState, useEffect, useRef} from "react"

import useNotif from "../components/Notif"
import { apiGet } from "../Utils/api";

import Loading from "../components/Loading"
import Post from "./DisplayPost/Post";

function ButtonScrollTop({fetchTop, fetch0})
{
	return (
		<div className="max-w-screen-xl w-full flex items-center gap-2 h-fit">
			<button onClick = {fetchTop}>
				Load previous
			</button>
			<button onClick = {fetch0}>
				Back to the top
			</button>
		</div>
	)
}

export default function InfinitScrollThreads({boardName, privilegeLvl, refreshKeyThread, setRefreshKeyThread})
{
	const nReplyOnPage = 20
	const nReplyOnScreen = nReplyOnPage * 2
	const notifHandle = useNotif()

	const refInfinitScrolling = useRef(null)
	const refSentinelBot = useRef(null)
	const [connectObserver, setConnectObserver] = useState(0)
	const reconnectObserver = () => setConnectObserver(connectObserver + 1)

	const [lowIndex, setLowIndex] = useState(0)
	const [hasMoreReplies, setHasMoreReplies] = useState(true)
	const [replies, setReplies] = useState([])
	
	const [loading, setLoading] = useState(true)
	const [loadingTop, setLoadingTop] = useState(false)
	const [loadingBot, setLoadingBotState] = useState(false)
	const loadingBotRef = useRef(false)
	const setLoadingBot = (val)=> {loadingBotRef.current = val; setLoadingBotState(val)}

	const fetchReplies = async (lowIndex) => {
		const res = await apiGet(`/board/${boardName}/newthreads?cursor=${lowIndex}&limit=${nReplyOnScreen}`)
		if (res.ok) {
			setLowIndex(lowIndex)
			setReplies(res.json)
			const nReplyFetch = (res.json?.length ?? 0)
			if (nReplyFetch === nReplyOnScreen)
				reconnectObserver()
			setHasMoreReplies(nReplyFetch === nReplyOnScreen)
			notifHandle.pushSuccess(`Fetched ${nReplyFetch} pos ${nReplyFetch >= 2 ? `s from  ${lowIndex}-${lowIndex + nReplyFetch}` : ''}`)
		} else
			notifHandle.pushError(res.message)
	}

	const fetchIndex0 = async () => {
		setLoading(true)
		await fetchReplies(0)
		setLoading(false)
	}

	const fetchTop = async () => {
		setLoadingTop(true)
		const newLowIndex = (lowIndex >= nReplyOnPage) ? (lowIndex - nReplyOnPage) : 0
		await fetchReplies(newLowIndex)
		setLoadingTop(false)
	}

	const fetchBot = async () => {
		setLoadingBot(true)
		const newLowIndex = lowIndex + nReplyOnPage
		await fetchReplies(newLowIndex)
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
		const fetchRepliesInt = async () => {
			await fetchReplies(lowIndex)
			setLoading(false)
		}
		fetchRepliesInt()
	}, [refreshKeyThread])

	return (
		<div ref={refInfinitScrolling}
				className="min-h-0 max-h-screen overflow-y-auto overflow-x-hidden w-[90%] mx-auto">
			{lowIndex !== 0 && (
				loadingTop
					? <Loading/>
					: <ButtonScrollTop fetchTop={fetchTop} fetch0={fetchIndex0}/>
			)}
			{replies
				? replies.map((oneThread) =>
					<Post key={oneThread.id}
						post={oneThread}
						privilegeLvl={privilegeLvl}
						update={setRefreshKeyThread}
					/>)
				: <></>
			}
			{(loadingBot && !loading)
				? <Loading/>
				: (hasMoreReplies && <div ref={refSentinelBot}></div>)
			}
		</div>
	)
}
