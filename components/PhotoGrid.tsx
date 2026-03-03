'use client';

import { useState, useMemo } from "react";
import { PhotoWithUser, FolderWithCount } from "@/types/database";
import { deletePhoto, getPhotoUrl } from "@/lib/storage";
import { downloadPhotosAsZip, downloadSinglePhoto } from "@/lib/downloadHelpers";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Images } from "lucide-react";
import Image from "next/image";
import PhotoModal from "./PhotoModal";
import MovePhotoModal from "./MovePhotoModal";
import ConfirmModal from "./ConfirmModal";

export type SortOption = 'newest' | 'oldest' | 'user_az' | 'filename_az';

interface PhotoGridProps {
    photos: PhotoWithUser[],
    folders: FolderWithCount[],
    albumName: string,
    currentFolder: string | null,
    loading: boolean,
    onRefresh: () => void,
    emptyMessage?: string
    sortOption: SortOption
    onSortChange: (sort: SortOption) => void
};

const SORT_LABELS: Record<SortOption, string> = {
    newest:         'Newest First',
    oldest:         'Oldest First',
    user_az:        'By User (A-Z)',
    filename_az:    'By Filename (A-Z)',
};

function sortPhotos(photos: PhotoWithUser[], sort: SortOption): PhotoWithUser[] {
    return [...photos].sort((a, b) => {
        switch (sort) {
            case 'newest':      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'oldest':      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'user_az':     return (a.profile?.name || '').localeCompare(b.profile?.name || '');
            case 'filename_az': return (a.file_name.localeCompare(b.file_name));
        };
    })
};

export default function PhotoGrid({ photos, folders, albumName, currentFolder, loading, onRefresh, emptyMessage, sortOption, onSortChange }: PhotoGridProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithUser | null>(null)
    const [selectMode, setSelectMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [showMoveMulti, setShowMoveMulti] = useState(false)
    const [downloadingMulti, setDownloadingMulti] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 })
    const [deletingMulti, setDeletingMulti] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const sortedPhotos = useMemo(() => sortPhotos(photos, sortOption), [photos, sortOption])
    const selectedPhotos = photos.filter(p => selectedIds.has(p.id))
    const allSelected = sortedPhotos.length > 0 && selectedIds.size === sortedPhotos.length

    const toggleSelectMode = () => { setSelectMode(p => !p); setSelectedIds(new Set()) }
    const togglePhoto = (id: string) => setSelectedIds(prev => {
        const n = new Set(prev);
        n.has(id)
        ? n.delete(id)
        : n.add(id);
        return n
    })
    const selectAll = () => setSelectedIds(new Set(sortedPhotos.map(p => p.id)))
    const deselectAll = () => setSelectedIds(new Set())

    const handleBulkDownload = async () => {
        const count = selectedPhotos.length

        // for 1-9 photos
        if (count < 10) {
            setDownloadingMulti(true)
            setDownloadProgress({ current: 0, total: count })

            try {
                for (let i = 0; i < selectedPhotos.length; i++) {
                    const photo = selectedPhotos[i]
                    const folderName = folders.find(f => f.id === photo.folder_id)?.name
                    await downloadSinglePhoto(photo, albumName, folderName)
                    setDownloadProgress({ current: i + 1, total: count})
                    // add small delay between downloads so browser doesn't stop themn
                    await new Promise(resolve => setTimeout(resolve, 300))
                }
            } catch (err) {
                console.error('Download err:', err)
                toast.error('Failed to download some photos')
            } finally {
                toast.success(`Downloaded ${count} ${count === 1? 'photo' : 'photos'}`)
                setDownloadingMulti(false)
                setDownloadProgress({ current: 0, total: 0})
            }
        }

        // for 10+ photos
        else {
            setDownloadingMulti(true)
            setDownloadProgress({ current: 0, total: count })
            try {
                await downloadPhotosAsZip(
                    selectedPhotos,
                    albumName,
                    currentFolder,
                    (current, total) => setDownloadProgress({ current, total })
                )
                toast.success(`Downloaded ${count} photos as ZIP`)
            } catch (err) {
                console.error('Download error:', err)
                toast.error('Failed to download photos')
            } finally {
                setDownloadingMulti(false)
                setDownloadProgress({ current: 0, total: 0 })
            }
        }
    }

    const handleBulkDelete = async () => {
        const n = selectedIds.size
        setDeletingMulti(true)
        try {
            await Promise.all(photos.filter(p => selectedIds.has(p.id)).map(p => deletePhoto(p.storage_path)))
            const { error } = await supabase
                .from('photos')
                .delete()
                .in('id', [...selectedIds])
            
            if (error) throw error
            toast.success(`Deleted ${n} ${n === 1 ? 'photo' : 'photos'}`)

            setSelectedIds(new Set())
            setSelectMode(false)
            setShowDeleteConfirm(false)
            onRefresh()
        } catch (err) {
            console.error('Bulk delete error:', err)
            toast.error('Failed to delete some photos')
        } finally {
            setDeletingMulti(false)
        }
    }

    if (loading) {
        return (
            <div className="
                flex
                items-center
                justify-center
                min-h-[400px]
                "
            >
                <div className="text-center">
                    <div className="
                        animate-spin
                        rounded-full
                        h-12
                        w-12
                        border-b-2
                        border-blue-500
                        mx-auto
                        mb-4
                        "
                    />
                    <p className="text-gray-600">
                        Loading photos...
                    </p>
                </div>
            </div>
        )
    }

    if (photos.length === 0) {
        return (
            <div className="
                flex
                items-center
                justify-center
                min-h-[500px]
                "
            >
                <div className="text-cetner max-w-md">
                    {/* heart icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="
                            w-24
                            h-24
                            rounded-full
                            bg-gradient-to-br
                            from-blue-200
                            to-teal-200
                            flex
                            items-center
                            justify-center
                            "
                        >
                            {/* <svg 
                                className="w-12 h-12 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg> */}
                            <Images className="w-12 h-12 text-blue-500 mx-auto" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex justify-center align-center">
                        {emptyMessage || 'No photos yet!'}
                    </h2>

                    <p className="text-gray-600 mb-6 flex justify-center align-center">
                        Let's start filling in our memories
                    </p>

                    <p className="text-sm text-gray-500 justify-center align-center">
                        Click the<span className="text-blue-500 font-semibold"> Upload </span> button above to add photos!
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div>
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        {/* Sort Icon */}
                        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                        </svg>

                        {/* Sort Dropdown */}
                        <select
                            value={sortOption}
                            onChange={e => onSortChange(e.target.value as SortOption)}
                            className="px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-sm font-medium focus:outline-none focus:border-blue-400 cursor-pointer"
                        >
                            {(Object.keys(SORT_LABELS) as SortOption[]).map(key => (
                                <option key={key} value={key}>
                                    {SORT_LABELS[key]}
                                </option>
                            ))}
                        </select>

                        {/* Select Toggle button */}
                        <button
                            onClick={toggleSelectMode}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                                selectMode
                                ? 'bg-gradient-to-r from-blue-500 to-teal-500 border-transparent text-white'
                                : 'border-gray-300 text-gray-700 bg-white hover:border-blue-400'
                            }`}
                        >
                            {selectMode ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                    {selectedIds.size} Selected
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <rect x='3' y='3' width='18' height='18' rx='2' strokeWidth={2} />
                                    </svg>
                                    Select
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right: Bulk Actions */}
                    {selectMode && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={allSelected ? deselectAll : selectAll}
                                className="px-4 py-2 rounded-full border-2 border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-blue-400 transition-colors"
                            >
                                {allSelected ? 'Deselect All' : 'Select All'}
                            </button>

                            {selectedIds.size > 0 && (
                                <button
                                    onClick={() => setShowMoveMulti(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-blue-400 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                    Move ({selectedIds.size})
                                </button>
                            )}

                            {selectedIds.size > 0 && (
                                <button
                                    onClick={handleBulkDownload}
                                    disabled={downloadingMulti}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-blue-300 bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
                                >
                                    {downloadingMulti ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx='12' cy='12' r='10' stroke="currentColor" strokeWidth='4' fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            {selectedIds.size < 10 ? `${downloadProgress.current}/${downloadProgress.total}` : `Zipping ${downloadProgress.current}/${downloadProgress.total}`}
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            {selectedIds.size < 10 ? `Downlaod (${selectedIds.size})` : `Download Zip (${selectedIds.size})`}
                                        </>
                                    )}
                                </button>
                            )}

                            {selectedIds.size > 0 && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    {deletingMulti ? (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx='12' cy='12' r='10' stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    )}
                                    Delete ({selectedIds.size})
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* <div className="mb-6">
                    <p className="text-gray-600">
                        {photos.length} {photos.length === 1 ? 'memory' : 'memories'} shared
                    </p>
                </div> */}
                {/* Photo Grid */}
                <div className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4
                    gap-4
                    "
                >
                    {sortedPhotos.map((photo) => {
                        const isSelected = selectedIds.has(photo.id)
                        return (
                            <div
                                key={photo.id}
                                className={`photo-card group cursor-pointer transition-all ${
                                    isSelected ? 'ring-4 ring-blue-500 ring-offset-2 rounded-lg' : ''
                                }`}
                                onClick={() => selectMode ? togglePhoto(photo.id) : setSelectedPhoto(photo)}
                            >
                                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                                    <Image
                                        src={photo.signed_url || getPhotoUrl(photo.storage_path)}
                                        alt={photo.file_name}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                    />

                                    {/* Checkbox overlay */}
                                    {selectMode && (
                                        <div className={`absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all shadow-md ${
                                            isSelected
                                                ? 'bg-gradient-to-br from-blue-500 to-teal-500'
                                                : 'bg-white/80 border-2 border-gray-300'
                                        }`}>
                                            {isSelected && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Hover overlay (normal mode) */}
                                {!selectMode && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end p-4">
                                        <div className="text-white">
                                            <p className="font-medium text-sm">{photo.profile?.name || 'Unknown'}</p>
                                            <p className="text-xs opacity-90">{new Date(photo.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )   
                    })}
                </div>
            </div>

            {/* Photo Modal */}
            {selectedPhoto && (
                <PhotoModal
                    photo={selectedPhoto}
                    folders={folders}
                    albumName={albumName}
                    isOpen={!!selectedPhoto}
                    onClose={() => setSelectedPhoto(null)}
                    onPhotoDeleted={() => {
                        setSelectedPhoto(null)
                        onRefresh()
                    }}
                    onPhotoMoved={() => {
                        setSelectedPhoto(null)
                        onRefresh()
                    }}
                />
            )}

            {/* Bulk Move Modal */}
            {showMoveMulti && (
                <MovePhotoModal
                    photos={selectedPhotos}
                    folders={folders}
                    currentFolderId={selectedPhotos[0]?.folder_id ?? null}
                    isOpen={showMoveMulti}
                    onClose={() => setShowMoveMulti(false)}
                    onMoved={() => {
                        setShowMoveMulti(false);
                        setSelectedIds(new Set());
                        setSelectMode(false);
                        onRefresh();
                    }}
                />
            )}

            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleBulkDelete}
                title="Delete Photos?"
                message={`Are you sure you want to delete ${selectedIds.size}
                    ${selectedIds.size === 1 ? 'photo' : 'photos'}? This action cannot be undone.`}
                confirmText="Delete"
                confirmStyle="danger"
                loading={deletingMulti}
            />
        </>
    )
}