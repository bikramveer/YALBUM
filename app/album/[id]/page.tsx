'use client'

import { useAuth } from "@/components/AuthProvider"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Profile, PhotoWithUser, FolderWithCount, AlbumWithDetails} from '@/types/database'
import type { SortOption } from "@/components/PhotoGrid"
import { fetchUserAlbums } from "@/lib/albums"
import { generateSignedUrls } from "@/lib/storage"
import PhotoGrid from "@/components/PhotoGrid"
import PhotoUpload from "@/components/PhotoUpload"
import FolderGrid from "@/components/FolderGrid"
import CreateFolderModal from "@/components/CreateFolderModal"
import Logo from "@/components/Logo"

export default function AlbumPage() {
    const { user, loading, signOut } = useAuth()
    const router = useRouter()
    const hasFetched = useRef(false)
    const params = useParams()
    const albumId = params.id as string

    const [profile, setProfile] = useState<Profile | null>(null)
    const [album, setAlbum] = useState<AlbumWithDetails | null>(null)
    const [photos, setPhotos] = useState<PhotoWithUser[]>([])
    const [folders, setFolders] = useState<FolderWithCount[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [currentFolder, setCurrentFolder] = useState<FolderWithCount | null>(null)
    const [showCreateFolder, setShowCreateFolder] = useState(false)
    const [sortOption, setSortOption] = useState<SortOption>('newest')

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
            return
        }
        if (user && albumId && !hasFetched.current) { 
          fetchAll()
          hasFetched.current = true 
        }
    }, [user, loading, albumId])

    const fetchAll = async () => {
        if (!user) return
        setLoadingData(true)
        await Promise.all([fetchProfile(), fetchAlbum(), fetchFolders(), fetchPhotos()])
        setLoadingData(false)
    }

    const fetchProfile = async () => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) setProfile(data)
    }

    const fetchAlbum = async () => {
        if (!user) return
        const albums = await fetchUserAlbums(user.id)
        const found = albums.find(a => a.id === albumId)
        if (!found) {
            router.push('/albums');
            return
        }
        setAlbum(found)
    }

    const fetchFolders = async () => {
      const { data } = await supabase
        .from('folders')
        .select('*, profile:profiles(*)')
        .eq('album_id', albumId)
        .order('created_at', { ascending: true })
  
      if (data) {
        const foldersWithCount = await Promise.all(
          data.map(async (folder) => {
            const { count } = await supabase
              .from('photos')
              .select('*', { count: 'exact', head: true })
              .eq('folder_id', folder.id)
            return { ...folder, photo_count: count || 0}
          })
        )
        setFolders(foldersWithCount as FolderWithCount[])
      }
    }

    // const fetchPhotos = async () => {
    //   const { data } = await supabase
    //     .from('photos')
    //     .select('*, profile:profiles(*)')
    //     .eq('album_id', albumId)
    //     .order('created_at', { ascending: false })
    //   if (data) setPhotos(data as PhotoWithUser[])
    // }

    const fetchPhotos = async () => {
      const { data } = await supabase
        .from('photos')
        .select('*, profile:profiles(*)')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false })

      if (data) {
        const storagePaths = data.map(photo => photo.storage_path)

        const signedUrls = await generateSignedUrls(storagePaths)

        const photosWithUrls = data.map(photo => ({
          ...photo,
          signed_url: signedUrls[photo.storage_path] || ''
        }))

        setPhotos(photosWithUrls as PhotoWithUser[])
      }
    }

        // Show loading while checking auth
    if (loading || loadingData || !profile || !album) {
      return (
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      )
    }

    // Photos shown depend on current view
    const visiblePhotos = currentFolder
    ? photos.filter(p => p.folder_id === currentFolder.id)
    : photos.filter(p => p.folder_id === null)

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-50">

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

                  {/* Dekstop - single row */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => currentFolder === null ? router.push('/albums') : setCurrentFolder(null)}>
                      <Logo width={32} height={32} />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Y A L B U M</h1>
                            <p className="text-sm text-gray-500">
                                Welcome, {profile.name}!
                                <span className="mx-1.5 text-black">⚬</span>
                                <span className="font-semibold" style={{ color: 'rgb(168 85 247)' }}>{album.name}</span>
                            </p>
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push('/albums')}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-teal-300 text-teal-500 font-semibold hover:bg-teal-50 transition-colors text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                Switch Album
                            </button>
                            <PhotoUpload onUploadComplete={fetchAll} currentFolderId={currentFolder?.id ?? null} albumId={albumId} />
                            <button onClick={signOut} className="p-2 text-gray-500 hover:text-blue-500 transition-colors" title="Sign out">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* ── Mobile: two rows ────────────────────────────────── */}
                    <div className="sm:hidden">
                        {/* Row 1: Logo + title + sign out */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentFolder(null)}>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-sm font-bold text-gray-800 leading-tight">Our Memories</h1>
                                    <p className="text-xs text-gray-500 leading-tight">
                                        Welcome, {profile.name}!
                                        <span className="mx-1 text-gray-300">·</span>
                                        <span className="font-semibold" style={{ color: 'rgb(168 85 247)' }}>{album.name}</span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={signOut} className="p-1.5 text-gray-500 hover:text-blue-500 transition-colors" title="Sign out">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>

                        {/* Row 2: Switch Album + Upload, each taking half the width */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push('/albums')}
                                className="flex items-center justify-center gap-2 flex-1 py-2 rounded-full border-2 border-teal-300 text-teal-500 font-semibold hover:bg-teal-50 transition-colors text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                Switch Album
                            </button>
                            <div className="flex-1">
                                <PhotoUpload onUploadComplete={fetchAll} currentFolderId={currentFolder?.id ?? null} albumId={albumId} />
                            </div>
                        </div>
                    </div>

                  {/* Mobile - double row */}
                  
                </div>
            </header>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Breadcrumb menu */}
                {currentFolder && (
                    <div className='flex items-center gap-2 mb-6 text-sm'>
                        <button
                            onClick={() => setCurrentFolder(null)}
                            className='flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors'
                        >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            All Photos
                        </button>
                        <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                        </svg>
                        <span className='font-semibold text-gray-800'>
                            {currentFolder.name}
                        </span>
                    </div>
                )}

                {/* Home View */}
                {!currentFolder && (
                  <>
                    <div className='mb-10'>
                      <div className='flex items-center justify-between mb-4'>
                        <h2 className='text-xl font-bold text-gray-800'>Folders</h2>
                        <button
                          onClick={() =>setShowCreateFolder(true)}
                          className='flex items-center gap-2 px-4 py-2 text-blue-500 border-2 border-blue-400 rounded-full hover:bg-blue-50 transition-colors font-semibold text-sm'
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          New Folder
                        </button>
                      </div>
        
                      {folders.length === 0 ? (
                        <p className='text-gray-400 text-sm py-4'>
                          No folders yet - create one to organise your memories!
                        </p>
                      ) : (
                        <FolderGrid
                          folders={folders}
                          onFolderClick={setCurrentFolder}
                          onFolderDelete={fetchAll}
                        />
                      )}
                    </div>
        
                    {/* All Photos section */}
                    <div>
                      <h2 className='text-xl font-bold text-gray-800 mb-4'>All Photos</h2>
                      <PhotoGrid
                        photos={visiblePhotos}
                        folders={folders}
                        albumName={album.name}
                        currentFolder={null}
                        loading={false}
                        onRefresh={fetchAll}
                        sortOption={sortOption}
                        onSortChange={setSortOption}
                      />
                    </div>
                  </>
                )}
        
                {/* Folder view */}
                {currentFolder && (
                  <PhotoGrid
                    photos={visiblePhotos}
                    folders={folders}
                    albumName={album.name}
                    currentFolder={currentFolder.name}
                    loading={false}
                    onRefresh={fetchAll}
                    emptyMessage={`No photos in ${currentFolder.name} yet!`}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                  />
                )}
              </div>
        
              <CreateFolderModal
                isOpen={showCreateFolder}
                onClose={() => setShowCreateFolder(false)}
                onFolderCreated={fetchAll}
                albumId={albumId}
              />

        </main>
    )
}