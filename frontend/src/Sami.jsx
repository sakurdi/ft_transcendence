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
    const [username, setUsername] = useState("saal-kur")
    const [password, setPassword] = useState("password")

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

    function connectDM() {
        setMessages([])
        socket.connect(`${WS}/ws/dm/${userID}`, (event) => handlerRef.current(event))
    }

    function sendMessage() {
        if (socket.send({ content: message })) setMessage("")
    }

    function handleKey(e) {
        if (e.key === "Enter") sendMessage()
    }

    return (
        <Section title="DM Socket">
            <Row>
                <Input placeholder="recipient user ID" value={userID} onChange={setUserID} />
                <Btn onClick={connectDM}>Connect</Btn>
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
            <BoardSection />
            <ThreadSection />
            <CreatePostSection />
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

