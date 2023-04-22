'use client';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

type ProvidersProps = {
	children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
	return (
		<>
			<Toaster position='top-right' reverseOrder={false} />
			{children}
		</>
	);
};
