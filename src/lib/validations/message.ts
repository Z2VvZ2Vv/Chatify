import {z} from "zod";


export const messageSchema = z.object({
    id: z.string(),
    senderId: z.string(),
    receiverId: z.string(),
    text: z.string().max(600, "Le message doit faire moins de 600 caractères"),
    timestamp: z.number()
})

export const messageArraySchema = z.array(messageSchema)

export type Message = z.infer<typeof messageSchema>