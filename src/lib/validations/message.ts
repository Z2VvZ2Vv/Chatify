import {z} from "zod";


export const messageSchema = z.object({
    id: z.string(),
    senderId: z.string(),
    receiverId: z.string(),
    text: z.string().max(600, "Must be less than 600 characters"),
    timestamp: z.number()
})

export const messageArraySchema = z.array(messageSchema)

export type Message = z.infer<typeof messageSchema>