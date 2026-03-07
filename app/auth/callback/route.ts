import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const token_hash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type')
    const code = requestUrl.searchParams.get('code')

    if (token_hash && type) {
        const cookieStore = cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

        // Verify email using token_hash
        await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
        })
    } else if (code) {
        // Fallback for OAuthor other flows that use code
        const cookieStore = cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
        await supabase.auth.exchangeCodeForSession(code)
    }

    // Redirect to login page with success message
    return NextResponse.redirect(new URL('/login?verified=true', requestUrl.origin))
}