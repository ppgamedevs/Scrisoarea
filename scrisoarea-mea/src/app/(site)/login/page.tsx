"use client"

import { Suspense } from "react"
import DonorLoginForm from "./login-form"

export default function DonorLoginPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Se încarcă...</div>}>
            <DonorLoginForm />
        </Suspense>
    )
}
