'use client';

import { Button } from '@/components/ui/Button';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Icons } from "@/components/Icons";

const Page = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function login(e: React.FormEvent<HTMLFormElement>) {
		if (!e) {
			throw new Error();
		}
		e.preventDefault();
		setIsLoading(true);
		try {
			const formData = new FormData(e.currentTarget);
			const email = String(formData.get('email'));
			await signIn('email', { email });
		} catch (error) {
			toast.error('Il y a eu un problème avec votre connexion');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className='flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px'>
			<form
				className='flex flex-col items-center w-full max-w-md m-auto mt-56 space-y-8'
				onSubmit={(e) => login(e)}>
				<h1 className='mt-6 text-3xl font-bold tracking-tight text-center'>
					<Icons.Logo className='h-8 w-auto text-indigo-600' />
				</h1>
				<input
					type='text'
					name='email'
					className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
					placeholder='Email'
					required
				/>
				<Button
					isLoading={isLoading}
					type='submit'
					className='w-full max-w-sm mx-auto'>
					Envoyer le magic link
				</Button>
			</form>
		</div>
	);
};

export default Page;
