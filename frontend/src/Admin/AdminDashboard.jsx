import { useState, useEffect } from "react";
import useAuth from "../User/AuthProvider";
import useNotif from "../components/Notif";
import { apiGet, apiPut, apiDelete } from "../Utils/api";
import Loading from "../components/Loading";
import Button from "../components/Button";
import Card from "../components/Card";
import TextInput from "../components/TextInput";

const ROLES = ["user", "superadmin", "banned"];

const roleBadge = (role) => {
  switch (role) {
    case "superadmin":
      return "bg-brand-100 text-brand-700 border-brand-200";
    case "banned":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-surface-100 text-surface-700 border-surface-200";
  }
};

const StatItem = ({ label, value, colorClass = "text-surface-900" }) => (
  <div className="text-center px-6">
    <p className={`text-2xl font-black ${colorClass}`}>{value}</p>
    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

export default function AdminDashboard() {
  const auth = useAuth();
  const notif = useNotif();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/users");
      if (res.ok) {
        setUsers(res.json || []);
      } else {
        notif.pushError(res.status || "Failed to fetch users");
      }
    } catch (err) {
      notif.pushError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.loading && auth.user?.role === "superadmin") {
      fetchUsers();
    }
  }, [auth.loading, auth.user]);

  const handleUpdateRole = async (userID, newRole) => {
    const res = await apiPut(`/users/${userID}/role`, {
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      notif.pushSuccess("User role updated");
      fetchUsers();
    } else {
      notif.pushError(res.status || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userID, username) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete user ${username}?`)) return;
    const res = await apiDelete(`/users/${userID}`);
    if (res.ok) {
      notif.pushSuccess("User deleted");
      fetchUsers();
    } else {
      notif.pushError(res.status || "Failed to delete user");
    }
  };

  if (auth.loading) return <div className="p-12"><Loading /></div>;
  if (auth.user?.role !== "superadmin") return <div className="p-12 text-center text-red-500 font-bold uppercase tracking-widest">Access Denied</div>;
  if (loading) return <div className="p-12"><Loading /></div>;

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "superadmin").length,
    banned: users.filter(u => u.role === "banned").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header & Stats */}
      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between p-8 gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">Admin Console</h1>
            <p className="text-surface-500 mt-1">Platform management and user oversight.</p>
          </div>
          <div className="flex divide-x divide-surface-100">
            <StatItem label="Total Users" value={stats.total} />
            <StatItem label="Admins" value={stats.admins} colorClass="text-brand-600" />
            <StatItem label="Banned" value={stats.banned} colorClass="text-red-500" />
          </div>
        </div>
      </Card>

      {/* Main Actions Area */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">Search Directory</label>
          <TextInput 
            value={search}
            onChange={setSearch}
            placeholder="Search by username or email..."
          />
        </div>
        <Button variant="outline" onClick={fetchUsers} className="h-[42px] w-full md:w-auto">
          Reload Data
        </Button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-[2.5rem] border border-surface-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50/50 border-b border-surface-100">
                <th className="px-8 py-5 text-[10px] font-black text-surface-400 uppercase tracking-widest">User Profile</th>
                <th className="px-8 py-5 text-[10px] font-black text-surface-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-surface-400 uppercase tracking-widest">Permissions</th>
                <th className="px-8 py-5 text-[10px] font-black text-surface-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-surface-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center text-surface-700 font-black text-sm">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-surface-900 group-hover:text-brand-600 transition-colors">{u.username}</div>
                        <div className="text-xs text-surface-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${roleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="text-xs bg-surface-50 border border-surface-200 rounded-lg px-3 py-2 font-bold text-surface-700 focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer outline-none"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 h-auto opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      disabled={u.id === auth.user.id}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="p-20 text-center text-surface-400 italic">
            No matching users found in the directory.
          </div>
        )}
      </div>
    </div>
  );
}
