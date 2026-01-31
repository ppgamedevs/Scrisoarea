import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    // We cannot use getSession which uses prisma in middleware (Edge runtime issues mostly, or just heavy).
    // For MVP Mock Auth with cookies, we can check cookie existence manually.
    // However, `lib/auth` `getSession` uses Prisma, which might fail in Edge.
    // Let's just check for cookie presence for speed in middleware,
    // and let Layouts do the actual data fetching/protection.

    // Actually, simple cookie check:
    const hasAuth = request.cookies.has('mock_user_email')
    const isProtectPath = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/partner')

    if (isProtectPath && !hasAuth) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/partner/:path*'],
}
