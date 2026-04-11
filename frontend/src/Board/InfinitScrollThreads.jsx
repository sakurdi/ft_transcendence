import { useState, useEffect, useRef } from "react"
import useNotif from "../components/Notif"
import { apiGet } from "../Utils/api"
import Loading from "../components/Loading"
import Post from "./DisplayPost/Post"

const scrollBtnClass =
	"text-xs text-[#9898b8] hover:text-g_seagreen transition-colors duration-100 " +
	"px-3 py-1.5 rounded-lg glass hover:border-g_seagreen/30 hover:bg-g_seagreen/5"

function ButtonScrollTop({ fetchTop, reloadPost }) {
	return (
		<div className="flex items-center gap-3 py-2 mb-2">
			<button onClick={fetchTop} className={scrollBtnClass}>Load previous</button>
			<button onClick={reloadPost} className={scrollBtnClass.replace("hover:text-g_seagreen", "hover:text-[#eaeaf4]").replace("hover:border-g_seagreen/30 hover:bg-g_seagreen/5", "")}>
				Back to top
			</button>
		</div>
	)
}

export default function InfinitScrollThreads({ boardName, privilegeLvl, refreshKeyThread, setRefreshKeyThread }) {
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
	const setLoadingBot = (val) => { loadingBotRef.current = val; setLoadingBotState(val) }

	const fetchPost = async (nLowIndex, refetch = false) => {
		const res = await apiGet(`/board/${boardName}/newthreads?cursor=${nLowIndex}&limit=${nPostOnScreen}`)
		if (res.ok) {
			const oldNPost = posts?.length ?? 0
			const postsFetch = res.json
			const nPostsFetch = postsFetch?.length ?? 0
			if (nPostsFetch < oldNPost) {
				fetchPost(nLowIndex - (oldNPost - nPostsFetch), true)
			} else {
				if (!refetch && nPostsFetch === nPostOnScreen) reconnectObserver()
				setLowIndex(nLowIndex)
				setPosts(res.json)
				setHasMorePost(nPostsFetch === nPostOnScreen)
				notifHandle.pushSuccess(`Fetched ${nPostsFetch} thread${nPostsFetch !== 1 ? 's' : ''}`)
			}
		} else {
			notifHandle.pushError(res.message)
		}
	}

	const fetchIndex0 = async () => { setLoading(true); await fetchPost(0); setLoading(false) }
	const fetchTop = async () => {
		setLoadingTop(true)
		await fetchPost(lowIndex >= nPostOnPage ? lowIndex - nPostOnPage : 0)
		setLoadingTop(false)
	}
	const fetchBot = async () => {
		setLoadingBot(true)
		await fetchPost(lowIndex + nPostOnPage)
		setLoadingBot(false)
	}

	useEffect(() => {
		if (loading) return
		const observer = new IntersectionObserver(
			(entries) => entries.forEach(entry => {
				if (entry.isIntersecting && entry.target === refSentinelBot.current && !loadingBotRef.current)
					fetchBot()
			}),
			{ root: refInfinitScrolling.current, rootMargin: '0px 0px 100px 0px' }
		)
		if (refSentinelBot.current) observer.observe(refSentinelBot.current)
		return () => observer.disconnect()
	}, [connectObserver, loading])

	useEffect(() => {
		setLoading(true)
		const go = async () => { await fetchPost(lowIndex); setLoading(false) }
		go()
	}, [refreshKeyThread])

	return (
		<div ref={refInfinitScrolling}
			className="max-h-[70vh] overflow-y-auto overflow-x-hidden space-y-3 pr-1">
			{lowIndex !== 0 && (
				loadingTop ? <Loading /> : <ButtonScrollTop fetchTop={fetchTop} reloadPost={fetchIndex0} />
			)}
			{loading ? (
				<Loading />
			) : posts?.length ? (
				posts.map((oneThread) =>
					<Post key={oneThread.id}
						post={oneThread}
						privilegeLvl={privilegeLvl}
						update={setRefreshKeyThread}
					/>)
			) : (
				<p className="text-[#55556a] text-sm py-10 text-center">
					No threads yet — be the first to post!
				</p>
			)}
			{(loadingBot && !loading) ? <Loading /> : (hasMorePost && <div ref={refSentinelBot} />)}
		</div>
	)
}
