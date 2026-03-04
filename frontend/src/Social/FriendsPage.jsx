import { useState, useEffect } from "react";
import useAuth from "../User/AuthProvider";
import useNotif from "../components/Notif";
import Loading from "../components/Loading";
import { apiGet, apiPost, apiDelete } from "../Utils/api";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import Card from "../components/Card";

export default function FriendsPage() {
  const auth = useAuth();
  const notif = useNotif();
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "pending", "add"

  const fetchData = async () => {
    setLoading(true);
    const [friendsRes, requestsRes] = await Promise.all([
      apiGet("/friends"),
      apiGet("/friends/requests")
    ]);

    if (friendsRes.ok) setFriends(friendsRes.json || []);
    if (requestsRes.ok) setRequests(requestsRes.json || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!auth.loading && auth.user) {
      fetchData();
    }
  }, [auth.loading, auth.user]);

  const handleAccept = async (username) => {
    const res = await apiPost(`/friends/request/${username}/accept`);
    if (res.ok) {
      notif.pushSuccess(`Accepted ${username}'s friend request`);
      fetchData();
    } else {
      notif.pushError(res.status || "Failed to accept request");
    }
  };

  const handleDecline = async (username) => {
    const res = await apiPost(`/friends/request/${username}/decline`);
    if (res.ok) {
      notif.pushSuccess(`Declined ${username}'s friend request`);
      fetchData();
    } else {
      notif.pushError(res.status || "Failed to decline request");
    }
  };

  const handleUnfriend = async (username) => {
    if (!window.confirm(`Are you sure you want to unfriend ${username}?`)) return;
    const res = await apiDelete(`/friends/${username}`);
    if (res.ok) {
      notif.pushSuccess(`Removed ${username} from friends`);
      fetchData();
    } else {
      notif.pushError(res.status || "Failed to remove friend");
    }
  };

  const handleSendRequest = async () => {
    if (!searchQuery.trim()) return;
    const res = await apiPost(`/friends/request/${searchQuery.trim()}`);
    if (res.ok) {
      notif.pushSuccess(`Friend request sent to ${searchQuery}`);
      setSearchQuery("");
      setActiveTab("pending");
      fetchData();
    } else {
      notif.pushError(res.status || "User not found or request already sent");
    }
  };

  if (auth.loading || loading) return <div className="p-8"><Loading /></div>;
  if (!auth.user) return <div className="p-8 text-center text-surface-500">Please log in to manage friends.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 mb-2">Social</h1>
        <p className="text-surface-500">Manage your connections and friend requests.</p>
      </header>

      <div className="flex gap-2 mb-6 border-b border-surface-200 pb-px">
        <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")}>
          All Friends ({friends.length})
        </TabButton>
        <TabButton active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>
          Pending ({requests.length})
        </TabButton>
        <TabButton active={activeTab === "add"} onClick={() => setActiveTab("add")}>
          Add Friend
        </TabButton>
      </div>

      <div className="space-y-4">
        {activeTab === "all" && (
          friends.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {friends.map(friend => (
                <FriendCard
                  key={friend.id}
                  user={friend}
                  onUnfriend={() => handleUnfriend(friend.username)}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="You haven't added any friends yet." />
          )
        )}

        {activeTab === "pending" && (
          requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={() => handleAccept(request.username)}
                  onDecline={() => handleDecline(request.username)}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No pending friend requests." />
          )
        )}

        {activeTab === "add" && (
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-surface-900">Add a friend</h3>
              <p className="text-sm text-surface-500">Enter your friend's username to send them a request.</p>
              <div className="flex gap-2">
                <TextInput
                  placeholder="Username..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onEnter={handleSendRequest}
                />
                <Button onClick={handleSendRequest}>Send Request</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${active
          ? "border-brand-500 text-brand-600"
          : "border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300"
        }`}
    >
      {children}
    </button>
  );
}

function FriendCard({ user, onUnfriend }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-surface-200 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-surface-700 font-bold border border-surface-200">
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <h4 className="font-semibold text-surface-900">{user.username}</h4>
          <span className="text-xs text-surface-400">ID: {user.id}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => window.location.href = `/user/${user.username}`}>Profile</Button>
        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={onUnfriend}>Remove</Button>
      </div>
    </div>
  );
}

function RequestCard({ request, onAccept, onDecline }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-surface-200 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold border border-brand-200">
          {request.username[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm text-surface-900">
            <span className="font-bold">{request.username}</span> wants to be your friend
          </p>
          <span className="text-xs text-surface-400">Received recently</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onAccept}>Accept</Button>
        <Button variant="outline" size="sm" onClick={onDecline}>Decline</Button>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed border-surface-200 rounded-2xl">
      <p className="text-surface-500">{message}</p>
    </div>
  );
}
