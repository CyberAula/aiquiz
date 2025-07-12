import { NextRequest, NextResponse } from "next/server";
import urlJoin from 'url-join';

// Import basePath from next.config.js
const nextConfig = require('./next.config.js');
const basePath = nextConfig.basePath || '';
const port = process.env.PORT_SERVER || 3000;
const host = process.env.HOST_SERVER || 'localhost';

export const config = {
  matcher: ["/dashboard", "/dashboard/:subject", "/reports", "/reports/:subject", "/reports/:subject/pregreport"],
};

export function middleware(req) {
    const headers = new Headers(req.headers);

    const currentEnv = process.env.NODE_ENV;
    const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER;
    const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

    // Check if basic auth credentials are configured
    if (!BASIC_AUTH_USER || !BASIC_AUTH_PASSWORD) {
        console.log("Basic auth credentials not configured, allowing access");
        return NextResponse.next();
    }

    const basicAuth = req.headers.get("authorization");
    const url = req.nextUrl;
    console.log("basicAuth: ", basicAuth);
    
    if (basicAuth) {
        const authValue = basicAuth.split(" ")[1];
        const [user, pwd] = atob(authValue).split(":");

        const validUser = BASIC_AUTH_USER;
        const validPassWord = BASIC_AUTH_PASSWORD;

        if (user === validUser && pwd === validPassWord) {
            console.log("Valido")
            return NextResponse.next();
        }
    }

    const apiAuthPath = urlJoin(basePath, 'api/auth');
    const newUrl = new URL(`http://${host}:${port}${apiAuthPath}`);
    console.log(`Sanitized URL: ${newUrl}`);
    return NextResponse.rewrite(newUrl);

}

