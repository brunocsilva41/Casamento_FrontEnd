import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get the token from cookies or headers
    const token = request.cookies.get('authToken')?.value
    
    // If no token, redirect to login with return URL
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Get user role from cookies (set during login)
    const userRole = request.cookies.get('userRole')?.value
    
    // If user is not admin (role 2), redirect to main page
    if (userRole !== '2') {
      return NextResponse.redirect(new URL('/presentes', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}