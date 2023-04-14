import { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter';
import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
	adapter: UpstashRedisAdapter(db),
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/login',
	},
	providers: [
		EmailProvider({
			server: process.env.EMAIL_SERVER,
			from: process.env.EMAIL_FROM,
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			const dbUser = (await db.get(`user:${token.id}`)) as User | null;

			if (!dbUser) {
				token.id = user!.id;
				return token;
			}

			return {
				id: dbUser.id,
				email: dbUser.email,
			};
		},
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id;
				session.user.email = token.email;
			}

			return session;
		},
		redirect() {
			return '/dashboard';
		},
	},
};
