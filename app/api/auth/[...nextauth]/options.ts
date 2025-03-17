import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

/*const users = [
  { id: 1, name: 'J Smith', email: 'helloworld@gmail.com', password: 'password' },
];

export const options: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password", placeholder: "password" },
      },
      async authorize(credentials) {
        const user = users.find(
          (user) => user.email === credentials?.username && user.password === credentials?.password
        );
        return user || null;
      },
    }),
  ],
  pages: {
    signIn: '/signin',
  },
};  */