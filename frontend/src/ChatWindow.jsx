import './ChatWindow.css';
import Chat from './Chat.jsx'
import { MyContext } from './MyContext.jsx';
import { useContext, useEffect, useState } from 'react';
import { CircleLoader } from "react-spinners";
import { API_BASE_URL } from './api.js';

function ChatWindow({ onOpenSidebar }) {
  const { prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat } = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const [requestError, setRequestError] = useState("");
  const [isOpen , setIsOpen] = useState(false) // set as false ; 

  const getReply = async () => {

    const message = prompt.trim();
    if (!message || loading) return;

    setRequestError("");
    setPendingMessage(message);
    setLoading(true);
    

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        threadId: currThreadId,
        message
      })
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, options);
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.error || `Request failed (${response.status})`);
      }
      if (typeof res.reply !== "string" || !res.reply.trim()) {
        throw new Error("The assistant returned an empty reply. Please try again.");
      }
      setReply(res.reply);
    } catch (err) {
      console.error(err);
      setRequestError(err.message || "Unable to reach the assistant. Please try again.");
      setPendingMessage("");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!reply || !pendingMessage) return;

    setPrevChats((prevChatsState) => [
      ...prevChatsState,
      { role: "user", content: pendingMessage },
      { role: "assistant", content: reply }
    ]);

    setNewChat(false);
    setPrompt("");
    setReply(null);
    setPendingMessage("");
    setLoading(false);
  }, [reply, pendingMessage, setPrevChats, setNewChat, setPrompt, setReply]);

  const handleClickAuth =()=>{
       setIsOpen(!isOpen)
  }

  return (
    <div className='chatWindow'>
      <div className='navbar'>
        <button className='menuButton' aria-label='Open navigation' onClick={onOpenSidebar}>
          <i className='fa-solid fa-bars'></i>
        </button>
        <span className='font-design'> Jarves <i className="fa-brands fa-studiovinari"></i></span>
        <div className='userIconDiv'>
          <span className='userIcon'><i  onClick={handleClickAuth} className="fa-regular fa-user"></i></span>
        </div>
      </div>

      {
        isOpen && 
        <div className='dropDown'>
          <div className='dropDownItem'><i className="fa-solid fa-gear"></i> Setting </div>
          <div className='dropDownItem'><i className="fa-solid fa-cloud-arrow-up"></i> Upgrade Plan </div>
          <div className='dropDownItem'> <i className="fa-solid fa-right-from-bracket"></i>Logout</div>
        </div>
      }

      <Chat />
      <CircleLoader color='#fff' loading={loading} />
      {requestError && <p className='requestError' role='alert'>{requestError}</p>}

      <div className='chatInput'>
        <div className='inputBox'>
          <input
            placeholder='Ask Anything...'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getReply()}
          />

          <div id="submit" onClick={getReply}> <i className="fa-brands fa-studiovinari"></i> </div>
        </div>
        <p className='info'>Me hu Papa is Duniya ka papa </p>
      </div>
    </div>
  );
}

export default ChatWindow
