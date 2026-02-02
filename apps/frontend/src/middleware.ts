import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Simple check for token presence. 
    // For better security, verify token expiration via edge-compatible library (jose) or call backend.
    // Ideally, valid JWT check.

    // Note: localStorage is not available in middleware. 
    // We usually store token in HttpOnly Cookie for middleware access.
    // But our login page stores in localStorage.
    // Setup: If we use localStorage, middleware cannot see it.
    // We must use Client-Side protection (Layout or HOC) OR switch to Cookies.
    // Switching to Cookies is better security.
    // Let's implement Client-Side protection for now as it matches the "localStorage" approach in Login Page.
    // Middleware is useless for localStorage.

    // WAIT. The Implementation Plan said "Auth Guard".
    // If we stick to localStorage, we use a Wrapper Component "AuthGuard".

    return NextResponse.next();
}

// See apps/frontend/src/components/auth-guard.tsx for actual protection if using localStorage.
