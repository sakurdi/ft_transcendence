import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import useAuth from "../User/AuthProvider";
import useNotif from "../components/Notif";
import { apiGet } from "../Utils/api";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import Loading from "../components/Loading";
import "./SocialSidebar.css";

const WS_BASE = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
const wsUrl = (path) => `${WS_BASE}${path.startsWith("/") ? path : `/${path}`}`;

export default function SocialSidebar() {
  const auth = useAuth();
  const notif = useNotif();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null); // username
  const [friends, setFriends] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);
  const presenceSocketRef = useRef(null);
  const chatEndRef = useRef(null);

  // --- Socket Logic ---

  const connectPresence = () => {
    if (presenceSocketRef.current) return;
    const ws = new WebSocket(wsUrl("/ws/presence"));
    ws.onmessage = (e) => {
      const event = JSON.parse(e.data);
      if (event.type === "connection") {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          if (event.data === "isonline") next.add(event.user);
          else next.delete(event.user);
          return next;
        });
      }
    };
    presenceSocketRef.current = ws;
  };

  const connectChat = (username) => {
    if (socketRef.current) socketRef.current.close();
    setMessages([]);
    const ws = new WebSocket(wsUrl(`/ws/dm/${username}`));
    ws.onmessage = (e) => {
      const event = JSON.parse(e.data);
      if (event.type === "history") {
        setMessages(Array.isArray(event.data) ? event.data.filter(Boolean) : []);
      } else if (event.type === "new_message" && event.data) {
        setMessages(prev => [...prev, event.data]);
      }
    };
    socketRef.current = ws;
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;
    socketRef.current.send(JSON.stringify({ content: newMessage }));
    setNewMessage("");
  };

  // --- Effects ---

  useEffect(() => {
    if (!auth.loading && auth.user) {
      fetchFriends();
      connectPresence();
    } else {
      if (presenceSocketRef.current) {
        presenceSocketRef.current.close();
        presenceSocketRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    }
  }, [auth.loading, auth.user]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchFriends = async () => {
    setLoading(true);
    const res = await apiGet("/friends");
    if (res.ok) setFriends(res.json || []);
    setLoading(false);
  };

  const handleStartChat = (friend) => {
    setActiveChat(friend);
    connectChat(friend.username);
  };

  if (auth.loading || !auth.user) return null;

  return (
    <>
      <Button
        variant="primary"
        className="sidebar-toggle rounded-full w-12 h-12 flex items-center justify-center p-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "✕" : "💬"}
      </Button>

      <aside className={`social-sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="font-bold text-surface-900">
            {activeChat ? `Chat with ${activeChat.username}` : "Social"}
          </h2>
          {activeChat && (
            <Button variant="ghost" size="sm" onClick={() => setActiveChat(null)}>
              Back
            </Button>
          )}
        </div>

        <div className="chat-container">
          {!activeChat ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                Friends
              </div>
              {friends.length === 0 ? (
                <p className="text-sm text-surface-500 italic">No friends yet.</p>
              ) : (
                friends.map(friend => (
                  <button
                    key={friend.id}
                    className="w-full flex items-center gap-3 p-2 hover:bg-surface-50 rounded-lg transition-colors text-left"
                    onClick={() => handleStartChat(friend)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-surface-700 font-bold border border-surface-200">
                        {friend.username[0].toUpperCase()}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${onlineUsers.has(friend.username) ? "bg-green-500" : "bg-gray-300"
                        }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">{friend.username}</p>
                      <p className="text-xs text-surface-400">
                        {onlineUsers.has(friend.username) ? "Online" : "Offline"}
                      </p>
                    </div>
                  </button>
                ))
              )}
              <Link to="/friends" className="block mt-4 text-xs text-brand-600 hover:underline text-center" onClick={() => setIsOpen(false)}>
                Manage all friends & requests
              </Link>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-surface-400 mt-10">No messages yet. Say hi!</p>
                ) : (
                  messages.map((m, i) => (
                    <div
                      key={m.id || i}
                      className={`message-bubble ${m.sender_id === auth.user.id ? "mine" : "theirs"}`}
                    >
                      <p className="text-sm leading-snug">{m.content}</p>
                      <span className="text-[10px] opacity-70 block text-right mt-1">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}
        </div>

        {activeChat && (
          <div className="sidebar-footer">
            <div className="flex gap-2">
              <TextInput
                size="sm"
                placeholder="Message..."
                value={newMessage}
                onChange={setNewMessage}
                onEnter={sendMessage}
              />
              <Button size="sm" onClick={sendMessage} className="aspect-square p-2">
                ➤
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
