/* eslint-disable react/jsx-key */
import { MainContainer, ChatContainer, MessageInput, MessageList, Message } from "@chatscope/chat-ui-kit-react";
import styles from '@/styles/Chat.module.css';
import { useState, useEffect, useRef } from "react";

// Message is being used from Chat UI Kit and declared below which is causing the type error
type Message = {
    content: string;
    sentTime: number;
    sender: string;
    direction: 'incoming' | 'outgoing';
}
// declare ChatGPT
const CHATGPT_USER = "ChatGPT";
// default behaviour
const DEFAULT_BEHAVIOUR = "General Conversaton";


export default function Chat() {
    const messageInput = useRef<HTMLDivElement>(null);    
    const [messages, setMessages] = useState<Message[]>([]);
    const [behaviorInput, setBehaviorInput] = useState(DEFAULT_BEHAVIOUR);
    const [behavior, setBehavior] = useState(DEFAULT_BEHAVIOUR);
    const [waitingForResponse, setWaitingForResponse] = useState(false);

    useEffect(() => {
        if (!waitingForResponse) { 
            messageInput.current?.focus(); // focus on input
        }
    }, [waitingForResponse]);

    const sendMessage = async (innerHtml: string, textContent: string, innerText: string, nodes: NodeList) => {
        const newMessageList = [...messages];     
        const newMessage = {
            content: textContent,
            sentTime: Math.floor(Date.now() / 1000),
            sender: 'You',
            direction: 'outgoing',
        }
        // take input and add it to message list
        newMessageList.push(newMessage);
        setMessages([...newMessageList]);

        //  response
        setWaitingForResponse(true); // set waiting for response (state) to true
        const response = await getResponse();

        const newMessageResponse = {
            content: response.content,
            sentTime: Math.floor(Date.now() / 1000),
            sender: CHATGPT_USER,
            direction: 'incoming',
        }
        // take response and add it to message list
        newMessageList.push(newMessageResponse);
        setMessages([...newMessageList]);
        setWaitingForResponse(false); // set waiting for response (state) to false
    }
    
    // api call - mock math response
    const getResponse = async () => {
        await new Promise(f => setTimeout(f, 1000));
        return {
            content: `${Math.random()}`,
        }
    }

    // update behaviour
    const updateBehavior = () => { 
        const finalBehavior = behaviorInput.trim().length ? behaviorInput.trim() : DEFAULT_BEHAVIOUR;
        setBehavior(finalBehavior);
    }

    return (
        <div className={styles.container}>
            <div className={styles.inputContainer}>
                {/* behaviour */}
                <input className={styles.input} value={behaviorInput} onChange={e => setBehaviorInput(e.target.value)} />
                <button className={styles.submit} onClick={updateBehavior}>Update Behavior</button>
            </div>
            <div className={styles.chatWrapper}>
                <div className={styles.chatContainer}>
                <MainContainer className={styles.chatMessageList}>
                    <ChatContainer>
                        <MessageList >
                        {messages.map((message) => {
                                        return (
                                            <Message
                                                model={{
                                                    message: message.content,
                                                    sentTime: `${message.sentTime}`,
                                                    sender: message.sender,
                                                    direction: message.direction,
                                                    position: 'normal',
                                                    type: 'text',
                                                }}
                                            />
                                        )
                                    })
                                }
                        </MessageList>
                            <MessageInput placeholder="Type message here"
                                onSend={sendMessage}
                                autoFocus={true}
                                attachButton={false}
                                disabled={waitingForResponse}
                                ref={messageInput}
                            />
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    </div>
    )
}