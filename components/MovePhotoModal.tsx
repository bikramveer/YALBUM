'use client'

import { useState } from "react"
import { FolderWithCount, PhotoWithUser } from "@/types/database"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface MovePhotoModalProps {
    photos: PhotoWithUser[]
    folders: FolderWithCount[]
    currentFolderId: string | null
    isOpen: boolean
    onClose: () => void
    onMoved: () => void
}

export default function MovePhotoModal({
    photos,
    folders,
    currentFolderId,
    isOpen,
    onClose,
    onMoved,
}: MovePhotoModalProps) {
    const [moving, setMoving] = useState(false)

    const handleMove = async (targetFolderId: string | null) => {
        if (targetFolderId === currentFolderId) {
            onClose()
            return
        }

        setMoving(true)
        try {
            const ids = photos.map(p => p.id)
            const { data, error } = await supabase
                .from('photos')
                .update({ folder_id: targetFolderId })
                .in('id', ids)
                .select()

            if (error) throw error
            if (!data || data.length === 0) throw new Error('Permission denied - you can only move your own photos.')

            const count = photos.length
            toast.success(`Moved ${count} ${count === 1 ? 'photo' : 'photos'} successfully`)
            onMoved()
            onClose()
        } catch (err: any) {
            console.error('Move error:', err)
            toast.error(err.message || 'Failed to move photos')
        } finally {
            setMoving(false)
        }
    }

    if (!isOpen) return null

    const count = photos.length

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-gray-800">
                        Move {count === 1 ? 'Photo' : 'Photos'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                    Choose where to move {count === 1 ? 'this photo' : `these ${count} photos`}:
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {/* All Photos option */}
                    <button
                        onClick={() => handleMove(null)}
                        disabled={moving}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                            currentFolderId === null
                            ? 'bg-blue-50 border-2 border-blue-300'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                    >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">All Photos</p>
                            {/* <p className="text-xs text-gray-500">No folder</p> */}
                        </div>
                        {currentFolderId === null && (
                            <span className="ml-auto text-blue-500 text-xs font-medium">Current</span>
                        )}
                    </button>

                    {/* Folder Options */}
                    {folders.map((folder) => (
                        <button
                            key={folder.id}
                            onClick={() => handleMove(folder.id)}
                            disabled={moving}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                                currentFolderId === folder.id
                                ? 'bg-blue-50 border-2 border-blue-300'
                                : 'hover:bg-gray-50 border-2 border-transparent'
                            }`}
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex-shrink-0"
                                style={{ background: folder.color }}
                            />
                            <div>
                                <p className="font-medium text-gray-800">{folder.name}</p>
                                <p className="text-xs text-gray-500">
                                    {folder.photo_count} {folder.photo_count === 1 ? 'photo' : 'photos'}
                                </p>
                            </div>
                            {currentFolderId === folder.id && (
                                <span className='ml-auto text-blue-500 text-xs font-medium'>Current</span>
                            )}
                        </button>
                    ))}
                </div>

                {moving && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-gray-500">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm">Moving...</span>
                    </div>
                )}
            </div>
        </div>
    )
}