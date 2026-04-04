import { useState, useEffect, useRef } from "react"
import useNotif from "../components/Notif"
import { apiGet } from "../Utils/api";
import Loading from "../components/Loading"
import Post from "./DisplayPost/Post";

export default function InfinitScrollThreads({ boardName, privilegeLvl, refreshKeyThread, setRefreshKeyThread }) {
	const LIMIT = 10;
	const notifHandle = useNotif()
	
	const [posts, setPosts] = useState([])
	const [offset, setOffset] = useState(0)
	const [hasMore, setHasMore] = useState(true)
	const [loading, setLoading] = useState(false)
	const [isInitialLoad, setIsInitialLoad] = useState(true)

	const sentinelRef = useRef(null)

	const fetchPosts = async (currentOffset, isRefresh = false) => {
		if (loading) return;
		
		setLoading(true);
		const res = await apiGet(`/board/${boardName}/threads?offset=${currentOffset}&limit=${LIMIT}`);
		
		if (res.ok) {
			const newPosts = res.json || [];
			if (isRefresh) {
				setPosts(newPosts);
			} else {
				setPosts(prev => [...prev, ...newPosts]);
			}
			setHasMore(newPosts.length === LIMIT);
			setOffset(currentOffset + newPosts.length);
		} else {
			notifHandle.pushError(res.status || "Failed to load threads");
		}
		
		setLoading(false);
		setIsInitialLoad(false);
	};

	// Handle initial load and manual refreshes
	useEffect(() => {
		setPosts([]);
		setOffset(0);
		setHasMore(true);
		setIsInitialLoad(true);
		fetchPosts(0, true);
	}, [boardName, refreshKeyThread]);

	// Intersection Observer for Infinite Scroll
	useEffect(() => {
		if (loading || !hasMore || isInitialLoad) return;

		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				fetchPosts(offset);
			}
		}, { threshold: 0.1 });

		if (sentinelRef.current) {
			observer.observe(sentinelRef.current);
		}

		return () => observer.disconnect();
	}, [offset, hasMore, loading, isInitialLoad]);

	if (isInitialLoad && loading) {
		return <div className="py-12"><Loading /></div>;
	}

	return (
		<div className="space-y-6">
			{posts.length > 0 ? (
				<>
					<div className="space-y-4">
						{posts.map((post) => (
							<Post 
								key={post.id}
								post={post}
								privilegeLvl={privilegeLvl}
								update={setRefreshKeyThread}
							/>
						))}
					</div>
					
					{hasMore && (
						<div ref={sentinelRef} className="py-8 flex justify-center">
							<Loading />
						</div>
					)}
					
					{!hasMore && posts.length > 0 && (
						<div className="py-12 text-center">
							<p className="text-xs font-black text-surface-300 uppercase tracking-[0.2em]">
								End of discussions
							</p>
						</div>
					)}
				</>
			) : (
				!loading && (
					<div className="py-20 text-center bg-surface-50 rounded-[2.5rem] border border-dashed border-surface-200">
						<p className="text-surface-400 italic">No threads found in this community.</p>
					</div>
				)
			)}
		</div>
	)
}
