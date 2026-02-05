import { cookies } from "next/headers"
import { NextResponse } from "next/server"

function getLoginUrl(request: Request): string {
    const url = new URL(request.url)
    return new URL("/login", url.origin).toString()
}

export async function GET(request: Request) {
    const cookieStore = await cookies()
    cookieStore.delete("mock_user_email")
    return NextResponse.redirect(getLoginUrl(request))
}

export async function POST(request: Request) {
    return GET(request)
}
