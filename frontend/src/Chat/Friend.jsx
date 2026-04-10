import { useState, useRef, useEffect } from "react"
import { createContext, useContext } from "react"
import useAuth from "../User/AuthProvider";
import { apiDelete, apiGet, apiPost } from "../Utils/api";
import { buildAcceptedAvatarFormat } from "../Utils/Data";
import { maxAvatarSize } from "../Utils/Data";
import { getAvatarContentTypeData, getFileFormatAvatar, getMagicNumberAvatar } from "../Utils/Data";
import uploadFile from "../Utils/Upload";
import useNotif from "../components/Notif";

const WS_BASE = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`
const wsUrl = (path) => `${WS_BASE}${path.startsWith("/") ? path : `/${path}`}`

function timestamp() {
    return new Date().toLocaleTimeString()
}

function useLog() {
    const [entries, setEntries] = useState([])
    function push(msg, type = "info") {
        setEntries(prev => [...prev, { msg, type, time: timestamp() }])
    }
    return { entries, push }
}

function useSocket(logPush) {
    const ref = useRef(null)

    function connect(url, onMessage) {
        if (ref.current) ref.current.close()
        const ws = new WebSocket(url)
        ws.onopen    = ()  => logPush(`connected`, "info")
        ws.onclose   = ()  => logPush("disconnected", "info")
        ws.onerror   = ()  => logPush("connection error", "err")
        ws.onmessage = (e) => {
            logPush(`← ${e.data}`, "recv")
            if (onMessage) onMessage(JSON.parse(e.data))
        }
        ref.current = ws
    }

    function disconnect() {
        ref.current?.close()
        ref.current = null
    }

    function send(data) {
        if (!ref.current || ref.current.readyState !== WebSocket.OPEN) {
            logPush("not connected", "err")
            return false
        }
        const msg = JSON.stringify(data)
        ref.current.send(msg)
        logPush(`→ ${msg}`, "sent")
        return true
    }

    useEffect(() => () => ref.current?.close(), [])
    return { connect, disconnect, send }
}

// ── Friend Context ─────────────────────────────────────────────────────────────

const FriendContext = createContext()

function FriendProvider({ children }) {
    const [message,  setMessage]  = useState("")
    const [messages, setMessages] = useState([])
    const [userConnected, setUserConnected] = useState({})
    const [friends, setFriends] = useState([])
    const [newFriendId, setNewFriendId] = useState("")
    const [friendRequests, setFriendRequests] = useState([])
    const [profilUser, setProfilUser] = useState(null)

    const info = {
        message, messages, userConnected, friends, newFriendId, friendRequests, profilUser,
        setMessage, setMessages, setUserConnected, setFriends, setNewFriendId,
        setFriendRequests, setProfilUser,
    }

    return (
        <FriendContext.Provider value={info}>
            {children}
        </FriendContext.Provider>
    )
}

// ── Profile Modal ──────────────────────────────────────────────────────────────

function ProfilShowcase() {
    const user = useContext(FriendContext)

    return (user.profilUser &&
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => user.setProfilUser(null)}>
            <div className="bg-[#18181f] rounded-2xl p-6 border border-white/8 shadow-2xl
                flex flex-col items-center gap-4 w-72"
                onClick={e => e.stopPropagation()}>
                <img
                    src={user.profilUser.avatar_url || "/api/uploads/avatars/default.jpg"}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
                />
                <p className="font-bold text-[#eaeaf4] text-lg">{user.profilUser.username}</p>
                <button
                    onClick={() => user.setProfilUser(null)}
                    className="px-4 py-2 rounded-lg text-sm font-medium
                        text-[#8a8aa8] border border-white/8 hover:border-white/20
                        hover:text-[#eaeaf4] transition-all duration-150">
                    Close
                </button>
            </div>
        </div>
    )
}

// ── Avatar Upload ──────────────────────────────────────────────────────────────

export function ProfileAvatar({ onUploaded }) {
    const notifHandler = useNotif()
    const [file, setFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        setFile(selectedFile)
        setPreviewUrl(URL.createObjectURL(selectedFile))
    }

    const handleFileError = async (selectedFile) => {
        if (selectedFile.size > maxAvatarSize) {
            notifHandler.pushError("File is too large")
            throw new Error("File is too large")
        }
        if (getFileFormatAvatar(selectedFile.name) === "unknown") {
            notifHandler.pushError("Wrong file extension")
            throw new Error("Wrong file extension")
        }
        if (getAvatarContentTypeData(selectedFile.type) === "unknown") {
            notifHandler.pushError("Wrong file type")
            throw new Error("Wrong file type")
        }
        const magicType = await getMagicNumberAvatar(selectedFile)
        if (magicType === "unknown") {
            notifHandler.pushError("File content does not match its type")
            throw new Error("File content mismatch")
        }
    }

    const uploadAvatar = async () => {
        if (!file) return
        try {
            await handleFileError(file)
            setFile(null)
            setPreviewUrl(null)
        } catch {
            setFile(null)
            setPreviewUrl(null)
            return
        }

        const formData = new FormData()
        formData.append("avatar", file)
        setIsUploading(true)
        setUploadProgress(0)
        const res = await uploadFile(`/uploads/avatar/${file.name}`, formData, {
            onProgress: (percent) => setUploadProgress(percent),
        })
        setIsUploading(false)
        if (res.ok) {
            setPreviewUrl(null)
            setFile(null)
            onUploaded?.()
            notifHandler.pushSuccess("Profile picture updated")
        } else {
            notifHandler.pushError("Failed to upload profile picture")
        }
    }

    return (
        <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-4">
                {previewUrl ? (
                    <img src={previewUrl}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-white/8"
                        alt="preview" />
                ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#1f1f28] border border-white/8
                        flex items-center justify-center text-[#46465a] text-xs">
                        No image
                    </div>
                )}
                <div className="space-y-2">
                    <label htmlFor="avatar-upload"
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium
                            text-[#8a8aa8] border border-white/8 bg-[#1f1f28]
                            hover:text-[#eaeaf4] hover:border-white/15 cursor-pointer
                            transition-all duration-150">
                        Choose file
                    </label>
                    <input id="avatar-upload" type="file"
                        accept={buildAcceptedAvatarFormat()}
                        onChange={handleFileChange}
                        className="hidden" />
                    {file && (
                        <button onClick={uploadAvatar} disabled={isUploading}
                            className="block px-3 py-1.5 rounded-lg text-xs font-semibold
                                bg-g_seagreen text-white hover:bg-g_seagreen-600
                                disabled:opacity-50 transition-all duration-150 active:scale-[0.97]">
                            {isUploading ? `Uploading ${uploadProgress}%` : "Upload"}
                        </button>
                    )}
                </div>
            </div>
            {isUploading && (
                <div className="w-full bg-[#2a2a38] rounded-full h-1 overflow-hidden">
                    <div className="h-1 bg-g_seagreen transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }} />
                </div>
            )}
        </div>
    )
}

// ── Chat Message Window ────────────────────────────────────────────────────────

function ChatWindow({ auth }) {
    const user = useContext(FriendContext)
    const msgsRef = useRef(null)

    useEffect(() => {
        if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }, [user.messages])

    return (
        <div ref={msgsRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
            {user.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2 py-10">
                    <div className="w-10 h-10 rounded-full bg-white/4 flex items-center justify-center text-lg">
                        💬
                    </div>
                    <p className="text-xs text-[#46465a]">No messages yet</p>
                    <p className="text-[0.65rem] text-[#46465a]">Select a friend to start chatting</p>
                </div>
            ) : (
                user.messages.map((m, i) => {
                    if (!m) return null
                    const isMine = m.sender_id === auth.user?.id
                    const time = m.created_at
                        ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : ""

                    return (
                        <div key={m.id ?? i} className={`flex gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                            {!isMine && (
                                <div className="w-6 h-6 rounded-full bg-[#2a2a38] border border-white/8
                                    flex items-center justify-center text-[0.6rem] font-bold text-[#8a8aa8]
                                    flex-shrink-0 self-end mb-1">
                                    {(m.username ?? "?")[0].toUpperCase()}
                                </div>
                            )}
                            <div className={`max-w-[72%] flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
                                <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                                    isMine
                                        ? "bg-g_seagreen/20 border border-g_seagreen/25 text-[#eaeaf4] rounded-br-sm"
                                        : "bg-white/5 border border-white/6 text-[#c8c8d8] rounded-bl-sm"
                                }`}>
                                    {m.content}
                                </div>
                                {time && <span className="text-[0.6rem] text-[#46465a]">{time}</span>}
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}

// ── Friend List ────────────────────────────────────────────────────────────────

function ConnectionDot({ username }) {
    const user = useContext(FriendContext)
    const isOnline = user.userConnected[username] !== undefined

    return (
        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-[#18181f] ${
            isOnline ? "bg-g_seagreen" : "bg-[#2a2a38]"
        }`} />
    )
}

function FriendList({ connectDM }) {
    const user = useContext(FriendContext)

    const getFriends = async () => {
        const res = await apiGet("/friends")
        if (res.ok) user.setFriends(Array.isArray(res.json) ? res.json : [])
    }

    const showProfil = async (username) => {
        const res = await apiGet(`/users/${username}`)
        if (res.ok) user.setProfilUser(res.json)
    }

    const removeFriend = async (username) => {
        const res = await apiDelete(`/friends/${username}`)
        if (res.ok) { user.setNewFriendId(""); getFriends() }
    }

    return (
        <div className="space-y-px">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-[#55556a]">Friends</p>
                <button onClick={getFriends}
                    className="text-base leading-none text-[#46465a] hover:text-g_seagreen
                        transition-colors duration-100 px-1.5 py-0.5 rounded"
                    title="Refresh">
                    ↻
                </button>
            </div>
            {!user.friends || user.friends.length === 0 ? (
                <p className="text-xs text-[#46465a] py-6 text-center">No friends yet</p>
            ) : (
                user.friends.map(friend => (
                    <div key={friend.id}
                        className="flex items-center gap-2.5 py-2 px-2 rounded-xl hover:bg-white/4
                            group transition-colors duration-100">
                        <div className="relative flex-shrink-0">
                            <div className="w-7 h-7 rounded-full bg-[#2a2a38] border border-white/8
                                flex items-center justify-center text-xs font-semibold text-[#8a8aa8]">
                                {friend.username[0].toUpperCase()}
                            </div>
                            <ConnectionDot username={friend.username} />
                        </div>
                        <span className="text-xs text-[#c8c8d8] flex-1 truncate font-medium">{friend.username}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                            <button onClick={() => connectDM(friend.username)}
                                className="text-[0.65rem] px-2 py-1 rounded-lg bg-g_seagreen/15 text-g_seagreen
                                    hover:bg-g_seagreen/25 transition-colors duration-100 font-semibold">
                                Chat
                            </button>
                            <button onClick={() => showProfil(friend.username)}
                                className="text-[0.65rem] px-2 py-1 rounded-lg bg-white/6 text-[#8a8aa8]
                                    hover:bg-white/10 transition-colors duration-100">
                                View
                            </button>
                            <button onClick={() => removeFriend(friend.username)}
                                className="text-[0.65rem] px-1.5 py-1 rounded-lg text-[#55556a]
                                    hover:text-red-400 hover:bg-red-500/8 transition-colors duration-100">
                                ✕
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

// ── Friend Requests ────────────────────────────────────────────────────────────

export function SendRequestFromProfil({ newFriendId }) {
    const notifHandler = useNotif()
    const sendRequest = async () => {
        if (!newFriendId) return
        const res = await apiPost(`/friends/request/${newFriendId}`)
        if (res.ok) {
            notifHandler.pushSuccess("Friend request sent")
        } else {
            notifHandler.pushError("Could not send friend request")
        }
    }

    return (
        <button onClick={sendRequest}
            className="px-4 py-2 rounded-lg text-sm font-semibold
                bg-g_seagreen text-white hover:bg-g_seagreen-600
                transition-all duration-150 active:scale-[0.97]">
            Send Friend Request
        </button>
    )
}

function FriendRequests({ getFriends, getRequests }) {
    const user = useContext(FriendContext)

    const acceptRequest = async (requestID) => {
        if (!requestID) return
        const res = await apiPost(`/friends/request/${requestID}/accept`)
        if (res.ok) { getFriends(); getRequests() }
    }

    const declineRequest = async (requestID) => {
        if (!requestID) return
        const res = await apiPost(`/friends/request/${requestID}/decline`)
        if (res.ok) getRequests()
    }

    return (
        <div className="space-y-4">
            {/* Add friend */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-[#55556a]">Add friend</p>
                <div className="flex gap-1.5">
                    <input
                        type="text"
                        placeholder="Username..."
                        value={user.newFriendId}
                        onChange={e => user.setNewFriendId(e.target.value)}
                        onKeyDown={async e => {
                            if (e.key === "Enter" && user.newFriendId) {
                                await apiPost(`/friends/request/${user.newFriendId}`)
                                user.setNewFriendId("")
                            }
                        }}
                        className="flex-1 bg-[#1a1a24] text-[#eaeaf4] border border-white/8 rounded-xl
                            px-3 py-2 text-xs placeholder-[#46465a]
                            focus:outline-none focus:border-g_seagreen/50 transition-all duration-150"
                    />
                    <button
                        onClick={async () => {
                            if (!user.newFriendId) return
                            await apiPost(`/friends/request/${user.newFriendId}`)
                            user.setNewFriendId("")
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-semibold
                            bg-g_seagreen text-white hover:bg-g_seagreen-600
                            transition-all duration-150 active:scale-[0.97]">
                        Add
                    </button>
                </div>
            </div>

            {/* Pending requests */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-[#55556a]">Pending</p>
                        {user.friendRequests.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-g_seagreen/15 text-g_seagreen text-[0.6rem] font-bold">
                                {user.friendRequests.length}
                            </span>
                        )}
                    </div>
                    <button onClick={getRequests}
                        className="text-base leading-none text-[#46465a] hover:text-g_seagreen
                            transition-colors duration-100 px-1.5 py-0.5 rounded"
                        title="Refresh">
                        ↻
                    </button>
                </div>
                {user.friendRequests.length === 0 ? (
                    <p className="text-xs text-[#46465a] py-2">No pending requests</p>
                ) : (
                    user.friendRequests.map(request => (
                        <div key={request.id}
                            className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl bg-white/3 border border-white/5">
                            <div className="w-7 h-7 rounded-full bg-[#2a2a38] border border-white/8
                                flex items-center justify-center text-xs font-semibold text-[#8a8aa8] flex-shrink-0">
                                {request.username[0].toUpperCase()}
                            </div>
                            <span className="text-xs text-[#c8c8d8] flex-1 truncate font-medium">
                                {request.username}
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => acceptRequest(request.username)}
                                    className="text-xs px-2.5 py-1 rounded-lg bg-g_seagreen/15 text-g_seagreen
                                        hover:bg-g_seagreen/25 font-semibold transition-colors duration-100">
                                    ✓
                                </button>
                                <button onClick={() => declineRequest(request.username)}
                                    className="text-xs px-2 py-1 rounded-lg text-[#55556a]
                                        hover:text-red-400 hover:bg-red-500/8 transition-colors duration-100">
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

// ── Tab Navigation ─────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, children, hasBadge }) {
    return (
        <button onClick={onClick}
            className={`relative flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-150
                ${active
                    ? "bg-white/8 text-[#eaeaf4] shadow-sm"
                    : "text-[#55556a] hover:text-[#9898b8]"
                }`}>
            {children}
            {hasBadge && (
                <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-g_seagreen" />
            )}
        </button>
    )
}

// ── DM Section ─────────────────────────────────────────────────────────────────

function DMSection({ auth }) {
    const { push } = useLog()
    const socket = useSocket(push)
    const presenceSocket = useSocket(push)
    const [message, setMessage] = useState("")
    const [activeTab, setActiveTab] = useState("chat")

    const handlerRef = useRef(null)
    const userCon = useContext(FriendContext)

    const userWentOffline = (userToRemove) => {
        userCon.setUserConnected(prev => {
            const { [userToRemove]: _, ...rest } = prev
            return rest
        })
    }

    const userWentOnline = (userToAdd) => {
        userCon.setUserConnected(prev => ({ ...prev, [userToAdd]: userToAdd }))
    }

    handlerRef.current = function(event) {
        if (event.type === "history") {
            userCon.setMessages(Array.isArray(event.data) ? event.data.filter(Boolean) : [])
        }
        if (event.type === "new_message" && event.data) {
            userCon.setMessages(prev => [...prev, event.data])
        }
        if (event.type === "connection") {
            if (event.data === "isonline") userWentOnline(event.user)
            else userWentOffline(event.user)
        }
    }

    const connectDM = async (username) => {
        if (!username) return
        userCon.setMessages([])
        socket.connect(wsUrl(`/ws/dm/${username}`), (event) => handlerRef.current(event))
    }

    function isTyping(e) {
        setMessage(e)
        socket.send({ type: "typing", content: e })
    }

    function sendMessage() {
        if (message.trim() === "") return
        if (socket.send({ content: message })) setMessage("")
    }

    function handleKey(e) {
        if (e.key === "Enter") sendMessage()
    }

    const getFriends = async () => {
        const res = await apiGet("/friends")
        if (res.ok) userCon.setFriends(Array.isArray(res.json) ? res.json : [])
    }

    const getRequests = async () => {
        const res = await apiGet("/friends/requests")
        if (res.ok) userCon.setFriendRequests(Array.isArray(res.json) ? res.json : [])
    }

    useEffect(() => {
        if (auth.user) {
            const timer = setTimeout(() => {
                presenceSocket.connect(wsUrl("/ws/presence"), (event) => handlerRef.current(event))
            }, 50)
            return () => clearTimeout(timer)
        } else {
            socket.disconnect()
            presenceSocket.disconnect()
            userCon.setMessages([])
        }
    }, [auth.user])

    // Auto-refresh friend requests every 30s while the panel is open
    useEffect(() => {
        if (!auth.user) return
        getRequests()
        const interval = setInterval(getRequests, 30_000)
        return () => clearInterval(interval)
    }, [auth.user])

    return (
        <>
            <ProfilShowcase />

            {/* Pill tabs */}
            <div className="px-3 py-2 flex-shrink-0">
                <div className="flex gap-1 p-1 bg-[#111118] rounded-xl">
                    <TabBtn active={activeTab === "chat"} onClick={() => setActiveTab("chat")}>
                        Chat
                    </TabBtn>
                    <TabBtn active={activeTab === "friends"} onClick={() => setActiveTab("friends")}>
                        Friends
                    </TabBtn>
                    <TabBtn
                        active={activeTab === "requests"}
                        onClick={() => setActiveTab("requests")}
                        hasBadge={userCon.friendRequests.length > 0}>
                        Requests
                    </TabBtn>
                </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {activeTab === "chat" && (
                    <div className="flex flex-col h-full min-h-0">
                        <ChatWindow auth={auth} />
                        <div className="px-3 pb-3 pt-2 flex-shrink-0 border-t border-white/5 flex gap-2">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Message..."
                                value={message}
                                onChange={e => isTyping(e.target.value)}
                                onKeyDown={handleKey}
                                className="flex-1 bg-[#1a1a24] text-[#eaeaf4] border border-white/8 rounded-xl
                                    px-3 py-2 text-xs placeholder-[#46465a]
                                    focus:outline-none focus:border-g_seagreen/50 transition-all duration-150"
                            />
                            <button onClick={sendMessage}
                                className="px-3 py-2 rounded-xl text-sm font-semibold
                                    bg-g_seagreen text-white hover:bg-g_seagreen-600
                                    transition-all duration-150 active:scale-[0.97]">
                                →
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "friends" && (
                    <div className="p-3 overflow-y-auto flex-1">
                        <FriendList connectDM={(username) => {
                            connectDM(username)
                            setActiveTab("chat")
                        }} />
                    </div>
                )}

                {activeTab === "requests" && (
                    <div className="p-3 overflow-y-auto flex-1">
                        <FriendRequests getFriends={getFriends} getRequests={getRequests} />
                    </div>
                )}
            </div>
        </>
    )
}

// ── FriendChat (exported widget) ───────────────────────────────────────────────

export function FriendChat() {
    const auth = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    if (auth.loading || !auth.user) return null

    return (
        <>
            {/* Toggle button */}
            <button
                className="fixed right-6 bottom-6 z-[1100]
                    flex items-center gap-2 px-4 py-2.5 rounded-full
                    bg-[#18181f] border border-white/8 shadow-xl shadow-black/40
                    text-sm font-semibold text-[#eaeaf4]
                    hover:border-g_seagreen/40 hover:text-g_seagreen
                    transition-all duration-150 active:scale-[0.97]"
                onClick={() => setIsOpen(prev => !prev)}>
                <span>{isOpen ? "✕" : "💬"}</span>
                {isOpen ? "Close" : "Chat"}
            </button>

            {/* Chat panel */}
            {isOpen && (
                <div className="fixed bottom-0 right-6 w-80 z-[1000] flex flex-col
                    bg-[#18181f] border border-white/8 rounded-t-2xl
                    shadow-2xl shadow-black/60 overflow-hidden"
                    style={{ height: "480px" }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 flex-shrink-0
                        border-b border-white/5">
                        <span className="text-sm font-semibold text-[#eaeaf4]">Messages</span>
                        <span className="w-2 h-2 rounded-full bg-g_seagreen" title="Connected" />
                    </div>

                    <FriendProvider>
                        <DMSection auth={auth} />
                    </FriendProvider>
                </div>
            )}
        </>
    )
}
