/* eslint-disable react/jsx-key */
import { ChatContainer, MainContainer, Message, MessageInput, MessageList, TypingIndicator } from "@chatscope/chat-ui-kit-react";
import styles from '@/styles/Chat.module.css';
import { useState, useEffect, useRef } from "react";
import { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";

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
const DEFAULT_BEHAVIOUR = "General Conversation";

// Openai API key
const CONFIGURATION = new Configuration({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})
// create configuration
const OPENAI_CLIENT = new OpenAIApi(CONFIGURATION);

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
        const newMessage: Message = {
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
        const response = await getResponse(newMessageList);

        const newMessageResponse: Message = {
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
    const getResponse = async (newMessageList: Message[]) => {
        // set system message
        const systemMessage = {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content: behavior,
        }
        // create input
        const input = newMessageList.map((message) => {
            return {
                role: message.sender === CHATGPT_USER ? ChatCompletionRequestMessageRoleEnum.Assistant : ChatCompletionRequestMessageRoleEnum.User,
                content: message.content,
            }
        });
        // test of code
    
        // pass system and input to Openai
        const response = await OPENAI_CLIENT.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [systemMessage, ...input],
        });
        // console the response
        console.log(response.data.choices[0].message?.content);
        // cosole the role
        console.log(response.data.choices[0].message?.role);
        
        // return response
        return {
            content: response.data.choices[0].message?.content,
        }       
    

        await new Promise(f => setTimeout(f, 1000));
        return {
            //mock math response
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
                <input className={styles.behaviorInput} value={behaviorInput} onChange={e => setBehaviorInput(e.target.value)} />
                <button className={styles.behaviorSubmit} onClick={updateBehavior}>Update Behavior</button>
            </div>
            <div className={styles.chatWrapper}>
                <div className={styles.chatContainer}>
                <MainContainer className={styles.chatMessageList}>
                    <ChatContainer>
                    <MessageList className={styles.chatMessageList}
                                typingIndicator={waitingForResponse && <TypingIndicator content="ChatGPT is thinking" style={{ background: '#ffffff' }} />}>
                                {
                                    messages.map((message, index) => {
                                        return (
                                            <Message
                                                key={index}
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
                                style={{ background: '#ffffff' }}
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