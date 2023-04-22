import { toPusherKey } from '@/lib/utils'
import { pusherServer } from '@/lib/pusher'
import { fetchRedis } from '@/helpers/redis'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

import { getServerSession } from 'next-auth'
import { z } from 'zod'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { id: userToAdd } = z.object({ id: z.string() }).parse(body)

        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        // verify both users are not already friends
        const isAlreadyFriends = await fetchRedis(
            'sismember',
            `user:${session.user.id}:friends`,
            userToAdd
        )

        if (isAlreadyFriends) {
            return new Response('Vous êtes déjà ami avec cette personne', { status: 400 })
        }

        const hasFriendRequest = await fetchRedis(
            'sismember',
            `user:${session.user.id}:incoming_friend_requests`,
            userToAdd
        )

        if (!hasFriendRequest) {
            return new Response("Vous n'avez aucune demande d'ami", { status: 400 })
        }

        const [userRaw, friendRaw] = (await Promise.all([
            fetchRedis('get', `user:${session.user.id}`),
            fetchRedis('get', `user:${userToAdd}`),
        ])) as [string, string]

        const user = JSON.parse(userRaw) as User
        const friend = JSON.parse(friendRaw) as User

        await Promise.all([
            pusherServer.trigger(
                toPusherKey(`user:${userToAdd}:friends`),
                'new_friend',
                user
            ),
            pusherServer.trigger(
                toPusherKey(`user:${session.user.id}:friends`),
                'new_friend',
                friend
            ),
            db.sadd(`user:${session.user.id}:friends`, userToAdd),
            db.sadd(`user:${userToAdd}:friends`, session.user.id),
            db.srem(`user:${session.user.id}:incoming_friend_requests`, userToAdd),
        ])

        return new Response('OK')
    } catch (error) {
        console.log(error)
        if (error instanceof z.ZodError) {
            return new Response('Mauvais crops de requête', { status: 422 })
        }

        return new Response('Mauvaise requête', { status: 400 })
    }
}