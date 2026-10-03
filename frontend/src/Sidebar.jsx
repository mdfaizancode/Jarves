import { useContext, useEffect, useRef, useState } from 'react';
import './Sidebar.css';
import { MyContext } from './MyContext';
import { API_BASE_URL } from './api.js';

function Sidebar({ isOpen, onClose, isBusy }) {
  const {allThreads, setAllThreads, currThreadId, startNewChat, setReply, setCurrentThreadId, setPrevChats, setNewChat, setPrompt, setRequestError} = useContext(MyContext);
  const [search, setSearch] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarError, setSidebarError] = useState("");
  const threadRequestRef = useRef(0);

  useEffect(() => {
      const controller = new AbortController();
      fetch(`${API_BASE_URL}/api/thread`, {signal: controller.signal})
        .then(async response => {
          const res = await response.json();
          if (!response.ok) {
            throw new Error(res.error || `Could not load chats (${response.status})`);
          }
          if (!Array.isArray(res)) {
            throw new Error("The server returned an invalid chat list.");
          }
          return res.map(thread => ({threadId: thread.threadId, title: thread.title}));
        })
        .then(threads => {
          setAllThreads(threads);
          setSidebarError("");
        })
        .catch(err => {
          if (err instanceof Error && err.name === "AbortError") return;
          console.error(err);
          setSidebarError(err instanceof Error ? err.message : "Could not load chats.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
      return () => controller.abort();
  }, [currThreadId, setAllThreads]);

  const createNewChat = () => {
      if (isBusy) return;
      threadRequestRef.current += 1;
      startNewChat();
      onClose();
  };

  const changeThread = async (newThreadId) => {
      if (isBusy) return;
      const requestId = ++threadRequestRef.current;
      setCurrentThreadId(newThreadId);
      setSidebarError("");
      setRequestError("");
      setPrompt("");
      setPrevChats([]);
      setNewChat(true);
      onClose();

      try {
        const response = await fetch(`${API_BASE_URL}/api/thread/${newThreadId}`);
        const res = await response.json();
        if (!response.ok) {
          throw new Error(res.error || `Could not open chat (${response.status})`);
        }
        if (!Array.isArray(res)) {
          throw new Error("The server returned an invalid conversation.");
        }
        if (requestId !== threadRequestRef.current) return;
        setPrevChats(res);
        setNewChat(false);
        setReply(null);
      } catch (err) {
        if (requestId !== threadRequestRef.current) return;
        console.error(err);
        setSidebarError(err instanceof Error ? err.message : "Could not open chat.");
      }
  }

  const deleteThread = async (event, threadId, title) => {
      event.stopPropagation();
      if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
      try{
        const response = await fetch(`${API_BASE_URL}/api/thread/${threadId}`, {method: "DELETE"});
        const res = await response.json();
        if (!response.ok) {
          throw new Error(res.error || `Could not delete chat (${response.status})`);
        }
        setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
        setRequestError("");
        if (currThreadId === threadId) {
          threadRequestRef.current += 1;
          startNewChat();
        }
      }
      catch(err) {
        console.error(err);
        setSidebarError(err instanceof Error ? err.message : "Could not delete chat.");
      }
  }

  const filteredThreads = allThreads.filter(thread =>
      (thread.title || "").toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  );

  return (
      <section className={`sidebar${isOpen ? ' sidebarOpen' : ''}`} aria-label='Chat history'>
        <div className='sidebarTop'>
          <img src="/logo.jpg" alt="Jarves" className='logo'/>

          <button onClick={createNewChat} className='newChatBtn' type='button' disabled={isBusy}>
            <span><h5>New Chat</h5></span>
            <i className="fa-regular fa-pen-to-square" aria-hidden='true'></i>
          </button>

          <div className='recentsRow'>
            <h2 className='recents'>Recent chats</h2>
            <button className='historyToggle' type='button' aria-label={isHistoryOpen ? 'Collapse recent chats' : 'Expand recent chats'} aria-expanded={isHistoryOpen} onClick={() => setIsHistoryOpen(open => !open)}>
              <i className={`fa-solid fa-chevron-${isHistoryOpen ? 'down' : 'right'}`} aria-hidden='true'></i>
            </button>
          </div>

          {isHistoryOpen && (
            <>
              <label className='historySearch'>
                <i className='fa-solid fa-magnifying-glass' aria-hidden='true'></i>
                <input aria-label='Search recent chats' placeholder='Search chats' value={search} onChange={event => setSearch(event.target.value)} />
                {search && <button type='button' aria-label='Clear chat search' onClick={() => setSearch("")}><i className='fa-solid fa-xmark' aria-hidden='true'></i></button>}
              </label>
              {sidebarError && <p className='sidebarError' role='alert'>{sidebarError}</p>}
              <ul className='history' aria-label='Recent chats'>
                {isLoading ? (
                  <li className='historyMessage'>Loading chats...</li>
                ) : filteredThreads.length ? filteredThreads.map(thread => (
                  <li className={`historyItem${thread.threadId === currThreadId ? ' highLighted' : ''}`} key={thread.threadId}>
                    <button
                      className={`threadOpenButton${thread.threadId === currThreadId ? ' highLighted' : ''}`}
                      type='button'
                      title={thread.title}
                      onClick={() => changeThread(thread.threadId)}
                      disabled={isBusy}
                    >
                      {thread.title}
                    </button>
                    <button className='deleteThreadButton' type='button' aria-label={`Delete ${thread.title}`} title='Delete chat' onClick={event => deleteThread(event, thread.threadId, thread.title)} disabled={isBusy}>
                      <i className='fa-regular fa-trash-can' aria-hidden='true'></i>
                    </button>
                  </li>
                )) : (
                  <li className='historyMessage'>{search ? 'No matching chats.' : 'Your chats will appear here.'}</li>
                )}
              </ul>
            </>
          )}
        </div>

        <div className='sign'>
          <p className='startNewChat'>By Md Faizan <i className="fa-solid fa-heart" aria-hidden='true'></i></p>
        </div>

    </section>
  )
}

export default Sidebar