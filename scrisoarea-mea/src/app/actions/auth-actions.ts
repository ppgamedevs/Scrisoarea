"use server"

import { login as libLogin, logout as libLogout } from "@/lib/auth"

// ... (previous imports)
import { registerUser as libRegisterUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function login(email: string, password?: string, portal: 'DONOR' | 'PARTNER' | 'ADMIN' = 'DONOR') {
    return await libLogin(email, password, portal)
}

export async function register(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    // Validate
    if (!email || !password || !firstName || !lastName) {
        return { error: "Vă rugăm să completați toate câmpurile." }
    }
    if (password.length < 6) {
        return { error: "Parola trebuie să aibă minim 6 caractere." }
    }

    try {
        await libRegisterUser({
            email,
            password,
            firstName,
            lastName,
            role: 'DONOR'
        })
    } catch (err: any) {
        return { error: err.message || "A apărut o eroare la înregistrare." }
    }

    redirect('/')
}

export async function logout() {
    return await libLogout()
}
