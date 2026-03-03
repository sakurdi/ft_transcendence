import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import Chat from './Chat.jsx'
import ChatWindow from './ChatWindow.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

    	{/* <Chat /> */}
		<ChatWindow />
    </>
  )
}

export default App
