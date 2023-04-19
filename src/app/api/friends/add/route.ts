import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { addFriendValidator } from '@/lib/validations/add-friend'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { email: emailToAdd } = addFriendValidator.parse(body.email)

        const idToAdd = (await fetchRedis(
            'get',
            `user:email:${emailToAdd}`
        )) as string

        if (!idToAdd) {
            return new Response("Ce compte n'existe pas", { status: 400 })
        }

        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Non autorisé', { status: 401 })
        }

        if (idToAdd === session.user.id) {
            return new Response('Vous ne pouvez pas vous ajouter vous même', {
                status: 400,
            })
        }

        // check if user is already added
        const isAlreadyAdded = (await fetchRedis(
            'sismember',
            `user:${idToAdd}:incoming_friend_requests`,
            session.user.id
        )) as 0 | 1

        if (isAlreadyAdded) {
            return new Response('Vous avez déjà envoyé une demande à cette personne', { status: 400 })
        }

        // check if user is already added
        const isAlreadyFriends = (await fetchRedis(
            'sismember',
            `user:${session.user.id}:friends`,
            idToAdd
        )) as 0 | 1

        if (isAlreadyFriends) {
            return new Response('Vous avez déjà cette personne en ami', { status: 400 })
        }

        // valid request, send friend request

        await pusherServer.trigger(
            toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
            'incoming_friend_requests',
            {
                senderId: session.user.id,
                senderEmail: session.user.email,
            }
        )

        await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Mauvais corps de requête', { status: 422 })
        }

        return new Response('Mauvaise requête', { status: 400 })
    }
}