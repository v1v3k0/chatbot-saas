import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = [
    '/dashboard',
    '/api/loans',
    '/api/repayments',
    '/api/transactions',
    '/api/notifications',
    '/api/users/profile',
    '/api/credit-score',
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // API routes that don't require auth
  const publicApiRoutes = [
    '/api/auth/register',
    '/api/auth/login',
  ]

  const isPublicApiRoute = publicApiRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Check if route requires authentication
  if (isProtectedRoute && !session) {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Redirect to login for non-API routes
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  if (session && req.nextUrl.pathname === '/') {
    // Get user profile to determine role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userProfile?.role === 'borrower') {
      return NextResponse.redirect(new URL('/dashboard/borrower', req.url))
    } else if (userProfile?.role === 'lender') {
      return NextResponse.redirect(new URL('/dashboard/lender', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}