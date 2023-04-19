import { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter';
import { db } from '@/lib/db';
import {fetchRedis} from "@/helpers/redis";

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
			server: {
				host: process.env.EMAIL_SERVER_HOST,
				port: process.env.EMAIL_SERVER_PORT,
				auth: {
					user: process.env.EMAIL_SERVER_USER,
					pass: process.env.EMAIL_SERVER_PASSWORD,
				},
			},
			from: process.env.EMAIL_FROM,
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			const dbUserResult = (await fetchRedis('get', `user:${token.id}`)) as
				| string
				| null

			if (!dbUserResult) {
				if (user) {
					token.id = user!.id
				}

				return token
			}

			const dbUser = JSON.parse(dbUserResult) as User

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
