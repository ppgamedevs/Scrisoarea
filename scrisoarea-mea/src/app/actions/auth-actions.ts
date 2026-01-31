"use server"

import { login as libLogin, logout as libLogout } from "@/lib/auth"

export async function login(email: string) {
    return await libLogin(email)
}

export async function logout() {
    return await libLogout()
}
