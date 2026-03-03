'use client'

import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { supabase } from "@/lib/supabase"

// This page is now just used to dynamically reroute users on login
// 0 Albums -> /albums (join or create)
// 1 Album -> /album/[id] (straight into their album)
// 2+ Albums -> /albums (let user choose)

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/login');
      return
    }

    async function checkAlbums() {
      const { data } = await supabase
        .from('album_members')
        .select('album_id')
        .eq('user_id', user!.id)

      if (!data || data.length === 0) {
        router.push('/albums')
      } else if (data.length === 1) {
        router.push(`/album/${data[0].album_id}`)
      } else {
        router.push('/albums')
      }
    }

    checkAlbums()
  }, [user, loading, router])

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </main>
  )
}