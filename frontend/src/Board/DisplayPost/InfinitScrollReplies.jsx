import { useState, useEffect, useRef } from "react"
import useNotif from "../../components/Notif"
import { apiGet } from "../../Utils/api";
import Loading from "../../components/Loading"
import Post from "./Post";

export default function InfinitScrollReplies({ postID, privilegeLvl, refreshKeyReplies, setRefreshKeyReplies }) {
	const LIMIT = 10;
	const notifHandle = useNotif()
	
	const [replies, setReplies] = useState([])
	const [offset, setOffset] = useState(0)
	const [hasMore, setHasMore] = useState(true)
	const [loading, setLoading] = useState(false)
	const [isInitialLoad, setIsInitialLoad] = useState(true)

	const sentinelRef = useRef(null)

	const fetchReplies = async (currentOffset, isRefresh = false) => {
		if (loading) return;
		
		setLoading(true);
		const res = await apiGet(`/post/${postID}/replies?offset=${currentOffset}&limit=${LIMIT}`);
		
		if (res.ok) {
			const newReplies = res.json || [];
			if (isRefresh) {
				setReplies(newReplies);
			} else {
				setReplies(prev => [...prev, ...newReplies]);
			}
			setHasMore(newReplies.length === LIMIT);
			setOffset(currentOffset + newReplies.length);
		} else {
			notifHandle.pushError(res.status || "Failed to load replies");
		}
		
		setLoading(false);
		setIsInitialLoad(false);
	};

	// Handle initial load and manual refreshes
	useEffect(() => {
		setReplies([]);
		setOffset(0);
		setHasMore(true);
		setIsInitialLoad(true);
		fetchReplies(0, true);
	}, [postID, refreshKeyReplies]);

	// Intersection Observer for Infinite Scroll
	useEffect(() => {
		if (loading || !hasMore || isInitialLoad) return;

		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				fetchReplies(offset);
			}
		}, { threshold: 0.1 });

		if (sentinelRef.current) {
			observer.observe(sentinelRef.current);
		}

		return () => observer.disconnect();
	}, [offset, hasMore, loading, isInitialLoad]);

	if (isInitialLoad && loading) {
		return <div className="py-8"><Loading /></div>;
	}

	return (
		<div className="space-y-2">
			{replies.length > 0 ? (
				<>
					<div className="divide-y divide-surface-50">
						{replies.map((reply) => (
							<Post 
								key={reply.id}
								post={reply}
								privilegeLvl={privilegeLvl}
								update={setRefreshKeyReplies}
								isReply={true}
							/>
						))}
					</div>
					
					{hasMore && (
						<div ref={sentinelRef} className="py-8 flex justify-center">
							<Loading />
						</div>
					)}
				</>
			) : (
				!loading && (
					<div className="py-12 text-center bg-surface-50 rounded-2xl border border-dashed border-surface-200">
						<p className="text-sm text-surface-400 italic font-medium">No one has started the discussion yet.</p>
					</div>
				)
			)}
		</div>
	)
}
