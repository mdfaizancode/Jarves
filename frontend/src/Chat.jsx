import './Chat.css';
import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from './MyContext';
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css";
 
function Chat() {
  const {newChat, prevChats , reply} = useContext(MyContext);
  const [animatedReply, setAnimatedReply] = useState({index: -1, content: ''});
  const [latestReply , setLatestReply] = useState(null);
   useEffect(() => {
    if(reply === null){
      setLatestReply(null);
      return ;
    }
    const latestAssistantIndex = prevChats?.findLastIndex((chat) => chat.role === 'assistant') ?? -1;
    if (latestAssistantIndex === -1) {
      setAnimatedReply({index: -1, content: ''});
      return;
    }

    const words = prevChats[latestAssistantIndex].content.split(' ');
    let wordIndex = 0;
    setAnimatedReply({index: latestAssistantIndex, content: ''});

    const interval = setInterval(() => {
      setAnimatedReply({
        index: latestAssistantIndex,
        content: words.slice(0, wordIndex + 1).join(' ')
      });
      wordIndex += 1;

      if (wordIndex >= words.length) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, [prevChats]);

  return (
    <div className={`chatContent${newChat ? ' emptyChat' : ''}`}>
      {newChat && <h1 className='startNewChat'>Ask Your Wish</h1>}
      <div className='chats'>
      {
        prevChats?.map((chat,idx)=>
          <div className={chat.role === "user"? "userDiv": "jarvesDiv"} key={idx}>
            {
              chat.role === "user"?
              <p className='userMessage'> {chat.content}</p>:
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {idx === animatedReply.index ? animatedReply.content : chat.content}
              </ReactMarkdown>
            }
          </div>
        )
      }

      </div>
    </div>
  )
}

export default Chat