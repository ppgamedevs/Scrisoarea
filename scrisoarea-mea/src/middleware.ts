import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow access to login pages publicly
    if (pathname === '/admin/login' || pathname === '/partner/login' || pathname === '/login') {
        return NextResponse.next()
    }

    // Check for session cookie (Lucia uses 'auth_session' by default)
    const hasAuth = request.cookies.has('auth_session')

    // Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!hasAuth) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    // Protect Partner Routes
    if (pathname.startsWith('/partner')) {
        if (!hasAuth) {
            return NextResponse.redirect(new URL('/partner/login', request.url))
        }
    }

    // Pass current pathname to layout via header (for client/server sync)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', pathname)

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
}

export const config = {
    matcher: ['/admin/:path*', '/partner/:path*'],
}
