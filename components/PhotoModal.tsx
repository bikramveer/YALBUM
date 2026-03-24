'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { PhotoWithUser, CommentWithUser, FolderWithCount } from '@/types/database'
import { getPhotoUrl, deletePhoto } from '@/lib/storage'
import { downloadSinglePhoto } from '@/lib/downloadHelpers'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from './AuthProvider'
import CommentSection from './CommentSection'
import MovePhotoModal from './MovePhotoModal'
import ConfirmModal from './ConfirmModal'

interface PhotoModalProps {
  photo: PhotoWithUser
  folders: FolderWithCount[]
  albumName: string
  isOpen: boolean
  onClose: () => void
  onPhotoDeleted: () => void
  onPhotoMoved: () => void
}

export default function PhotoModal({ photo, folders, albumName, isOpen, onClose, onPhotoDeleted, onPhotoMoved}: PhotoModalProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const photoRef = useRef<HTMLDivElement>(null)
  const [photoHeight, setPhotoHeight] = useState<number | null>(null)

  // Sync sidebar height to photo height on desktop
  useEffect(() => {
    if (!isOpen || !photoRef.current) return
    const observer = new ResizeObserver(entries => {
      const height = entries[0]?.contentRect.height
      if (height) setPhotoHeight(height)
    })
    observer.observe(photoRef.current)
    return () => observer.disconnect()
  }, [isOpen])

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && photo) {
      fetchComments()
    }
  }, [isOpen, photo])

  const fetchComments = async () => {
    setLoadingComments(true)
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('photo_id', photo.id)
      .is('parent_id', null) // Only get top-level comments
      .order('created_at', { ascending: true })

    if (data) {
      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select(`
              *,
              profile:profiles(*)
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true })

          return {
            ...comment,
            replies: replies || []
          } as CommentWithUser
        })
      )

      setComments(commentsWithReplies)
    }
    setLoadingComments(false)
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const folderName = folders.find(f => f.id === photo.folder_id)?.name
      await downloadSinglePhoto(photo, albumName, folderName)
      toast.success('Photo downloaded successfully')
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Failed to download image')
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!user || user.id !== photo.user_id) return

    setDownloading(true)
    try {
      await deletePhoto(photo.storage_path)

      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id)

      if (error) throw error

      toast.success('Photo deleted successfully')
      onPhotoDeleted()
      onClose()
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete photo')
    } finally {
      setDeleting(false)
    }
  }

  // Close on escape key + lock body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // save scroll position then lock - prevents page jumping on close
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position ='fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      // Restore scroll position exactly where user was
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay - clicking anywehre here closes modal */}
      <div className='modal-overlay overflow-hidden' onClick={onClose}>
        {/* Inner wrapper */}
        <div onClick={(e) => e.stopPropagation()}
          className='flex flex-col md:flex-row md:items-start rounded-xl overflow-hidden shadow-2xl w-full md:w-auto md:max-w-[90vw] max-h-[90vh]'>
          {/* Photo — natural size, transparent bg, ref for height measurement */}
          <div
            ref={photoRef}
            className='relative flex items-center justify-center bg-transparent overflow-hidden md:max-w-[65vw] flex-shrink-0'>
            <img
              src={photo.signed_url || getPhotoUrl(photo.storage_path)}
              alt={photo.file_name}
              className='block w-full md:w-auto md:h-auto md:max-h-[90vh] md:max-w-[55vw] max-h-[45vh] object-contain rounded-l-xl'
            />
          </div>

          {/* Sidebar — height locked to photo height on desktop via JS */}
          <div
            className='w-full md:w-[380px] md:flex-shrink-0 bg-white flex flex-col overflow-hidden min-h-0 max-h-[45vh] md:max-h-none'
            style={{
              // On desktop: exactly match photo height so comments never overflow it
              // On mobile: ignored, max-h-[45vh] handles it
              height: typeof window !== 'undefined' && window.innerWidth >= 768 && photoHeight
                ? `${photoHeight}px`
                : undefined
            }}
          >
            {/* Header */}
            <div className='p-4 border-b border-gray-200 flex-shrink-0'>
              {/* User info row */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold'>
                    {photo.profile?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className='font-semibold text-gray-800'>
                      {photo.profile?.name || 'Unknown'}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {new Date(photo.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Close button only */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Action buttons row */}
              <div className='flex items-center gap-2'>
                {/* Download */}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className='flex items-center justify-center gap-2 flex-1 py-2.5 text-blue-600 hover:bg-blue-50 border-2 bg-white border-blue-300 rounded-lg transition-colors disabled:opacity-50 font-medium text-sm'
                  title='Download photo'
                >
                  {downloading ? (
                    <>
                      <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                      </svg>
                    </>
                  ) : (
                    <>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                      </svg>
                      Download
                    </>
                  )}
                </button>

                {/* Move */}
                {user && user.id === photo.user_id && (
                  <button
                    onClick={() => setShowMoveModal(true)}
                    className='flex items-center justify-center gap-2 flex-1 py-2.5 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors font-medium text-sm'
                    title='Move photo'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Move
                  </button>
                )}

                {/* Delete (only for photo owner) */}
                {user && user.id === photo.user_id && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleting}
                    className='flex items-center justify-center gap-2 flex-1 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 font-medium text-sm'
                    title='Delete photo'
                  >
                    {deleting ? (
                      <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                      </svg>
                    ) : (
                      <>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className='flex-1 overflow-hidden min-h-0 flex flex-col'>
              <CommentSection
                photoId={photo.id}
                comments={comments}
                loading={loadingComments}
                onCommentAdded={fetchComments}
              />
            </div>
          </div>
        </div>

        {/* Move Photo Modal */}
        {showMoveModal && (
          <MovePhotoModal
            photos={[photo]}
            folders={folders}
            currentFolderId={photo.folder_id}
            isOpen={showMoveModal}
            onClose={() => setShowMoveModal(false)}
            onMoved={() => {
              setShowMoveModal(false)
              onPhotoMoved()
              onClose()
            }}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title='Delete Photo?'
        message='This photo will be permanently deleted. This action cannot be undone.'
        confirmText='Delete'
        confirmStyle='danger'
        loading={deleting}
      />
    </>
  )
}