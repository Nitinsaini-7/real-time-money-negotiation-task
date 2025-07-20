// src/components/Auth.js (simplified)
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function Auth({ setToken, setCurrentUser }) {
  const [isRegister, setIsRegister] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister
      ? `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`
      : `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`;
    try {
      const res = await axios.post(url, { username, password });
      setToken(res.data.token);
      setCurrentUser({ id: res.data.userId, username });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("username", username);
      toast.success("Login Successfully");
    } catch (err) {
        console.log(err);
        
      toast.error(err.response.data.msg || "Password must have min 6 character");
      
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? "Register" : "Login"}
        </h2>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className=" grid gap-5">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            {isRegister ? "Register" : "Login"}
          </button>
          <button
            type="button"
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Auth;
