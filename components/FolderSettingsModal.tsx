'use client'

import { use, useState } from "react"
import { FolderWithCount } from "@/types/database"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./AuthProvider"

interface Props {
    folder: FolderWithCount
    isOpen: boolean
    onClose: () => void
    onUpdated: () => void
}

const FOLDER_COLORS = [
  { value: 'linear-gradient(135deg, #f472b6, #ec4899)', label: 'Pink' },
  { value: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', label: 'Blue' },
  { value: 'linear-gradient(135deg, #c084fc, #a855f7)', label: 'Purple' },
  { value: 'linear-gradient(135deg, #34d399, #10b981)', label: 'Green' },
  { value: 'linear-gradient(135deg, #fbbf24, #f59e0b)', label: 'Orange' },
  { value: 'linear-gradient(135deg, #f87171, #ef4444)', label: 'Red' },
]

export default function FolderSettingsModal({ folder, isOpen, onClose, onUpdated }: Props) {
    const { user } = useAuth()
    const [name, setName] = useState(folder.name)
    const [color, setColor] = useState(folder.color)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [tab, setTab] = useState<'settings' | 'delete'>('settings')

    const isOwner = user?.id === folder.user_id

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        setSaving(true)
        setError(null)

        try {
            const { error } = await supabase
                .from('folders')
                .update({
                    name: name.trim(),
                    color
                })
                .eq('id', folder.id)
            
            if (error) throw error
            onUpdated()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        setError(null)

        try {
            // Move all photos back to All Photos
            await supabase
                .from('photos')
                .update({
                    folder_id: null
                })
                .eq('folder_id', folder.id)

            // Delete folder
            const { error } = await supabase
                .from('folders')
                .delete()
                .eq('id', folder.id)

            if (error) throw error
            onUpdated()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Failed to delete folder')
        } finally {
            setDeleting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6" style={{ background: color }}>
                    <h2 className="text-lg font-bold text-white"> Folder Settings</h2>

                    <button
                        onClick={onClose}
                        className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                    >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setTab('settings')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors
                            ${tab === 'settings' 
                                ? 'text-blue-500 border-b-2 border-blue-500'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Edit
                    </button>
                    {isOwner && (
                        <button
                            onClick={() => setTab('delete')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors
                                ${tab === 'delete'
                                    ? 'text-red-500 border-b-2 border-red-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Delete
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {tab === 'settings' && (
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Folder Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="auth-input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Color
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {FOLDER_COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setColor(c.value)}
                                            className="h-10 rounded-xl transition-all hover:scale-105"
                                            style={{
                                                background: c.value,
                                                outline: color === c.value
                                                    ? '3px solid #1a1a1a'
                                                    : '3px solid transparent',
                                                outlineOffset: '2px'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving || !name.trim()}
                                className="auth-button w-full"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    )}

                    {tab === 'delete' && isOwner && (
                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-700 font-medium mb-1">
                                    ⚠️ This will permanently delete this folder 
                                </p>
                                <p className="text-sm text-red-600">
                                    All {folder.photo_count} photos will be moved back to All Photos.
                                </p>
                            </div>

                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50">
                                    {deleting ? 'Deleting...' : `Delete "${folder.name}"`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}