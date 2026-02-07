"use server"

import { login as libLogin, logout as libLogout } from "@/lib/auth"

export async function login(email: string, password?: string, portal: 'DONOR' | 'PARTNER' | 'ADMIN' = 'DONOR') {
    return await libLogin(email, password, portal)
}

export async function logout() {
    return await libLogout()
}
