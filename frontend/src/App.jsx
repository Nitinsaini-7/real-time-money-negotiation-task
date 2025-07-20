// src/App.js
import React, { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import NegotiationRoom from './components/NegotiationRoom';
import './index.css'; // Make sure Tailwind CSS is imported
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState({
    id: localStorage.getItem('userId') || '',
    username: localStorage.getItem('username') || ''
  });
  const [sessionId, setSessionId] = useState(''); // This would typically be dynamic

  useEffect(() => {
    // Basic check for token validity (can be enhanced with backend validation)
    if (token && currentUser.id && currentUser.username) {
      // Simulate joining a session. In a real app, users would create/join specific sessions.
      setSessionId('negotiation-room-123'); // Example static session ID
    }
  }, [token, currentUser]);

  const handleLogout = () => {
    setToken('');
    setCurrentUser({ id: '', username: '' });
    setSessionId('');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    toast.success("Logout Successfully")
  };

  return (
    <div className="App">
      <Toaster/>
      {token && currentUser.id && sessionId ? (
        <div>
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
          <NegotiationRoom sessionId={sessionId} userId={currentUser.id} username={currentUser.username} />
        </div>
      ) : (
        <Auth setToken={setToken} setCurrentUser={setCurrentUser} />
      )}
    </div>
  );
}

export default App;