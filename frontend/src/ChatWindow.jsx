import './ChatWindow.css';
import Chat from './Chat.jsx'
import { MyContext } from './MyContext.jsx';
import { useContext, useEffect, useRef, useState } from 'react';
import { CircleLoader } from "react-spinners";
import { API_BASE_URL } from './api.js';

function ChatWindow({ onOpenSidebar, isSidebarOpen }) {
  const { prompt, setPrompt, currThreadId, setPrevChats, setNewChat, startNewChat, isBusy: loading, setIsBusy: setLoading, requestError, setRequestError } = useContext(MyContext);
  const [isOpen, setIsOpen] = useState(false);
  const abortControllerRef = useRef(null);
  const composerRef = useRef(null);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const getReply = async (messageToSend = prompt) => {

    const message = messageToSend.trim();
    if (!message || loading) return;

    setRequestError("");
    setLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const options = {
      method: "POST",
      signal: controller.signal,
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
      setPrevChats((prevChatsState) => [
        ...prevChatsState,
        { role: "user", content: message },
        { role: "assistant", content: res.reply }
      ]);
      setNewChat(false);
      setPrompt("");
      if (composerRef.current) composerRef.current.style.height = "";
      setLoading(false);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setLoading(false);
        return;
      }
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "";
      setRequestError(
        errorMessage.toLowerCase().includes("failed to fetch")
          ? "Your chance is over"
          : errorMessage || "Unable to reach the assistant. Please try again."
      );
      setLoading(false);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const stopReply = () => {
    abortControllerRef.current?.abort();
  };

  const handleClickAuth =()=>{
       setIsOpen(!isOpen)
  }

  const handleNewChat = () => {
    if (loading) abortControllerRef.current?.abort();
    startNewChat();
    setIsOpen(false);
  };

  const clearDraft = () => {
    setPrompt("");
    if (composerRef.current) composerRef.current.style.height = "";
    setIsOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    getReply();
  };

  return (
    <div className='chatWindow' aria-busy={loading}>
      <div className='navbar' ref={accountMenuRef}>
        <button className='menuButton' type='button' aria-label='Open navigation' aria-expanded={isSidebarOpen} onClick={onOpenSidebar}>
          <i className='fa-solid fa-bars'></i>
        </button>
        <span className='font-design'> Jarves <i className="fa-brands fa-studiovinari"></i></span>
        <div className='userIconDiv'>
          <button className='userIcon' type='button' aria-label='Open account menu' aria-expanded={isOpen} onClick={handleClickAuth}>
            <i className="fa-regular fa-user" aria-hidden='true'></i>
          </button>
        </div>
        {
          isOpen &&
          <div className='dropDown' role='menu' aria-label='Chat options'>
            <button className='dropDownItem' type='button' role='menuitem' onClick={handleNewChat}>
              <i className='fa-regular fa-pen-to-square' aria-hidden='true'></i> New conversation
            </button>
            <button className='dropDownItem' type='button' role='menuitem' onClick={clearDraft} disabled={!prompt}>
              <i className='fa-solid fa-eraser' aria-hidden='true'></i> Clear message
            </button>
          </div>
        }
      </div>

      <Chat />
      <div className='loadingStatus' role='status' aria-live='polite'>
        <CircleLoader color='#caa86e' size={28} loading={loading} />
        {loading && <span>Jarves is thinking...</span>}
      </div>
      {requestError && (
        <div className='requestError' role='alert'>
          <span>{requestError}</span>
          <button className='retryButton' type='button' onClick={() => getReply()}>
            <i className='fa-solid fa-rotate-right' aria-hidden='true'></i> Retry
          </button>
        </div>
      )}

      <div className='chatInput'>
        <form className='inputBox' onSubmit={handleSubmit}>
          <textarea
            ref={composerRef}
            aria-label='Message Jarves'
            placeholder='Ask Anything...'
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              event.target.style.height = "auto";
              event.target.style.height = `${Math.min(event.target.scrollHeight, 180)}px`;
            }}
            disabled={loading}
            rows={1}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                getReply();
              }
            }}
          />

          {loading ? (
            <button id="submit" className='stopButton' type='button' aria-label='Stop response' onClick={stopReply}>
              <i className='fa-solid fa-stop' aria-hidden='true'></i>
            </button>
          ) : (
            <button id="submit" type='submit' aria-label='Send message' disabled={!prompt.trim()}>
              <i className="fa-solid fa-arrow-up" aria-hidden='true'></i>
            </button>
          )}
        </form>
        <p className='info'>Enter to send · Shift + Enter for a new line · Jarves can make mistakes.</p>
      </div>
    </div>
  );
}

export default ChatWindow
