import { useContext, useEffect } from 'react';
import './Sidebar.css';
import { MyContext } from './MyContext';
import {v1 as uuidv1} from "uuid";
import { API_BASE_URL } from './api.js';

function Sidebar() {
  const {allThreads , setAllThreads , currThreadId , setNewChat , setPrompt , setReply, setCurrentThreadId, setPrevChats ,} = useContext(MyContext);

  const getAllThreads = async () =>{
    try{
      const response = await fetch(`${API_BASE_URL}/api/thread`);
      const res = await response.json();
        const filterData = res.map(thread => ({threadId: thread.threadId, title: thread.title}));
      // console.log(filterData);
      setAllThreads(filterData);

    }catch(err){
      console.log(err);
    }
  }
  useEffect(()=>{
    getAllThreads();
  } , [currThreadId]);

  const createNewChat = () =>{
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrentThreadId(uuidv1());
    setPrevChats([]);
  }

  const changeThread = async(newThreadId)=>{
    setCurrentThreadId(newThreadId);

    try{
      const response = await fetch(`${API_BASE_URL}/api/thread/${newThreadId}`);
      const res = await response.json();
      console.log(res);
      setPrevChats(res);
      setNewChat(false);
      setReply(null);

    }catch(err){
      console.log(err);
    }

  }

  const deleteThread = async( threadId)=>{
    try{
    const response = await  fetch(`${API_BASE_URL}/api/thread/${threadId}` , {method:"DELETE"});
    const res =  await response.json();
    console.log(res);

    setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
    if(currThreadId == threadId){
      createNewChat();
    }
    }catch(err){
      console.log(err);
    }
  }

  return (
    <section className='sidebar'>
       <img src="logo.jpg" alt="logo" className='logo'/>

      <button onClick={createNewChat} className='newChatBtn'>
        <span ><h5>New Chat</h5> </span>
       <span> <i className="fa-regular fa-pen-to-square"></i> </span>
      </button>
      <h5 className='recents'> &nbsp; Recents <i className="fa-solid fa-chevron-down"></i></h5>

      <ul className='history'>
          {
            allThreads?.map((thread, idx)=>(
               <li key={idx}
                onClick={(e)=>changeThread(thread.threadId)}
                className={thread.threadId === currThreadId ? "highLighted": " "}
               > {thread.title} 
               <i className="fa-solid fa-trash" onClick={(e)=>{e.stopPropagation();
                 deleteThread(thread.threadId);
               }}>
               </i>
              
               </li>
            ))
          }
        
      </ul>

      <div className='sign'>
          <p className='startNewChat'>By Md Faizan <i className="fa-solid fa-heart-crack"></i> </p>
      </div>

    </section>
  )
}

export default Sidebar