// src/components/HomePage.js
import React, { useState } from 'react';
import axios from 'axios';

function HomePage({ token, userId, onEnterNegotiation }) {
  const [joinSessionInput, setJoinSessionInput] = useState('');
  const [message, setMessage] = useState('');

  const createNewSession = async () => {
    try {
      setMessage('');
      const res = await axios.post(
        'http://localhost:5000/api/negotiations/create',
        {},
        { headers: { 'x-auth-token': token } }
      );
      setMessage(`New session created! ID: ${res.data.sessionId}. Redirecting...`);
      onEnterNegotiation(res.data.sessionId); // Set this session as active
    } catch (err) {
      console.error(err.response?.data || err);
      setMessage(`Error creating session: ${err.response?.data?.msg || err.message}`);
    }
  };

  const joinExistingSession = async () => {
    if (!joinSessionInput) {
      setMessage('Please enter a session ID.');
      return;
    }
    try {
      setMessage('');
      const res = await axios.post(
        'http://localhost:5000/api/negotiations/join',
        { sessionId: joinSessionInput },
        { headers: { 'x-auth-token': token } }
      );
      setMessage(`Joined session! ID: ${res.data.sessionId}. Redirecting...`);
      onEnterNegotiation(res.data.sessionId); // Set this session as active
    } catch (err) {
      console.error(err.response?.data || err);
      setMessage(`Error joining session: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Welcome to Negotiation App</h2>
        <p className="text-lg text-gray-600">User ID: {userId}</p>

        {message && (
          <p className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </p>
        )}

        <div className="space-y-4">
          <button
            onClick={createNewSession}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Start New Negotiation
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">OR</span>
            </div>
          </div>

          <input
            type="text"
            value={joinSessionInput}
            onChange={(e) => setJoinSessionInput(e.target.value)}
            placeholder="Enter Session ID to join"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={joinExistingSession}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Join Existing Negotiation
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;