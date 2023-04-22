'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { chatLinkBuilder, toPusherKey } from '@/lib/utils'
import { pusherClient } from '@/lib/pusher'

import UnseenChat from "@/components/UnseenChat";

type ChatListProps = {
    friends: User[],
    sessionId: string
}

type MessageType = {
    senderEmail: string
} & Message
const ChatList = ({friends, sessionId}: ChatListProps) => {
    const router = useRouter()
    const pathname = usePathname()
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
    const [activeChats, setActiveChats] = useState<User[]>(friends)

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const newFriendHandler = (newFriend: User) => {
            console.log("Nouvel ami", newFriend)
            setActiveChats((prev) => [...prev, newFriend])
        }

        const chatHandler = (message: MessageType) => {
            const shouldNotify =
                pathname !==
                `/dashboard/chat/${chatLinkBuilder(sessionId, message.senderId)}`

            if (!shouldNotify) return

            // should be notified
            toast.custom((toast) => (
                <UnseenChat
                    sessionId={sessionId}
                    senderId={message.senderId}
                    senderEmail={message.senderEmail}
                    senderMessage={message.text}
                     notif={toast}
                />
            ))

            setUnseenMessages((prev) => [...prev, message])
        }

        pusherClient.bind('new_message', chatHandler)
        pusherClient.bind('new_friend', newFriendHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

            pusherClient.unbind('new_message', chatHandler)
            pusherClient.unbind('new_friend', newFriendHandler)
        }
    }, [pathname, sessionId, router])

    useEffect(() => {
        if (pathname?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId))
            })
        }
    }, [pathname])

    return (
        <ul role={"list"} className={"max-h[25rem] oveerflow-y-auto -mx-2 space-y-1"}>
            {friends.sort().map((friend) => {
                const unseenMessagesCount = unseenMessages.filter((unseenMessage) => {
                    return unseenMessage.senderId === friend.id}).length
                return (
                    <li key={friend.id}>
                        <a className={"truncate hover:text-[#10A37F] hover:bg-gray-50 flex items-center group gap-x-3 rounded-md p-2 text-xs leading-6 font-semibold"} href={`/dashboard/chat/${chatLinkBuilder(sessionId, friend.id)}`}>
                            {friend.email}
                            {unseenMessagesCount > 0 ? (
                                <div className={"rounded-full w-5 h-5 text-xs flex justify-center items-center bg-[#10A37F] text-white"}>{unseenMessagesCount}</div>
                            ): null}
                        </a>
                    </li>
                )
            })}
        </ul>
    )
}
export default ChatList