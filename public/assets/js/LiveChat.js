// LiveChat.js
import React, { useState, useEffect } from 'react';
import { db } from './fb'; // Your firebase.js path
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

const LiveChat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'livechat'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, 'livechat'), {
      text,
      timestamp: serverTimestamp(),
      user: `User${Math.floor(Math.random() * 1000)}`
    });
    setText('');
  };

  return (
    <div style={{
      width: '100%',
      height: '500px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px',
        fontSize: '14px'
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '8px' }}>
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid #ccc' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            border: 'none',
            padding: '10px',
            outline: 'none',
            fontSize: '14px'
          }}
        />
      </form>
    </div>
  );
};

export default LiveChat;
