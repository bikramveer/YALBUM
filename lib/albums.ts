import { supabase } from "./supabase";
import { AlbumWithDetails } from "@/types/database";
import { generateSignedUrls } from "./storage";

// fetch all albums the current user belongs to
export async function fetchUserAlbums(userId: string): Promise<AlbumWithDetails[]> {
    const { data: memberships } = await supabase
        .from('album_members')
        .select('album_id, role')
        .eq('user_id', userId)

    if (!memberships || memberships.length === 0) return []

    const albumIds = memberships.map(m => m.album_id)

    const { data: albums } = await supabase
        .from('albums')
        .select('*')
        .in('id', albumIds)
        .order('created_at', { ascending: true })

    if (!albums) return []

    // for each album, get members, photo count, and cover photos
    const albumsWithDetails = await Promise.all(
        albums.map(async (album) => {
            const membership = memberships.find(m => m.album_id === album.id)

            // Get members with profiles
            const { data: memberRows } = await supabase
                .from('album_members')
                .select('user_id, role')
                .eq('album_id',album.id)

            let members: any[] = []
            if (memberRows && memberRows.length > 0) {
                const userIds = memberRows.map(m => m.user_id)
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', userIds)
                members = profiles || []
            }

            // Get photo count
            const { count } = await supabase
                .from('photos')
                .select('*', { count: 'exact', head: true })
                .eq('album_id', album.id)

            // Get up to 4 cover photos
            const { data: coverPhotos } = await supabase
                .from('photos')
                .select('storage_path, compressed_path')
                .eq('album_id', album.id)
                .order('created_at', { ascending: false })
                .limit(4)

            const displayPaths = coverPhotos?.map(p => p.compressed_path ?? p.storage_path) || []
            const signedUrls = displayPaths.length > 0
                ? await generateSignedUrls(displayPaths)
                : {}

            const coverPhotosWithUrls = displayPaths.map(path => signedUrls[path] || '')

            return {
                ...album,
                photo_count: count || 0,
                member_count: members.length,
                members,
                cover_photos: coverPhotosWithUrls,
                user_role: membership?.role as 'owner' | 'member',
            } as AlbumWithDetails
        })
    )
    
    return albumsWithDetails;
}

// Generate a new invite code for an album
export async function createInviteCode(albumId: string, userId: string): Promise<string | null> {
    // Generate code using Postgres function
    const { data: codeData } = await supabase
        .rpc('generate_invite_code')

    if (!codeData) return null

    const { error } = await supabase
        .from('album_invites')
        .insert({
            album_id: albumId,
            code: codeData,
            created_by: userId,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })

    if (error) {
        console.error('Create invite error:', error)
        return null
    }

    return codeData
}

// Join an album using an invite code
export async function joinAlbumWithCode(
    code: string,
    userId: string
): Promise<{ success: boolean; albumId?: string; error?: string}> {
    const { data: invite } = await supabase
        .from('album_invites')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .maybeSingle()

    if (!invite) return { success: false, error: 'Invalid invite code.' }

    if (new Date(invite.expires_at) < new Date()) {
        return { success: false, error: 'This invite code has expired.' }
    }

    // Check if already a member
    const { data: existing } = await supabase
        .from('album_members')
        .select('id')
        .eq('album_id', invite.album_id)
        .eq('user_id', userId)
        .maybeSingle()

    if (existing) {
        return { success: true, albumId: invite.album_id } // alredy in, don't have to error out, just navigate
    }

    // Add as member
    const { error } = await supabase
        .from('album_members')
        .insert({
            album_id: invite.album_id,
            user_id: userId,
            role: 'member'
        })

    if (error) return { success: false, error: 'Failed to join album.' }

    await supabase
        .from('album_invites')
        .update({ used_count: invite.used_count + 1 })
        .eq('id', invite.id)
    
    return { success: true, albumId: invite.album_id }
}