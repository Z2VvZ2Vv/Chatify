import {addFriendValidator} from "@/lib/validations/add-friend";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {fetchRedis} from "@/helpers/redis";
import {db} from "@/lib/db";
import {z} from "zod"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { email: emailToAdd } = addFriendValidator.parse(body.email)

        const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as string

        const session = await getServerSession(authOptions)

        if(!session) return new Response('Non autorisé', { status: 401 })

        /* On vérifie si l'user existe */

        if(!idToAdd) return new Response("Cette personne n'existe pas", { status: 400 })

        /* On vérifie si l'user ne s'ajoute pas lui même */

        if(idToAdd === session.user.id) return new Response("Vous ne pouvez pas vous ajouter vous même", { status: 400 })

        const isAlreadyAdded = (await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, session.user.id)) as 0 | 1

        /* On vérifie si l'user n'a pas déjà envoyé une demande */

        if(isAlreadyAdded) return new Response("Vous avez déjà envoyé une demande d'ami à cette personne", { status: 400 })

        const isAlreadyFriends = (await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)) as 0 | 1

        /* On vérifie si l'user n'est pas déjà ami avec la personne */

        if(isAlreadyFriends) return new Response("Vous êtes déjà ami avec cette personne", { status: 400 })

        /* On envoie la demande d'ami */

        await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('OK')
    } catch (error) {
        if(error instanceof z.ZodError) return new Response('Mauvais corps de requête', { status: 422 })

        return new Response('Mauvaise requête', { status: 400 })
    }
}