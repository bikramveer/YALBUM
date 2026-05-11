// =====================================================
// DATABASE TYPES
// =====================================================
// TypeScript types matching our Supabase database schema
// These help with autocomplete and prevent bugs!
// =====================================================

export interface Profile {
    id: string                      // UUID from auth.users
    email: string
    name: string | null
    avatar_url: string | null
    profile_picture: string | null
    created_at: string              // ISO date string
    updated_at: string              // ISO date string
}

export interface Album {
    id: string
    name: string
    theme_color: string
    created_by: string
    created_at: string
    updated_at: string
}

export interface AlbumMember {
    id: string
    album_id: string
    user_id: string
    role: 'owner' | 'member'
    joined_at: string
}

export interface AlbumInvite {
    id: string
    album_id: string
    code: string
    created_by: string
    expires_at: string
    used_count: number
    created_at: string
}

export interface Folder {
    id: string
    name: string
    color: string
    user_id: string
    album_id: string
    created_at: string
    updated_at: string
}

export interface Photo {
    id: string                      // UUID
    user_id: string                 // references Profile.id
    album_id: string
    folder_id: string | null        // null = in All Photos
    storage_path: string            // path in supabase storage
    compressed_path: string | null
    file_name: string
    file_size: number | null        // bytes
    mime_type: string | null        // jpeg, png, etc...
    created_at: string              // ISO date string
    updated_at: string              // ISO date string
}

export interface Comment {
    id: string                      // UUID
    photo_id: string                // refernces Photo.id
    user_id: string                 // references Profile.id
    parent_id: string | null        // references Comment.id (null if top level comment)
    content: string
    created_at: string              // ISO date string
    updated_at: string              // ISO date string
}

// =====================================================
// EXTENDED TYPES
// =====================================================

export interface AlbumWithDetails extends Album {
    photo_count: number
    member_count: number
    members: Profile[]
    cover_photos: string[]          // up to 4 storage paths for 2x2 cover grid
    user_role: 'owner' | 'member'
}

export interface FolderWithCount extends Folder {
    photo_count: number
    profile: Profile
}

export interface PhotoWithUser extends Photo {
    profile: Profile | null                // User who uploaded the photo
    signed_url?: string
    compressed_signed_url?: string
}

export interface CommentWithUser extends Comment {
    profile: Profile                // User who wrote the comment
    replies?: CommentWithUser[]     // Nested replies
}

export interface PhotoWithDetails extends Photo {
    profile: Profile                // User who uploaded Photo
    comments: CommentWithUser[]     // users who uploaded comments
    comment_count: number
}

// =====================================================
// FORM TYPES
// =====================================================

export interface NewAlbum {
    name: string
    theme_color: string
    created_by: string
}

export interface NewPhoto {
    user_id: string
    album_id: string
    folder_id?: string | null
    storage_path: string
    file_name: string
    file_size?: number
    mime_type?: string
}

export interface NewFolder {
    name: string
    color: string
    user_id: string
    album_id: string
}

export interface NewComment {
    photo_id: string
    user_id: string
    parent_id?: string | null
    content: string
}

// =====================================================
// AUTH TYPES
// =====================================================

export interface SignUpData {
    email: string
    password: string
    name: string
}

export interface SignInData {
    email: string
    password: string
}