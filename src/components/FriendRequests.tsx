'use client';

import {useState, useEffect} from "react";
import {Check, UserPlus, X} from "lucide-react";
import { toPusherKey } from '@/lib/utils'
import { pusherClient } from '@/lib/pusher'
import axios from "axios";
import {useRouter} from "next/navigation";

type FriendRequestsProps = {
    incomingFriendRequests: IncomingFriendRequest[],
    sessionId: string
}
const FriendRequests = ({sessionId, incomingFriendRequests}: FriendRequestsProps) => {
    const router = useRouter()
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
        incomingFriendRequests
    )

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`user:${sessionId}:incoming_friend_requests`)
        )
        console.log("listening to ", `user:${sessionId}:incoming_friend_requests`)

        const friendRequestHandler = ({
                                          senderId,
                                          senderEmail,
                                      }: IncomingFriendRequest) => {
            console.log("function got called")
            setFriendRequests((prev) => [...prev, { senderId, senderEmail }])
        }

        pusherClient.bind('incoming_friend_requests', friendRequestHandler)

        return () => {
            pusherClient.unsubscribe(
                toPusherKey(`user:${sessionId}:incoming_friend_requests`)
            )
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
        }
    }, [sessionId])

    const acceptFriend = async (senderId: string) => {
        await axios.post('/api/friends/accept', { id: senderId })

        setFriendRequests((prev) =>
            prev.filter((request) => request.senderId !== senderId)
        )

        router.refresh()
    }

    const denyFriend = async (senderId: string) => {
        await axios.post('/api/friends/deny', { id: senderId })

        setFriendRequests((prev) =>
            prev.filter((request) => request.senderId !== senderId)
        )

        router.refresh()
    }


    return (

       <>
           {friendRequests.length === 0 ? (
               // eslint-disable-next-line react/no-unescaped-entities
               <p className={'text-sm'}>Aucune demande d'ami</p>
           ): (
               friendRequests.map((request) => (
                   <div key={request.senderId} className={'flex gap-4 items-center'}
                        onClick={() => acceptFriend(request.senderId)}>
                       <UserPlus className={'text-white'}/>
                       <p className={'font-medium text-lg'}>{request.senderEmail}</p>
                       <button aria-label={"accept friend"} className={'w-8 h-8 bg-[#10A37F] hover:bg-[#16bd93] grid place-items-center rounded-full transition hover:shadow-md'}>
                           <Check className={'font-semibold text-white w-3/4 h-3/4'} />
                       </button>
                       <button aria-label={"deny friend"} className={'w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'}
                               onClick={() => denyFriend(request.senderId)}>
                           <X className={'font-semibold text-white w-3/4 h-3/4'} />
                       </button>
                   </div>
               ))
           )}
       </>
    )
}

export default FriendRequests