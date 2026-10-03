import './Chat.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { MyContext } from './MyContext';
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css";
 
function Chat() {
  const {newChat, prevChats, setPrompt} = useContext(MyContext);
  const chatListRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [copyErrorIndex, setCopyErrorIndex] = useState(-1);

  const copyReply = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setCopyErrorIndex(-1);
      window.setTimeout(() => setCopiedIndex(-1), 1800);
    } catch (error) {
      console.error("Unable to copy assistant response:", error);
      setCopyErrorIndex(index);
    }
  };

  useEffect(() => {
    const chatList = chatListRef.current;
    if (chatList) chatList.scrollTop = chatList.scrollHeight;
  }, [prevChats]);

  return (
    <div className={`chatContent${newChat ? ' emptyChat' : ''}`}>
      {newChat && (
        <section className='welcomePanel' aria-labelledby='welcomeTitle'>
          <h1 id='welcomeTitle'>How can I help?</h1>
          <div className='suggestionGrid' aria-label='Try a suggested prompt'>
            <button className='suggestionCard' type='button' onClick={() => setPrompt('Help me plan a productive week')}>
              <i className='fa-regular fa-calendar' aria-hidden='true'></i>
              <span>Plan my week</span>
              <i className='fa-solid fa-arrow-up-right-from-square suggestionArrow' aria-hidden='true'></i>
            </button>
            <button className='suggestionCard' type='button' onClick={() => setPrompt('Give me creative ideas for my next project')}>
              <i className='fa-regular fa-lightbulb' aria-hidden='true'></i>
              <span>Explore an idea</span>
              <i className='fa-solid fa-arrow-up-right-from-square suggestionArrow' aria-hidden='true'></i>
            </button>
            <button className='suggestionCard' type='button' onClick={() => setPrompt('Explain a complex topic in simple terms')}>
              <i className='fa-solid fa-wand-magic-sparkles' aria-hidden='true'></i>
              <span>Learn something</span>
              <i className='fa-solid fa-arrow-up-right-from-square suggestionArrow' aria-hidden='true'></i>
            </button>
          </div>
        </section>
      )}
      <div className='chats' ref={chatListRef} aria-live='polite'>
      {
        prevChats?.map((chat,idx)=>
          <div className={chat.role === "user"? "userDiv": "jarvesDiv"} key={idx}>
            {
              chat.role === "user"?
              <p className='userMessage'> {chat.content}</p>:
              <>
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {chat.content}
                </ReactMarkdown>
                <div className='messageActions'>
                  <button
                    className='copyReplyButton'
                    type='button'
                    onClick={() => copyReply(chat.content, idx)}
                    aria-label={copiedIndex === idx ? 'Response copied' : 'Copy response'}
                  >
                    <i className={`fa-solid ${copiedIndex === idx ? 'fa-circle-check' : 'fa-copy'}`} aria-hidden='true'></i>
                    {copiedIndex === idx ? 'Copied' : 'Copy'}
                  </button>
                  {copyErrorIndex === idx && <span className='copyError' role='status'>Could not copy. Please select the text.</span>}
                </div>
              </>
            }
          </div>
        )
      }

      </div>
    </div>
  )
}

export default Chat