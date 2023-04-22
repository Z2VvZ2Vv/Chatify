'use client';

import Link from "next/link";
import {User} from "lucide-react";
import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import {useState, useEffect} from "react";

type FriendRequestsSideBarOptionsProps = {
    sessionId: string,
    initialUnseenRequestCount: number
}

const FriendRequestsSideBarOptions = ({sessionId, initialUnseenRequestCount}: FriendRequestsSideBarOptionsProps) => {
    const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
        initialUnseenRequestCount
    )

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`user:${sessionId}:incoming_friend_requests`)
        )
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const friendRequestHandler = () => {
            setUnseenRequestCount((prev) => prev + 1)
        }

        const addedFriendHandler = () => {
            setUnseenRequestCount((prev) => prev - 1)
        }

        pusherClient.bind('incoming_friend_requests', friendRequestHandler)
        pusherClient.bind('new_friend', addedFriendHandler)

        return () => {
            pusherClient.unsubscribe(
                toPusherKey(`user:${sessionId}:incoming_friend_requests`)
            )
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

            pusherClient.unbind('new_friend', addedFriendHandler)
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
        }
    }, [sessionId])
    return (
        <Link href={'dashboard/requests'} className={'hover:text-[#10A37F] hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold'}>
            <div className="text-gray-400 border-gray-200 group-hover:border-[#10A37F] group:hover:text-[#10A37F] flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                <User className="h-6 w-6" />
            </div>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <p className={'truncate mt-0.5'}>Demandes d'ami</p>
            {unseenRequestCount > 0 ? (
                <div className={"rounded-full w-5 h-5 text-xs flex justify-center items-center bg-[#10A37F] text-white"}>{unseenRequestCount}</div>
            ): null}
        </Link>
    )
}
export default FriendRequestsSideBarOptions