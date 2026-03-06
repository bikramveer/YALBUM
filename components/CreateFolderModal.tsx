'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./AuthProvider"
import { blockDemoAction } from "@/lib/demoUser"

interface CreateFolderModalProps {
    isOpen: boolean
    onClose: () => void
    onFolderCreated: () => void
    albumId: string
}

const FOLDER_COLORS = [
    { value: 'linear-gradient(135deg, #f472b6, #ec4899)', label: 'Pink' },
    { value: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', label: 'Blue' },
    { value: 'linear-gradient(135deg, #c084fc, #a855f7)', label: 'Purple' },
    { value: 'linear-gradient(135deg, #34d399, #10b981)', label: 'Green' },
    { value: 'linear-gradient(135deg, #fbbf24, #f59e0b)', label: 'Orange' },
    { value: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', label: 'Violet' },
]

export default function CreateFolderModal({ isOpen, onClose, onFolderCreated, albumId }: CreateFolderModalProps) {
    const { user } = useAuth()
    const [name, setName] = useState('')
    const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].value)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (blockDemoAction(user?.email, 'create folders')) {
            return
        }
        if (!name.trim() || !user) return

        setCreating(true)
        setError(null)

        try {
            const { error } = await supabase
                .from('folders')
                .insert({
                    name: name.trim(),
                    color: selectedColor,
                    user_id: user.id,
                    album_id: albumId,
                })

            if (error) throw (error)

            setName('')
            setSelectedColor(FOLDER_COLORS[0].value)
            onFolderCreated()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Failed to create folder')
        } finally {
            setCreating(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Create New Folder</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleCreate} className="space-y-5">
                    {/* Folder Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Folder Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Winter 2025"
                            className="auth-input"
                            autoFocus
                            required
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Folder Color
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {FOLDER_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setSelectedColor(color.value)}
                                    className="h-14 rounded-xl transition-all hover:scale-105"
                                    style={{
                                        background: color.value,
                                        outline: selectedColor === color.value ? '3px solid #1a1a1a' : '3px solid transparent',
                                        outlineOffset: '2px'
                                    }}
                                    title={color.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Create Button */}
                    <button
                        type="submit"
                        disabled={!name.trim() || creating}
                        className="auth-button w-full"
                    >
                        {creating ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creating...
                            </span>
                        ) : (
                            'Create Folder'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}