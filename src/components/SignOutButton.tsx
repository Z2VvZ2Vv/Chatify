'use client'

import { Loader2, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { ButtonHTMLAttributes, FC, useState } from 'react'
import { toast } from 'react-hot-toast'
import {Button} from "@/components/ui/Button";

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButtonProps> = ({ ...props }) => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false)
  return (
    <Button
      {...props}
      onClick={() => {
        setIsSigningOut(true)
        try {
            toast.success('Déconnexion réussie')
            setTimeout(async () => {
                await signOut()
            }, 1000);
        } catch (error) {
          toast.error('Un problème est survenu lors de la déconnexion')
        } finally {
          setIsSigningOut(false)
        }
      }}>
      {isSigningOut ? (
        <Loader2 className='animate-spin h-4 w-4' />
      ) : (
        <LogOut className='w-4 h-4' />
      )}
    </Button>
  )
}

export default SignOutButton