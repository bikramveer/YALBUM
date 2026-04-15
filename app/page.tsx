// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { redirect } from 'next/navigation'
 
// // Server Component - no client-side JavaScript needed!
// export default async function Home() {
//   const supabase = createServerComponentClient({ cookies })
  
//   // Check authentication
//   const { data: { session } } = await supabase.auth.getSession()
  
//   if (!session) {
//     redirect('/login')
//   }
 
//   // Check user's albums
//   const { data: memberships } = await supabase
//     .from('album_members')
//     .select('album_id')
//     .eq('user_id', session.user.id)
 
//   // Redirect based on album count
//   if (!memberships || memberships.length === 0) {
//     redirect('/albums')
//   } else if (memberships.length === 1) {
//     redirect(`/album/${memberships[0].album_id}`)
//   } else {
//     redirect('/albums')
//   }
 
//   // This never renders (always redirects)
//   return null
// }

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'
 
// Server Component - no client-side JavaScript needed!
export default async function Home() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return <LandingPage />
  }
 
  // Check user's albums
  const { data: memberships } = await supabase
    .from('album_members')
    .select('album_id')
    .eq('user_id', session.user.id)
 
  // Redirect based on album count
  if (!memberships || memberships.length === 0) {
    redirect('/albums')
  } else if (memberships.length === 1) {
    redirect(`/album/${memberships[0].album_id}`)
  } else {
    redirect('/albums')
  }
 
  // This never renders (always redirects)
  return null
}