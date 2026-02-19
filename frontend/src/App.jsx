import React, { useEffect, useState } from "react";

export default function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id} className="p-3 bg-white rounded shadow-sm border">
            <span className="font-medium">{u.login}</span>{" "}
            <span className="text-gray-500">(id: {u.id})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
