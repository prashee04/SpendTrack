/**
 * Edge-safe Auth.js configuration used by middleware.
 * Database access and credential verification live in src/auth.js.
 */
const authConfig = {
    pages: { signIn: "/login" },
    session: { strategy: "jwt" },
    providers: [],
    callbacks: {
        jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        session({ session, token }) {
            if (session.user) session.user.id = token.id;
            return session;
        },
    },
};

export default authConfig;
