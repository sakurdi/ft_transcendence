import React, { useEffect, useState } from 'react';
import "./ChatWindow.css";

function ChatWindow() {

	const [username, setUsername] = useState("");
	const [message, setMessage] = useState("");
	const [history, setHistory] = useState([]);
	const [socket, setSocket] = useState(null);

	const fetchMessages = () => {
		fetch("http://localhost:8080/messages")
		.then(response => {
			// if (!response.ok)
			// 	throw new Error("ERREUR RESEAU");
			return response.json();
		})
		.then(data => {
			setHistory(data);
			setStatus("Connected");
		})
		.catch(err => {
			console.error(err);
			setStatus("ERREUR CONNEXION BACKEND");
		});
	};

	useEffect( () => {
		fetchMessages();
	}, []);

	useEffect( () => {
		const newSocket = new WebSocket("ws://localhost:8080/ws");

		newSocket.onopen = () => {
			console.log("websocket connected")
		}

		newSocket.onmessage = (event) => {
			const msgData = JSON.parse(event.data);
			setHistory( prev => [...prev, msgData]);
		}

		newSocket.onerror = (err) => {
			console.error("Error websocket", err);
		}

		newSocket.onclose = (err) => {
			console.error("Close websocket", err);
		}

		setSocket(newSocket);
		return () => newSocket.close();
	}, []);

	const sendMessage = () => {
		//e.preventDefault();

		const payload = {
			username : username,
			content : message,
		}

		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify(payload));
			console.log("Sent to socket");
		}

	};

	const handleSend = () => {
		console.log("Message send: " + message);
		sendMessage();
		setMessage("");
	};

	return (
	<div>
		<h1>Chatroom</h1>

		 {/* <div className="messages-list"> */}
		<div className="messages-list">
		{history.length === 0 ?
		( <p>NO MESSAGE</p> ) :
		(history.slice().reverse().map((m, index) => (
			m.username === username ? (
				<div key={index} className="message-item-self">
				  <strong>{m.username} :</strong> <span>{m.content}</span>
				</div>
			) : (
			<div key={index} className="message-item-others">
			  <strong>{m.username} :</strong> <span>{m.content}</span>
			</div>
			)
		  ))
		)}
      </div>

		<input 
		type="text" 
		placeholder="Type username here" 
		value={username} 
		onChange={(evenement) => setUsername(evenement.target.value)} 

		onKeyDown={(e) => {
		if (e.key === "Enter") handleSend();
		}}
		/>

		<input 
		type="text" 
		placeholder="Type message here" 
		value={message} 
		onChange={(evenement) => setMessage(evenement.target.value)} 

		onKeyDown={(e) => {
		if (e.key === "Enter") handleSend();
		}}
		/>
		
		<button onClick={handleSend}>
		Send
		</button>
	</div>
	);
}

export default ChatWindow;