import { chatLinkBuilder, cn } from '@/lib/utils'
import { toast, type Toast } from 'react-hot-toast'

type UnseenChatProps = {
    sessionId: string,
    senderId: string,
    senderEmail: string,
    senderMessage: string,
    notif: Toast
}

const UnseenChat = ({ sessionId, senderId, senderEmail, senderMessage, notif }: UnseenChatProps) => {
    return (
        <div
            className={cn(
                'max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5',
                { 'animate-enter': notif.visible, 'animate-leave': !notif.visible }
            )}>
            <a
                onClick={() => toast.dismiss(notif.id)}
                href={`/dashboard/chat/${chatLinkBuilder(sessionId, senderId)}`}
                className='flex-1 w-0 p-4'>
                <div className='flex items-start'>
                    <div className='ml-3 flex-1 truncate'>
                        <p className='text-sm font-medium text-gray-900'>{senderEmail}</p>
                        <p className='mt-1 text-sm text-gray-500'>{senderMessage}</p>
                    </div>
                </div>
            </a>

            <div className='flex border-l border-gray-200'>
                <button
                    onClick={() => toast.dismiss(notif.id)}
                    className='w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none'>
                    Fermer
                </button>
            </div>
        </div>
    )
}

export default UnseenChat
