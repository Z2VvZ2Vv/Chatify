'use client';

import Link from "next/link";
import {User} from "lucide-react";
import {useState} from "react";

type FriendRequestsSideBarOptionsProps = {
    sessionId: string,
    initialUnseenRequestCount: number
}

const FriendRequestsSideBarOptions = ({sessionId, initialUnseenRequestCount}: FriendRequestsSideBarOptionsProps) => {
    const [unseenRequestCount, setUnseenRequestCount] = useState<number>(initialUnseenRequestCount);
    return (
        <Link href={'dashboard/requests'} className={'hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold'}>
            <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group:hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                <User className="h-5 w-5" />
            </div>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <p className={'truncate'}>Demandes d'ami</p>
            {unseenRequestCount > 0 ? (
                <div className={"rounded-full w-5 h-5 text-xs flex justify-center items-center bg-indigo-600 text-white"}>{unseenRequestCount}</div>
            ): null}
        </Link>
    )
}
export default FriendRequestsSideBarOptions