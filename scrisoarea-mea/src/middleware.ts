import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Pass current pathname to layout via header (for client/server sync)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', pathname)

    // Allow access to login pages publicly
    if (pathname === '/admin/login' || pathname === '/partner/login' || pathname === '/login' || pathname === '/partner/register') {
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
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

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
}

export const config = {
    matcher: ['/admin/:path*', '/partner/:path*'],
}
