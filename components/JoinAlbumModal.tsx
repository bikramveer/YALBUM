'use client'

import { useState } from "react"
import { joinAlbumWithCode } from "@/lib/albums"
import { useAuth } from "./AuthProvider"
import { blockDemoAction } from "@/lib/demoUser"

interface Props {
    isOpen: boolean
    onClose: () => void
    onJoined: (albumId: string) => void
}

export default function JoinAlbumModal({ isOpen, onClose, onJoined }: Props) {
    const { user } = useAuth()
    const [code, setCode] = useState('')
    const [joining, setJoining] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleJoin = async(e: React.FormEvent) => {
        e.preventDefault()
        if (blockDemoAction(user?.email, 'join albums')) {
            return
        }
        if (!code.trim() || !user) return
        setJoining(true)
        setError(null)

        const result = await joinAlbumWithCode(code.trim(), user.id)

        if (result.success && result.albumId) {
            onJoined(result.albumId)
            onClose()
            setCode('')
        } else {
            setError(result.error || 'Failed to join album')
        }
        setJoining(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800"> Join an Album</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                </div>

                <p className="text-gray-500 text-sm mb-5">
                    Enter the 6-character invite code you received from an album member.
                </p>

                {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

                <form onSubmit={handleJoin} className="space-y-4">
                    <input
                        type="text"
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        placeholder="e.g. A3X9KP"
                        maxLength={6}
                        className="auth-input text-center text-2xl font-mono tracking-widest uppercase"
                        autoFocus
                        required
                    />
                    <button
                        type="submit"
                        disabled={code.length !== 6 || joining}
                        className="auth-button w-full"
                    >
                        {joining ? 'Joining...' : 'Join Album'}
                    </button>
                </form>
            </div>
        </div>
    )
}