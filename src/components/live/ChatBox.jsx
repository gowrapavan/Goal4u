import React, { useEffect, useState, useRef } from 'react';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB4fM9yww8wCUSW4I5mA6Ijc4P0aDmQrZY",
  authDomain: "netflix-db313.firebaseapp.com",
  projectId: "netflix-db313",
  storageBucket: "netflix-db313.appspot.com",
  messagingSenderId: "135508907284",
  appId: "1:135508907284:web:eb82d53578bb662140de01",
  measurementId: "G-BJ82BBL3RL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(newMessages);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await addDoc(collection(db, 'messages'), {
      text: input.trim(),
      timestamp: serverTimestamp()
    });

    setInput('');
  };

  return (
    <>
      {/* ✅ Responsive Styling */}
      <style>{`
        @media (max-width: 768px) {
          .chatbox-container {
            height: 65vh !important;
          }
        }
      `}</style>

      <div className="chatbox-container" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '80vh',
        backgroundColor: '#f1fff0',
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '800px'
      }}>
        {/* 🔰 Chat Title */}
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: '#2e7d32',
          textAlign: 'center'
        }}>
          💬 Live Chat
        </div>

        {/* 💬 Chat Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '6px',
          marginBottom: '12px'
        }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                background: '#dcedc8',
                padding: '10px 14px',
                marginBottom: '10px',
                borderRadius: '20px',
                fontSize: '14px',
                maxWidth: '80%',
                wordBreak: 'break-word',
                color: '#1b5e20',
                alignSelf: 'flex-start',
                boxShadow: '1px 1px 3px rgba(0,0,0,0.08)'
              }}
            >
              {msg.text}
              {msg.timestamp?.seconds && (
                <div style={{
                  fontSize: '10px',
                  color: '#33691e',
                  marginTop: '4px',
                  textAlign: 'right'
                }}>
                  {new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 📝 Input Box */}
        <form onSubmit={sendMessage} style={{
          display: 'flex',
          gap: '8px',
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '25px',
              border: '1px solid #a5d6a7',
              outline: 'none',
              fontSize: '14px',
              backgroundColor: '#ffffff'
            }}
          />
          <button type="submit" style={{
            padding: '10px 20px',
            backgroundColor: '#66bb6a',
            color: '#fff',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Send
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatBox;
