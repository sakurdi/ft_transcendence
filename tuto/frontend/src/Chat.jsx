import React, { useState, useEffect } from 'react'
import './App.css'

function Chat() {
	const [message, setMessage] = useState([])
	const [status, setStatus] = useState()
	
	const fetchMessages = () => {
		fetch("http://localhost:8080/messages")
		.then(response => {
			// if (!response.ok)
			// 	throw new Error("ERREUR RESEAU");
			return response.json();
		})
		.then(data => {
			setMessage(data);
			setStatus("Connected");
		})
		.catch(err => {
			console.error(err);
			setStatus("ERREUR CONNEXION BACKEND");
		});
	};




	useEffect( () => {
		fetchMessages();
		const interval = setInterval(fetchMessages, 2000);
		return () => clearInterval(interval);
	}, []);



	return (
    <div className="chat-container">
      <h1>Last message</h1>
      <p>Statut={status}</p>

      <div className="messages-list">
        {message.length === 0 ?
		( <p>NO MESSAGE</p> ) :
		( message.map((m, index) => (
            <div key={index} className="message-item">
              <strong>{m.username} :</strong> <span>{m.content}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Chat;