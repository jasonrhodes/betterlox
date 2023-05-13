import { NextMiddleware, NextResponse } from 'next/server'

const middleware: NextMiddleware = (request, event) => {
  const currentEnv = process.env.NODE_ENV;

  // HTTP -> HTTPS prod-only redirect, solution found:
  // https://stackoverflow.com/questions/66458059/  how-do-i-force-or-redirect-my-next-js-website-to-use-https
  if (
    currentEnv === 'production' && 
    request.headers.get("x-forwarded-proto") !== "https"
  ) {
    console.log('[MIDDLEWARE] Redirecting HTTP traffic to HTTPS');
    console.log("[MIDDLEWARE] x-forwarded-proto", request.headers.get("x-forwarded-proto"));
    console.log("[MIDDLEWARE] X-Forwarded-Proto", request.headers.get("X-Forwarded-Proto"));
      return NextResponse.redirect(
        `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
        301
      );
  }

  return NextResponse.next();
}

export default middleware;