"use client"

import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL,
    plugins: [
        inferAdditionalFields({
            user: {
                role: { type: "string", required: false },
                firstName: { type: "string", required: false },
                lastName: { type: "string", required: false },
                institutionId: { type: "string", required: false },
            },
        }),
    ],
})

export const { signIn, signUp, signOut, useSession, requestPasswordReset, resetPassword, sendVerificationEmail } =
    authClient
