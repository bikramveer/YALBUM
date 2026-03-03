'use client'

import { useState, useEffect } from "react"
import { AlbumWithDetails } from "@/types/database"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./AuthProvider"
import { createInviteCode } from "@/lib/albums"

interface Props {
    album: AlbumWithDetails
    isOpen: boolean
    onClose: () => void
    onUpdated: () => void
    onDeleted: () => void
    onLeft: () => void
}

const THEME_COLORS = [
  { value: 'linear-gradient(135deg, #f472b6, #ec4899)', label: 'Pink' },
  { value: 'linear-gradient(135deg, #38bdf8, #6366f1)', label: 'Blue' },
  { value: 'linear-gradient(135deg, #34d399, #10b981)', label: 'Green' },
  { value: 'linear-gradient(135deg, #fbbf24, #f59e0b)', label: 'Orange' },
  { value: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', label: 'Purple' },
  { value: 'linear-gradient(135deg, #f87171, #ef4444)', label: 'Red' },
]

type Tab = 'settings' | 'invite' | 'members' | 'danger'

export default function AlbumSettingsModal({ album, isOpen, onClose, onUpdated, onDeleted, onLeft }: Props) {
    const { user } = useAuth()
    const isOwner = album.user_role === 'owner'

    const [tab, setTab] = useState<Tab>('settings')
    const [name, setName] = useState(album.name)
    const [themeColor, setThemeColor] = useState(album.theme_color)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // invite code state
    const [inviteCode, setInviteCode] =useState<string | null>(null)
    const [generatingCode, setGeneratingCode] = useState(false)
    const [codeCopied, setCodeCopied] = useState(false)

    // Delete state
    const [deleteConfirm, setDeleteConfirm] = useState('')
    const [deleting, setDeleting] = useState(false)
    const [leaving, setLeaving] = useState(false)

    // load existing invite code on open
    useEffect(() => {
        if (isOpen) {
            loadExistingCode()
            setName(album.name)
            setThemeColor(album.theme_color)
            setTab('settings')
        }
    }, [isOpen])

    const loadExistingCode = async () => {
        const { data } = await supabase
            .from('album_invites')
            .select('code, expires_at')
            .eq('album_id', album.id)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
        
        if (data) setInviteCode(data.code)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        setSaving(true)
        setError(null)

        try{
            const { error } = await supabase
                .from('albums')
                .update({
                    name: name.trim(),
                    theme_color: themeColor,
                })
                .eq('id', album.id)
            
            if (error) throw error

            toast.success('Album settings saved')
            onUpdated()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Failed to save changes')
            toast.error('Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    const handleGenerateCode = async () => {
        if (!user) return
        setGeneratingCode(true)
        const code = await createInviteCode(album.id, user.id)
        if (code) setInviteCode(code)
        setGeneratingCode(false)
    }

    const handleCopyCode = async () => {
        if (!inviteCode) return
        await navigator.clipboard.writeText(inviteCode)
        setCodeCopied(true)
        toast.success('Invite code copied to clipboard')
        setTimeout(() => setCodeCopied(false), 2000)
    }

    const handleLeave = async () => {
        if (!user) return
        setLeaving(true)

        try {
            const { error } = await supabase
                .from('album_members')
                .delete()
                .eq('album_id', album.id)
                .eq('user_id', user.id)

            if (error) throw error
            toast.success(`You left the album ${album.name}`)
            onLeft()
        } catch (err: any) {
            setError(err.message || 'Failed to leave album')
            toast.error('Failed to leave album')
        } finally {
            setLeaving(false)
        }
    }

    const handleDelete = async () => {
        if (deleteConfirm !== album.name) return
        setDeleting(true)
        setError(null)

        try {
            // First delete all photos from storage paths
            const { data: photos } = await supabase
                .from('photos')
                .select('storage_path')
                .eq('album_id', album.id)

            if (photos && photos.length > 0) {
                await supabase
                    .storage
                    .from('photos')
                    .remove(photos.map(p => p.storage_path))
            }

            // Delete the album (cascades to photos, folders, members, invites)
            const { error } =  await supabase
                .from('albums')
                .delete()
                .eq('id', album.id)

            if (error) throw error

            toast.success('Album deleted successfully')
            onDeleted()
        } catch (err: any) {
            setError(err.message || 'Failed to delete album')
            toast.error('Failed to delete album')
        } finally {
            setDeleting(false)
        }
    }

    if (!isOpen) return null

    const TABS: { id: Tab; label: string }[] = [
        { id: 'settings', label: 'Edit' },
        { id: 'invite',   label: 'Invite' },
        { id: 'members',  label: 'Members' },
        { id: 'danger',   label: isOwner ? 'Delete' : 'Leave' },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="h-24 flex items-center justify-between px-6" style={{ background: themeColor }}>
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            Album Settings
                        </h2>
                        <p className="text-white/70 text-sm">{album.name}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 py-3 text-xs font-semibold transition-colors
                                    ${tab === t.id
                                            ? t.id === 'danger'
                                                ? 'text-red-500 border-b-2 border-red-500'
                                                : 'text-blue-500 border-b-2 border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700' 
                                    }
                                `}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

                    {/* Edit Tab */}
                    {tab === 'settings' && (
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Album Name
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
                                    Theme Color
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {THEME_COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setThemeColor(c.value)}
                                            className="h-10 rounded-xl transition-all hover:scale-105"
                                            style={{
                                                background: c.value,
                                                outlineOffset: '2px',
                                                outline: themeColor === c.value
                                                    ? '3px solid #1a1a1a'
                                                    : '3px solid transparent'
                                                
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            {isOwner && (
                                <button
                                    type="submit"
                                    disabled={saving || !name.trim()}
                                    className="auth-button w-full"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            )}
                            {!isOwner && (
                                <p className="text-sm text-gray-400 text-center">
                                    Only the album owner can edit settings
                                </p>
                            )}
                        </form>
                    )}

                    {/* Invite Tab */}
                    {tab === 'invite' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Share this code with someone to invite them to <strong>{album.name}</strong>. Codes expire after 7 days.
                            </p>

                            {inviteCode ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 text-center font-mono text-2xl font-bold tracking-widest text-gray-800">
                                            {inviteCode}
                                        </div>
                                        <button
                                            onClick={handleCopyCode}
                                            className={`p-3 rounded-xl transition-colors
                                                    ${codeCopied ? 'bg-green-100 text-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
                                                `}
                                        >
                                            {codeCopied ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d='M5 13l4 4L19 7' />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleGenerateCode}
                                        disabled={generatingCode}
                                        className="w-full py-2.5 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-blue-400 hover:text-blue-500 transition-colors"
                                    >
                                        {generatingCode ? 'Generating...' : 'Generate New Code'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleGenerateCode}
                                    disabled={generatingCode}
                                    className="auth-button w-full"
                                >
                                    {generatingCode ? 'Generating...' : 'Generate Invite Code'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Members Tab */}
                    {tab === 'members' && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 mb-4">
                                {album.members.length} {album.members.length === 1 ? 'member' : 'members'}
                            </p>
                            {album.members.map((member: any) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {member.name?.[0]?.toUpperCase() || '?'}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm truncate">
                                            {member.name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {member.email}
                                        </p>
                                    </div>
                                    {member.id === album.created_by && (
                                        <span className="text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                                            Owner
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Danger Tab */}
                    {tab === 'danger' && (
                        <div className="space-y-4">
                            {!isOwner ? (
                                <>
                                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                        <p className="text-sm text-orange-700 font-medium mb-1">
                                            Leave this album?
                                        </p>
                                        <p className="text-sm text-orange-600">
                                            You can rejoin later with an invite code.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLeave}
                                        disabled={leaving}
                                        className="w-full py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-50"
                                    >
                                        {leaving ? 'Leaving...' : `Leave "${album.name}"`}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm text-red-700 font-medium mb-1">
                                            ⚠️ This cannot be undone
                                        </p>
                                        <p className="text-sm text-red-600">
                                            All {album.photo_count} photos, folders, and comments will be permanently deleted.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Type <span className="font-mono bg-gray-100 px-1 rounded">{album.name}</span> to confirm
                                        </label>
                                        <input
                                            type="text"
                                            value={deleteConfirm}
                                            onChange={e => setDeleteConfirm(e.target.value)}
                                            placeholder={album.name}
                                            className="auth-input"
                                        />
                                    </div>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting || deleteConfirm !== album.name}
                                        className="w-full py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {deleting ? 'Deleting...' : `Delete "${album.name}"`}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}