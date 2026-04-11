import { useState, useEffect, useRef } from "react"

import useNotif from "../../components/Notif"
import { apiGet } from "../../Utils/api";

import Loading from "../../components/Loading"
import Post from "./Post";

function ButtonScrollTop({ fetchTop, fetch0 }) {
	return (
		<div className="flex items-center gap-3 py-2 mb-2">
			<button
				onClick={fetchTop}
				className="text-xs text-[#8a8aa8] hover:text-g_seagreen transition-colors duration-100
					px-3 py-1.5 rounded-lg border border-white/6 hover:border-g_seagreen/30
					bg-[#18181f] hover:bg-g_seagreen/5">
				Load previous
			</button>
			<button
				onClick={fetch0}
				className="text-xs text-[#8a8aa8] hover:text-[#eaeaf4] transition-colors duration-100
					px-3 py-1.5 rounded-lg border border-white/6 hover:border-white/12
					bg-[#18181f]">
				Back to top
			</button>
		</div>
	)
}

export default function InfinitScrollReplies({ postID, privilegeLvl, refreshKeyReplies, setRefreshKeyReplies }) {
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
	const setLoadingBot = (val) => { loadingBotRef.current = val; setLoadingBotState(val) }

	const fetchReplies = async (nLowIndex, refetch = false) => {
		const res = await apiGet(`/post/${postID}/newreplies?cursor=${nLowIndex}&limit=${nReplyOnScreen}`)
		if (res.ok) {
			const oldNReplies = replies?.length ?? 0
			const repliesFetch = res.json
			const nRepliesFetch = repliesFetch?.length ?? 0

			if (nRepliesFetch < oldNReplies) {
				nLowIndex -= (oldNReplies - nRepliesFetch)
				fetchReplies(nLowIndex, true)
			} else {
				if (!refetch && nRepliesFetch === nReplyOnScreen) reconnectObserver()
				setLowIndex(nLowIndex)
				setReplies(repliesFetch)
				setHasMoreReplies(nRepliesFetch === nReplyOnScreen)
				notifHandle.pushSuccess(`Fetched ${nRepliesFetch} repl${nRepliesFetch !== 1 ? 'ies' : 'y'}`)
			}
		} else {
			notifHandle.pushError(res.message)
		}
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
				entries.forEach(entry => {
					if (!entry.isIntersecting) return
					if (entry.target === refSentinelBot.current && !loadingBotRef.current)
						fetchBot()
				})
			}, { root: refInfinitScrolling.current, rootMargin: '0px 0px 100px 0px' })

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
	}, [refreshKeyReplies])

	return (
		<div ref={refInfinitScrolling}
			className="max-h-[70vh] overflow-y-auto overflow-x-hidden space-y-3 pr-1">
			{lowIndex !== 0 && (
				loadingTop
					? <Loading />
					: <ButtonScrollTop fetchTop={fetchTop} fetch0={fetchIndex0} />
			)}
			{replies
				? replies.map((oneReply) =>
					<Post key={oneReply.id}
						post={oneReply}
						privilegeLvl={privilegeLvl}
						update={setRefreshKeyReplies}
					/>)
				: <p className="text-[#46465a] text-sm py-4 text-center">No replies yet</p>
			}
			{(loadingBot && !loading)
				? <Loading />
				: (hasMoreReplies && <div ref={refSentinelBot} />)
			}
		</div>
	)
}
