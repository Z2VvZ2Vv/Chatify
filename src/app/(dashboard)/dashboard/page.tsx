import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const page = async ({}) => {
	const session = await getServerSession(authOptions);
	if (!session) notFound();

	return (
		<div className='container py-12'></div>
	)
};

export default page;
