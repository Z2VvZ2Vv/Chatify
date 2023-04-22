'use client'

import { addFriendValidator } from '@/lib/validations/add-friend'
import axios, { AxiosError } from 'axios'
import { FC, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {Button} from "@/components/ui/Button";
import {useForm} from "react-hook-form";

interface AddFriendButtonProps {}

type FormData = z.infer<typeof addFriendValidator>

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
    const [showSuccessState, setShowSuccessState] = useState<boolean>(false)

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(addFriendValidator),
    })

    const addFriend = async (email: string) => {
        try {
            const validatedEmail = addFriendValidator.parse({ email })

            await axios.post('/api/friends/add', {
                email: validatedEmail,
            })

            setShowSuccessState(true)
        } catch (error) {
            if (error instanceof z.ZodError) {
                setError('email', { message: error.message })
                return
            }

            if (error instanceof AxiosError) {
                setError('email', { message: error.response?.data })
                return
            }

            setError('email', { message: 'Une erreur est survenue' })
        }
    }

    const onSubmit = (data: FormData) => {
        addFriend(data.email)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='w-96 m-auto'>
            <label
                htmlFor='email'
                className='block text-sm font-medium leading-6'>
                Ajouter un ami avec son e-mail
            </label>

            <div className='mt-2 flex flex-col gap-4'>
                <input
                    {...register('email')}
                    type='text'
                    className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#10A37F] sm:text-sm sm:leading-6'
                    placeholder='toi@example.com'
                />
                <Button>Ajouter</Button>
            </div>
            <p className='mt-1 text-sm text-red-600'>{errors.email?.message}</p>
            {showSuccessState ? (
                // eslint-disable-next-line react/no-unescaped-entities
                <p className='mt-1 text-sm text-green-600'>Demande d'ami envoyée</p>
            ) : null}
        </form>
    )
}

export default AddFriendButton