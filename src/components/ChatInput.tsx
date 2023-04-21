'use client'

import TextareaAutosize from "react-textarea-autosize";
import { useRef, useState } from "react";
import axios from "axios";
import {toast} from "react-hot-toast"
import {Send} from "lucide-react";

type ChatInputProps = {
    chatPartner: User,
    ChatID: string
}
const ChatInput = ({ chatPartner, ChatID }: ChatInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const sendMessage = async () => {
        if(!input) return
        if(input.length > 600) return
        setIsLoading(true)
        textareaRef.current?.focus()
        try {
            await axios.post('/api/message/send', { text: input, ChatID: ChatID })
            setInput('')
        } catch (error) {
            toast.error('Une erreur est survenue')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='border-t border-gray-500 px-4 pt-4 sm:mb-0'>
            <div className='relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-[#FFFFFF]/[0.1] focus-within:ring-2'>
                <TextareaAutosize
                    ref={textareaRef}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault()
                            sendMessage()
                        }
                    }}
                    rows={1}
                    maxLength={600}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Vous parlez à ${chatPartner.email}`}
                    className='block w-full resize-none border-0 bg-[#FFFFFF]/[0.1] text-white placeholder:text-gray-300 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6'
                />



                <div className='absolute right-0 bottom-0 pb-2 pr-2 flex justify-between'>
                    <div className='flex-shrin-0'>
                        {!input ? (
                            <Send color={'#6B7280'}/>
                        ): (
                            <Send color={'#16E067'} onClick={() => sendMessage()} /> )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ChatInput