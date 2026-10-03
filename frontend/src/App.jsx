import './App.css';
import './index.css';
import ChatWindow from './ChatWindow.jsx';
import Sidebar from './Sidebar.jsx';
import { MyContext } from './MyContext.jsx';
import { useCallback, useEffect, useState } from 'react';
import {v1 as uuidv1} from "uuid";


function App() {  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prompt , setPrompt] = useState("");
  const [reply , setReply] = useState(null);
  const [currThreadId, setCurrentThreadId] = useState( uuidv1());
  const [prevChats , setPrevChats] = useState([]);
  const [newChat , setNewChat] = useState(true);
  const [allThreads , setAllThreads] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    if (!isSidebarOpen) return undefined;
    const closeOnEscape = event => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isSidebarOpen]);

  const startNewChat = useCallback(() => {
    setPrompt("");
    setCurrentThreadId(uuidv1());
    setPrevChats([]);
    setNewChat(true);
    setReply(null);
    setRequestError("");
  }, []);

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrentThreadId,
    prevChats, setPrevChats,
    newChat, setNewChat,
    allThreads, setAllThreads,
    startNewChat,
    isBusy, setIsBusy,
    requestError, setRequestError,
  }; 

  return (
    <div className='app'>
    <MyContext value={providerValues} >
    <Sidebar isOpen={isSidebarOpen} isBusy={isBusy} onClose={() => setIsSidebarOpen(false)} />
    {isSidebarOpen && <button className='sidebarBackdrop' type='button' aria-label='Close navigation' onClick={() => setIsSidebarOpen(false)} />}
    <ChatWindow isSidebarOpen={isSidebarOpen} onOpenSidebar={() => setIsSidebarOpen(true)} />
    </MyContext>
    </div>
  )
}

export default App
