'use client';

import {useState} from "react";
import {Check, UserPlus, X} from "lucide-react";

type FriendRequestsProps = {
    incomingFriendRequests: IncomingFriendRequest[],
    sessionId: string
}
const FriendRequests = ({sessionId, incomingFriendRequests}: FriendRequestsProps) => {
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests);
    return (
       <>
           {friendRequests.length === 0 ? (
               // eslint-disable-next-line react/no-unescaped-entities
               <p className={'text-sm'}>Aucune demande d'ami</p>
           ): (
               friendRequests.map((request) => (
                   <div key={request.senderId} className={'flex gap-4 items-center'}>
                       <UserPlus className={'text-white'}/>
                       <p className={'font-medium text-lg'}>{request.senderEmail}</p>
                       <button aria-label={"accept friend"} className={'w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md'}>
                           <Check className={'font-semibold text-white w-3/4 h-3/4'} />
                       </button>
                       <button aria-label={"deny friend"} className={'w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'}>
                           <X className={'font-semibold text-white w-3/4 h-3/4'} />
                       </button>
                   </div>
               ))
           )}
       </>
    )
}

export default FriendRequests