import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('returnUrl') ?? '/dashboard'
  
  // Use configured URL instead of parsed origin to avoid 0.0.0.0 issues in self-hosted environments
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('❌ Auth callback error:', error, errorDescription)
    return NextResponse.redirect(`${baseUrl}/auth?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    console.error('❌ Unexpected error in auth callback:', error)
    return NextResponse.redirect(`${baseUrl}/auth?error=unexpected_error`)
  }
  return NextResponse.redirect(`${baseUrl}/auth`)
}
