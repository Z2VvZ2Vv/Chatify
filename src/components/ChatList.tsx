'use client'

import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {chatHrefConstructor} from "@/lib/utils";

type ChatListProps = {
    friends: User[],
    sessionId: string
}
const ChatList = ({friends, sessionId}: ChatListProps) => {
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

    const rounter = useRouter()
    const pathName = usePathname()

    useEffect(() => {
        if(pathName?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((message) => !pathName.includes(message.senderId))
            })
        }
    },[pathName])

    return (
        <ul role={"list"} className={"max-h[25rem] oveerflow-y-auto -mx-2 space-y-1"}>
            {friends.sort().map((friend) => {
                const unseenMessagesCount = unseenMessages.filter((unseenMessage) => {
                    return unseenMessage.senderId === friend.id}).length
                return (
                    <li key={friend.id}>
                        <a className={"truncate hover:text-indigo-600 hover:bg-gray-50 flex items-center group gap-x-3 rounded-md p-2 text-xs leading-6 font-semibold"} href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}>
                            {friend.email}
                            {unseenMessagesCount > 0 ? (
                                <div className={"bg-indigo-600 font-medium text-white w-4 h-4 text-xs rounded-full justify)center items-center"}>
                                    {unseenMessagesCount}
                                </div>
                            ): null}
                        </a>
                    </li>
                )
            })}
        </ul>
    )
}
export default ChatList