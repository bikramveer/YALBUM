'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthProvider'
import { blockDemoAction } from '@/lib/demoUser'

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: (albumId: string) => void
}

const THEME_COLORS = [
  { value: 'linear-gradient(135deg, #f472b6, #ec4899)', label: 'Pink' },
  { value: 'linear-gradient(135deg, #38bdf8, #6366f1)', label: 'Blue' },
  { value: 'linear-gradient(135deg, #34d399, #10b981)', label: 'Green' },
  { value: 'linear-gradient(135deg, #fbbf24, #f59e0b)', label: 'Orange' },
  { value: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', label: 'Purple' },
  { value: 'linear-gradient(135deg, #f87171, #ef4444)', label: 'Red' },
]

export default function CreateAlbumModal({ isOpen, onClose, onCreated }: Props) {
  const { user }                    = useAuth()
  const [name, setName]             = useState('')
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].value)
  const [creating, setCreating]     = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (blockDemoAction(user?.email, 'create albums')) {
      return
    }
    if (!name.trim() || !user) return
    setCreating(true)
    setError(null)
  
    try {
      // Test 1: Does the insert work WITHOUT .select()?
      const { data: album, error: insertError } = await supabase
        .from('albums')
        .insert({
          name: name.trim(),
          theme_color: themeColor,
          created_by: user.id,
        })
        .select()
        .single()
  
      if (insertError || !album) {
        throw insertError || new Error('Failed to create album')
      }
  
      // Add creator as owner member
      const { error: memberError } = await supabase
        .from('album_members')
        .insert({
          album_id: album.id,
          user_id: user.id,
          role: 'owner'
        })
  
      if (memberError) throw memberError
  
      onCreated(album.id)
      onClose()
      setName('')
      setThemeColor(THEME_COLORS[0].value)
    } catch (err: any) {
      setError(err.message || 'Failed to create album')
      console.error('Create album error:', err)
    } finally {
      setCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Album</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Album Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Our Love Story"
              className="auth-input"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Theme Color</label>
            <div className="grid grid-cols-3 gap-3">
              {THEME_COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setThemeColor(color.value)}
                  className="h-12 rounded-xl transition-all hover:scale-105"
                  style={{
                    background: color.value,
                    outline: themeColor === color.value ? '3px solid #1a1a1a' : '3px solid transparent',
                    outlineOffset: '2px'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div
            className="h-12 rounded-xl flex items-center justify-center text-white font-semibold"
            style={{ background: themeColor }}
          >
            {name || 'Album Preview'}
          </div>

          <button
            type="submit"
            disabled={!name.trim() || creating}
            className="auth-button w-full"
          >
            {creating ? 'Creating...' : 'Create Album'}
          </button>
        </form>
      </div>
    </div>
  )
}