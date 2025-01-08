"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      username === process.env.NEXT_PUBLIC_APP_USERNAME &&
      password === process.env.NEXT_PUBLIC_APP_PASSWORD
    ) {
      localStorage.setItem("isAuthenticated", "true");
      router.push("/home");
    } else {
      alert("Invalid credentials");
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="p-4 bg-white rounded shadow-md">
        <h1 className="text-xl mb-4">Login</h1>
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
