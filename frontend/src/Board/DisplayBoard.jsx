import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../User/AuthProvider";
import DisplayThreads from "./DisplayThreads";
import DisplayMods from "./DisplayMods";
import getDateDifferenceISO from "../Utils/date";
import InfinitScrollThreads from "./InfinitScrollThreads"

import { apiGet, apiPut } from "../Utils/api";

import TextEdit from "../components/TextEdit";
import CreatePost from "./CreateThread";
import Loading from "../components/Loading";
import useNotif from "../components/Notif";
import Button from "../components/Button";

function DisplayBoardDescription({ description, privilegeLvl, saveEdit }) {
	if (!description || description.length === 0) {
		return null;
	} else if (privilegeLvl !== 3) {
		return (<p className="text-surface-600 leading-relaxed">{description}</p>)
	} else {
		return (
			<div className="group relative">
				<TextEdit baseValue={description} onValueSave={saveEdit} />
			</div>
		)
	}
}

export function DisplayBoardHeader({ board, privilegeLvl, setRefreshKeyBoard }) {
	const navigate = useNavigate()
	const notifHandle = useNotif()
	const [ownerName, setOwnerName] = useState(undefined)

	useEffect(() => {
		const fetchOwnerName = async (ownerId) => {
			const response = await apiGet(`/user/id/${ownerId}`)
			if (response.ok) {
				setOwnerName(response.json.username)
			}
		}
		if (board.owner_id) fetchOwnerName(board.owner_id)
	}, [board.owner_id])

	const saveEdit = async (newDescription) => {
		const res = await apiPut(`board/${board.id}`, {
			body: JSON.stringify({
				'name': board.name,
				'description': newDescription,
			})
		})
		if (res.ok) {
			notifHandle.pushSuccess("Board updated")
			setRefreshKeyBoard()
		} else
			notifHandle.pushError(res.status)
	}

	return (
		<div className="relative bg-surface-900 text-white overflow-hidden rounded-b-[3rem] mb-12 shadow-soft-lg">
			{/* Abstract Background pattern */}
			<div className="absolute inset-0 opacity-10 pointer-events-none">
				<div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
			</div>
			<div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl"></div>
			
			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
					<div className="max-w-3xl">
						<div className="flex items-center gap-3 mb-6">
							<span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-500 text-white shadow-sm">
								Community
							</span>
							<span className="text-surface-400 text-xs font-medium uppercase tracking-wider">
								Created {getDateDifferenceISO(board.created_at)}
							</span>
						</div>
						
						<h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
							{board.name}
						</h1>
						
						<div className="text-lg text-surface-300 max-w-2xl leading-relaxed">
							<DisplayBoardDescription
								description={board.description}
								privilegeLvl={privilegeLvl}
								saveEdit={saveEdit}
							/>
						</div>
					</div>

					<div className="flex flex-col gap-6">
						<div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
							<div className="w-12 h-12 rounded-xl bg-brand-400 flex items-center justify-center text-white font-black text-xl">
								{ownerName ? ownerName[0].toUpperCase() : "?"}
							</div>
							<div>
								<p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Administered by</p>
								<button 
									onClick={() => navigate(`/user/${ownerName}`)}
									className="text-white font-bold hover:text-brand-400 transition-colors"
								>
									@{ownerName || "loading..."}
								</button>
							</div>
						</div>
						
						{privilegeLvl >= 3 && (
							<div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
								<p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mb-3">Moderation</p>
								<DisplayMods boardID={board.id} />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default function DisplayBoard() {
	const userHandle = useAuth()
	const notifHandle = useNotif()
	const { boardName } = useParams()

	const [refreshKeyThread, setRefreshKeyThread] = useState(0);
	const [refreshKeyBoard, setRefreshKeyBoard] = useState(0);
	const [loading, setLoading] = useState(true)
	const [privilegeLvl, setPrivilegeLvl] = useState(0);

	const [board, setBoard] = useState({
		id: undefined,
		name: undefined,
		description: undefined,
		owner_id: undefined,
		created_at: undefined,
	})

	useEffect(() => {
		const fetchBoardData = async () => {
			setLoading(true)
			if (userHandle.loading) return

			const checkIsMod = async (name) => {
				try {
					const response = await apiGet(`/board/${name}/ismod`);
					return response.ok && response.json.ismod;
				} catch { return false; }
			}

			const response = await apiGet(`/board/${boardName}`)
			if (response.ok) {
				const nBoard = response.json
				if (userHandle.user) {
					if (userHandle.user.id === nBoard.owner_id) {
						setPrivilegeLvl(3)
					} else {
						const isMod = await checkIsMod(nBoard.name)
						setPrivilegeLvl(isMod ? 2 : 1)
					}
				} else {
					setPrivilegeLvl(0)
				}
				setBoard(nBoard)
			} else {
				notifHandle.pushError(response.status)
			}
			setLoading(false)
		}
		fetchBoardData()
	}, [refreshKeyBoard, userHandle.loading, userHandle.user, boardName, notifHandle])

	if (loading) return <div className="p-24"><Loading /></div>
	if (!board.id) return <div className="p-24 text-center text-surface-500 font-medium">Board not found.</div>

	return (
		<div className="min-h-screen bg-surface-50/50 -mt-24"> {/* Negative margin to offset App.jsx padding for hero effect */}
			<DisplayBoardHeader
				board={board}
				privilegeLvl={privilegeLvl}
				setRefreshKeyBoard={() => setRefreshKeyBoard(prev => prev + 1)}
			/>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
					
					{/* Sidebar (Left on large screens, Top on small) */}
					<aside className="lg:col-span-4 space-y-8 order-2 lg:order-1">
						{userHandle.user ? (
							<div className="bg-white p-8 rounded-[2.5rem] border border-surface-200 shadow-soft sticky top-24">
								<div className="mb-8">
									<h3 className="text-2xl font-black text-surface-900 tracking-tight">Create Post</h3>
									<p className="text-sm text-surface-500 mt-2">Share your thoughts with the {board.name} community.</p>
								</div>
								<CreatePost
									board={board}
									setRefreshKeyThread={() => setRefreshKeyThread(prev => prev + 1)}
								/>
							</div>
						) : (
							<div className="bg-brand-600 p-8 rounded-[2.5rem] text-white shadow-soft sticky top-24">
								<h3 className="text-2xl font-black tracking-tight mb-4">Join the conversation</h3>
								<p className="text-brand-100 mb-8 leading-relaxed">Log in or register to start posting and interacting with this community.</p>
								<div className="flex flex-col gap-3">
									<Button onClick={() => window.location.href='/login'} variant="secondary" className="!bg-white !text-brand-700">Login</Button>
									<Button onClick={() => window.location.href='/register'} variant="ghost" className="!text-white border border-white/20">Register</Button>
								</div>
							</div>
						)}

						<div className="p-8 bg-surface-900 rounded-[2.5rem] text-white overflow-hidden relative group">
							<div className="relative z-10">
								<h3 className="text-xl font-bold mb-4">Community Guidelines</h3>
								<ul className="space-y-4 text-sm text-surface-400">
									<li className="flex gap-3">
										<span className="text-brand-400 font-bold">01.</span>
										<span>Be respectful and maintain a professional tone at all times.</span>
									</li>
									<li className="flex gap-3">
										<span className="text-brand-400 font-bold">02.</span>
										<span>Keep content relevant to {board.name}. Avoid off-topic spam.</span>
									</li>
									<li className="flex gap-3">
										<span className="text-brand-400 font-bold">03.</span>
										<span>No illegal content or harassment. Zero tolerance policy.</span>
									</li>
								</ul>
							</div>
							<div className="absolute bottom-0 right-0 -mb-8 -mr-8 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-all"></div>
						</div>
					</aside>

					{/* Feed (Right on large screens) */}
					<div className="lg:col-span-8 space-y-8 order-1 lg:order-2">
						<div className="flex items-center justify-between border-b border-surface-200 pb-6">
							<div>
								<h2 className="text-2xl font-black text-surface-900 tracking-tight">Recent Activity</h2>
								<p className="text-sm text-surface-500 mt-1">Showing latest threads first</p>
							</div>
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
								<span className="text-[10px] font-black uppercase tracking-widest text-surface-400">Live Feed</span>
							</div>
						</div>

						<InfinitScrollThreads
							boardName={boardName}
							privilegeLvl={privilegeLvl}
							refreshKeyThread={refreshKeyThread}
							setRefreshKeyThread={() => setRefreshKeyThread(prev => prev + 1)}
						/>
					</div>
				</div>
			</main>
		</div>
	)
}
