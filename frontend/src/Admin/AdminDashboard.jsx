import { useState, useEffect } from "react";
import useAuth from "../User/AuthProvider";
import useNotif from "../components/Notif";
import { apiGet, apiPut, apiDelete } from "../Utils/api";
import Loading from "../components/Loading";
import Button from "../components/Button";
import Card from "../components/Card";

export default function AdminDashboard() {
  const auth = useAuth();
  const notif = useNotif();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await apiGet("/users");
    if (res.ok) {
      setUsers(res.json || []);
    } else {
      notif.pushError(res.status || "Failed to fetch users");
    }
    setLoading(false);
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

  if (auth.loading || loading) return <div className="p-12"><Loading /></div>;
  if (auth.user?.role !== "superadmin") return <div className="p-12 text-center text-red-500">Access Denied</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-surface-900 mb-2">Admin Dashboard</h1>
          <p className="text-surface-500">Manage site-wide users and permissions.</p>
        </div>
        <Button variant="outline" onClick={fetchUsers}>Refresh List</Button>
      </header>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-soft overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-200">
              <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-surface-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center text-surface-700 font-bold text-xs">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-surface-900">{u.username}</div>
                      <div className="text-xs text-surface-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                    className="text-sm bg-surface-100 border-none rounded-lg px-3 py-1 font-medium text-surface-700 focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="user">User</option>
                    <option value="superadmin">SuperAdmin</option>
                    <option value="banned">Banned</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-surface-500">
                  {new Date(u.member_since).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
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
        {users.length === 0 && (
          <div className="p-12 text-center text-surface-400">No users found.</div>
        )}
      </div>
    </div>
  );
}
