"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

// MOCK AUTH for MVP without Supabase complexity yet.
// In real app, we check cookie 'auth_token' and verify JWT.
// Here we just use a cookie 'mock_user_email'.

export type UserSession = {
    id: string
    email: string
    role: 'ADMIN' | 'PARTNER' | 'DONOR'
    institutionId?: string
}

export async function getSession(): Promise<UserSession | null> {
    const cookieStore = await cookies()
    const email = cookieStore.get('mock_user_email')?.value

    if (!email) return null

    const user = await prisma.profile.findUnique({
        where: { email },
        include: { institution: true }
    })

    if (!user) return null

    return {
        id: user.id,
        email: user.email,
        role: user.role as any,
        institutionId: user.institutionId || undefined
    }
}

export async function login(email: string) {
    // Determine Role based on email suffix or DB lookup
    // Very insecure, MVP only
    const user = await prisma.profile.findUnique({ where: { email } })
    if (!user) throw new Error("User nu exista. (Ruleaza seed)")

    const cookieStore = await cookies()
    cookieStore.set('mock_user_email', email)
    return user.role
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('mock_user_email')
}
