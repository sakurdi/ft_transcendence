import { useState, useRef, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

const BASE = "https://localhost:1043/api"
const WS   = "wss://localhost:1043"

// ── api ───────────────────────────────────────────────────────────────────────

async function api(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
    })
    const text = await res.text()
    return { ok: res.ok, status: res.status, body: text }
}

function timestamp() {
    return new Date().toLocaleTimeString()
}

// ── useLog ────────────────────────────────────────────────────────────────────

function useLog() {
    const [entries, setEntries] = useState([])
    function push(msg, type = "info") {
        setEntries(prev => [...prev, { msg, type, time: timestamp() }])
    }
    return { entries, push }
}

// ── useAuth ───────────────────────────────────────────────────────────────────

function useAuth() {
    const [user, setUser] = useState(null)

    async function login(username, password) {
        const { ok, body } = await api("/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        })
        if (ok) setUser({ username })
        return { ok, body }
    }

    async function logout() {
        const res = await api("/logout", { method: "POST" })
        if (res.ok) setUser(null)
        return res
    }

    return { user, login, logout }
}

// ── useSocket ─────────────────────────────────────────────────────────────────

function useSocket(logPush) {
    const ref = useRef(null)

    function connect(url, onMessage) {
        if (ref.current) ref.current.close()
        const ws = new WebSocket(url)
        ws.onopen    = ()  => logPush(`connected to ${url}`, "info")
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

// ── Log ───────────────────────────────────────────────────────────────────────

function Log({ entries }) {
    const ref = useRef(null)
    useEffect(() => {
        if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
    }, [entries])

    const colors = {
        recv: "text-emerald-700",
        sent: "text-sky-700",
        err:  "text-red-600",
        info: "text-stone-400",
    }

    return (
        <div
            ref={ref}
            className="h-36 overflow-y-auto bg-stone-50 border border-stone-200 rounded p-3 font-mono text-xs space-y-0.5"
        >
            {entries.length === 0
                ? <p className="text-stone-300">no events yet</p>
                : entries.map((e, i) => (
                    <p key={i} className={colors[e.type] ?? "text-stone-600"}>
                        [{e.time}] {e.msg}
                    </p>
                ))
            }
        </div>
    )
}

// ── primitives ────────────────────────────────────────────────────────────────

function Section({ title, children }) {
    return (
        <div className="border border-stone-200 rounded-lg p-5 space-y-3 bg-white">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                {title}
            </h2>
            {children}
        </div>
    )
}

function Row({ children }) {
    return <div className="flex flex-wrap items-center gap-2">{children}</div>
}

function Input({ placeholder, value, onChange, onKeyDown, type = "text", className = "" }) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            className={`border border-stone-200 rounded px-3 py-1.5 text-sm bg-stone-50 outline-none focus:border-stone-400 font-mono w-40 ${className}`}
        />
    )
}

function Btn({ onClick, children, variant = "default" }) {
    const styles = {
        default: "bg-stone-900 text-white hover:bg-stone-700",
        ghost:   "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50",
    }
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer ${styles[variant]}`}
        >
            {children}
        </button>
    )
}

// ── Auth section ──────────────────────────────────────────────────────────────

function AuthSection({ auth, onLogin }) {
    const { entries, push } = useLog()
    const [username, setUsername] = useState("kevwang")
    const [password, setPassword] = useState("1234")

    async function handleLogin() {
        const { ok, body } = await auth.login(username, password)
        push(ok ? `logged in as ${username}` : `error: ${body}`, ok ? "recv" : "err")
        if (ok && onLogin) onLogin()
    }

    async function handleLogout() {
        const { ok, body } = await auth.logout()
        push(ok ? "logged out" : `error: ${body}`, ok ? "info" : "err")
    }

    return (
        <Section title="Auth">
            <Row>
                <span className="text-xs font-mono text-stone-400">
                    {auth.user ? `signed in as ${auth.user.username}` : "not signed in"}
                </span>
            </Row>
            <Row>
                <Input placeholder="username" value={username} onChange={setUsername} />
                <Input placeholder="password" type="password" value={password} onChange={setPassword} />
                <Btn onClick={handleLogin}>Login</Btn>
                <Btn onClick={handleLogout} variant="ghost">Logout</Btn>
            </Row>
            <Log entries={entries} />
        </Section>
    )
}

// ── Board socket ──────────────────────────────────────────────────────────────

function BoardSection() {
    const { entries, push } = useLog()
    const socket = useSocket(push)
    const [boardID, setBoardID] = useState("1")

    return (
        <Section title="Board Socket — new thread notifications">
            <Row>
                <Input placeholder="board ID" value={boardID} onChange={setBoardID} />
                <Btn onClick={() => socket.connect(`${WS}/ws/board/${boardID}`)}>Connect</Btn>
                <Btn onClick={socket.disconnect} variant="ghost">Disconnect</Btn>
            </Row>
            <Log entries={entries} />
        </Section>
    )
}

// ── Thread socket ─────────────────────────────────────────────────────────────

function ThreadSection() {
    const { entries, push } = useLog()
    const socket = useSocket(push)
    const [threadID, setThreadID] = useState("1")

    return (
        <Section title="Thread Socket — new reply notifications">
            <Row>
                <Input placeholder="thread ID" value={threadID} onChange={setThreadID} />
                <Btn onClick={() => socket.connect(`${WS}/ws/thread/${threadID}`)}>Connect</Btn>
                <Btn onClick={socket.disconnect} variant="ghost">Disconnect</Btn>
            </Row>
            <Log entries={entries} />
        </Section>
    )
}

// ── Create post ───────────────────────────────────────────────────────────────

function CreatePostSection() {
    const { entries, push } = useLog()
    const [boardID,  setBoardID]  = useState("1")
    const [title,    setTitle]    = useState("")
    const [content,  setContent]  = useState("test post")
    const [parentID, setParentID] = useState("")

    async function createPost() {
        const { ok, body } = await api(`/board/${boardID}/post`, {
            method: "POST",
            body: JSON.stringify({
                title:     title    || null,
                content,
                parent_id: parentID ? parseInt(parentID) : null,
            }),
        })
        push(ok ? `created: ${body}` : `error: ${body}`, ok ? "sent" : "err")
    }

    return (
        <Section title="Create Post">
            <Row>
                <Input placeholder="board ID"  value={boardID}  onChange={setBoardID} />
                <Input placeholder="title"     value={title}    onChange={setTitle}    className="w-48" />
                <Input placeholder="content"   value={content}  onChange={setContent}  className="w-48" />
                <Input placeholder="parent ID" value={parentID} onChange={setParentID} />
                <Btn onClick={createPost}>Post</Btn>
            </Row>
            <Log entries={entries} />
        </Section>
    )
}

// ── DM ────────────────────────────────────────────────────────────────────────

function DMSection({ auth }) {
    const { entries, push } = useLog()
    const socket = useSocket(push)
    const [userID,   setUserID]   = useState("2")
    const [message,  setMessage]  = useState("")
    const [messages, setMessages] = useState([])
    const msgsRef    = useRef(null)
    const handlerRef = useRef(null)

    useEffect(() => {
        if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }, [messages])

    // auto-connect when user logs in
    useEffect(() => {
        if (auth.user) connectDM()
        else {
            socket.disconnect()
            setMessages([])
        }
    }, [auth.user])

    handlerRef.current = function(event) {
        if (event.type === "history") {
            setMessages(Array.isArray(event.data) ? event.data.filter(Boolean) : [])
        }
        if (event.type === "new_message" && event.data) {
            setMessages(prev => [...prev, event.data])
        }
    }

    const connectDM = async (username) => {
        setMessages([])
        socket.connect(`${WS}/ws/dm/${username}`, (event) => handlerRef.current(event))
    }

    function sendMessage() {
        if (socket.send({ content: message })) setMessage("")
    }

    function handleKey(e) {
        if (e.key === "Enter") sendMessage()
    }

    const [friends, setFriends] = useState([]);
    const [newFriendId, setNewFriendId] = useState("");
	const [friendRequests, setFriendRequests] = useState([]);


    const addFriend = async () => {
        const res = await api(`/friends/${newFriendId}`, { method: "POST" });
        if (res.ok) {
            setNewFriendId("");
        }
    };

    // const removeFriend = async () => {
    //     const res = await api(`/friends/${newFriendId}`, { method: "DELETE" });
    //     if (res.ok) {
    //         setNewFriendId("");
	// 		getFriends();
    //     }
    // };

	 const removeFriend = async (username) => {
        const res = await api(`/friends/${username}`, { method: "DELETE" });
        if (res.ok) {
            setNewFriendId("");
			getFriends();
        }
    };

	const getFriends = async () => {
		const res = await api("/friends");
		if (res.ok) {
			const friends = JSON.parse(res.body);
			// console.log("Friends:", friends);
			setFriends(Array.isArray(friends) ? friends : []);
		}
	}

	const sendRequest = async () => {
		const res = await api(`/friends/request/${newFriendId}`, { method: "POST" });
		if (res.ok) {
			setNewFriendId("");
		}
	};

	const acceptRequest = async (requestID) => {
		if (!requestID)
			return;
		const res = await api(`/friends/request/${requestID}/accept`, { method: "POST" });
		if (res.ok) {
			getFriends();
			getFriendRequests();
		}
	};

	const declineRequest = async (requestID) => {
		if (!requestID)
			return;
		const res = await api(`/friends/request/${requestID}/decline`, { method: "POST" });
		if (res.ok) {
			getFriendRequests();
		}
	};

	const getFriendRequests = async () => {
		const res = await api("/friends/requests");
		if (res.ok) {
			const requests = JSON.parse(res.body);
			setFriendRequests(Array.isArray(requests) ? requests : []);
		}
	}

	const [profilUser, setProfilUser] = useState(null);

	const checkProfil = async (username) => {
		const res = await api(`/users/${username}`);
		if (res.ok) {
			const user = JSON.parse(res.body);
			setProfilUser(user);
		}
	};


	function ProfileAvatar() {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("/api/uploads/avatars/default.png");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile)); 
    };

    const uploadAvatar = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);
        const res = await fetch(`/api/uploads/avatar/${file.name}`, {
            method: "POST",
            body: formData,
            credentials: "include" 
        });

        if (res.ok) {
            // const data = await res.json();
            // setPreviewUrl(data.avatar_url);
			setPreviewUrl(null);
        }
    };

    return (
        <div className="flex flex-col items-center border rounded bg-white w-64">
            <img src={previewUrl} 
                className="w-24 h-24 rounded-full object-cover border-2 border-stone-200"/>

            <input type="file" 
                accept="image/png, image/jpeg, image/jpg" 
                onChange={handleFileChange} 
                className="text-xs"/>

            <button onClick={uploadAvatar}
                className="bg-sky-600 text-white rounded">
                Upload
            </button>
        </div>
    );
}


    return (
		<>
		{profilUser && (
			<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
				onClick={() => setProfilUser(null)}>

				<div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center gap-3 w-64"
					onClick={e => e.stopPropagation()}>

					<img src={profilUser.avatar_url || "/api/uploads/avatars/default.png"}
						alt="avatar123"
						className="w-24 h-24 rounded-full object-cover border-2 border-stone-200"/>

					<p className="font-bold text-stone-800 text-lg">{profilUser.username}</p>

					<Btn onClick={() => setProfilUser(null)} variant="ghost">Close</Btn>

				</div>
			</div>
		)}

		<ProfileAvatar />

        <Section title="DM Socket">
			<Row>
                <Input placeholder="User ID to add" value={newFriendId} onChange={setNewFriendId} />
                <Btn onClick={addFriend}>Add Friend</Btn>
            </Row>

			<Row>
                <Input placeholder="User ID to remove" value={newFriendId} onChange={setNewFriendId} />
                <Btn onClick={removeFriend}>Remove Friend</Btn>
            </Row>

			<Row>
				<Btn onClick={getFriends}>Refresh Friends</Btn>
			</Row>
			<div>
				<h3>Friends List:</h3>
				<ul>
					{friends && friends.length === 0 ? (
						<li className="text-stone-400">No friend</li>
					) : (
						friends.map(friend => (
							<li key={friend.id}>
								{friend.username} (ID: {friend.id})
								<Btn onClick={() => connectDM(friend.username)}>Chat</Btn>
								<Btn onClick={() => checkProfil(friend.username)}>Profile</Btn>
								<Btn onClick={() => removeFriend(friend.username)}>Unfriend</Btn>
							</li>
						))
					)}
				</ul>
			</div>

			<Row>
				<Input placeholder="Username to send request" value={newFriendId} onChange={setNewFriendId} />
				<Btn onClick={sendRequest}>Send Request</Btn>
			</Row>


			<Row>
				<Input placeholder="Username to accept" value={newFriendId} onChange={setNewFriendId} />
				<Btn onClick={() => acceptRequest(newFriendId)}>Accept Request</Btn>
			</Row>

			<Row>
				<Btn onClick={getFriendRequests}>Refresh Friend Requests</Btn>
			</Row>
			<div>
				<h3>Friend Requests:</h3>
				<ul>
					{friendRequests && friendRequests.length === 0 ? (
						<li>No friend request</li>
					) : (
						friendRequests.map(request => (
							<li key={request.id}>
								Request from {request.username} (ID: {request.from_user_id})
								<Btn onClick={() => acceptRequest(request.username)}>Accept</Btn>
								<Btn onClick={() => declineRequest(request.username)}>Decline</Btn>
							</li>
						))
					)}
				</ul>
			</div>

            <Row>
                <Input placeholder="recipient username" value={userID} onChange={setUserID} />
                <Btn onClick={() => connectDM(userID)}>Connect</Btn>
                <Btn onClick={socket.disconnect} variant="ghost">Disconnect</Btn>
            </Row>
            <div
                ref={msgsRef}
                className="h-48 overflow-y-auto border border-stone-200 rounded bg-white p-3 space-y-2"
            >
                {messages.length === 0
                    ? <p className="text-xs text-stone-300 font-mono">no messages</p>
                    : messages.map((m, i) => m && (
                        <div key={m.id ?? i} className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-mono font-medium ${
                                    m.sender_id === auth.user?.id
                                        ? "text-sky-600"
                                        : "text-stone-500"
                                }`}>
                                    {auth.user?.username === m.username ? "you" : `user:${m.sender_id}`}
                                </span>
                                <span className="text-xs text-stone-300">
                                    {m.created_at ? new Date(m.created_at).toLocaleTimeString() : ""}
                                </span>
                            </div>
                            <p className="text-sm text-stone-800">{m.content}</p>
                        </div>
                    ))
                }
            </div>

            <Log entries={entries} />

            <Row>
                <Input
                    placeholder="message"
                    value={message}
                    onChange={setMessage}
                    onKeyDown={handleKey}
                    className="w-72"
                />
                <Btn onClick={sendMessage}>Send</Btn>
            </Row>
        </Section>
		</>
    )
}

// ── App ───────────────────────────────────────────────────────────────────────

function TestPage() {
    const auth = useAuth()

    return (
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">
            <div className="mb-8">
                <p className="text-xs font-mono uppercase tracking-widest text-stone-400">
                    ft_transcendence
                </p>
                <h1 className="text-2xl font-bold text-stone-900 mt-1">WebSocket Test</h1>
            </div>
            <AuthSection auth={auth} />
            {/* <BoardSection />
            <ThreadSection />
            <CreatePostSection /> */}
            <DMSection auth={auth} />
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={<TestPage />} />
            </Routes>
        </BrowserRouter>
    )
}