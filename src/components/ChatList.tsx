'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

import { chatLinkBuilder, toPusherKey } from '@/lib/utils'
import { pusherClient } from '@/lib/pusher'

import UnseenChat from "@/components/UnseenChat";
import {fetchRedis} from "@/helpers/redis";

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

        const newFriendHandler = async (newFriend: User) => {
            const friendList = await fetchRedis('smembers', `user:${sessionId}:friends`) as string[]
            const isFriend = friendList.includes(newFriend.id || newFriend.email)
            console.log("Nouvel ami", newFriend)
            setActiveChats((prev) => [...prev, newFriend])
        }

        const chatHandler = (message: MessageType) => {
            const shouldNotify =
                pathname !==
                `/dashboard/chat/${chatLinkBuilder(sessionId, message.senderId)}`

            if (!shouldNotify) return

            // should be notified
            toast.custom((t) => (
                <UnseenChat
                    sessionId={sessionId}
                    senderId={message.senderId}
                    senderEmail={message.senderEmail}
                    senderMessage={message.text}
                    notif={t}
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
        <ul role={"list"} className={"max-h-[25rem] overflow-y-auto space-y-1"}>

            <div className="text-xs mt-12 font-semibold leading-6 text-gray-400">Vos conversations</div>

            {activeChats.length > 0 ?
                (activeChats.sort().map((friend) => {
                    const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
                        return unseenMsg.senderId === friend.id
                    }).length

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
                }))
            : null}
        </ul>
    )
}
export default ChatList