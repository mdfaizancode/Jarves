import './App.css';
import './index.css';
import ChatWindow from './ChatWindow.jsx';
import Sidebar from './Sidebar.jsx';
import { MyContext } from './MyContext.jsx';
import { useState } from 'react';
import {v1 as uuidv1} from "uuid";


function App() {  
  const [prompt , setPrompt] = useState("");
  const [reply , setReply] = useState(null);
  const [currThreadId, setCurrentThreadId] = useState( uuidv1());
  const [prevChats , setPrevChats] = useState([]);
  const [newChat , setNewChat] = useState(true);
  const [allThreads , setAllThreads] = useState([]);

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrentThreadId,
    prevChats, setPrevChats,
    newChat, setNewChat,
    allThreads, setAllThreads,
  }; 

  return (
    <div className='app'>
    <MyContext value={providerValues} >
    <Sidebar/>
    <ChatWindow/>
    </MyContext>
    </div>
  )
}

export default App
