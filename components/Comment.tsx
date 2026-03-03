'use client'

import { useState } from 'react'
import { CommentWithUser } from '@/types/database'
import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'

interface CommentProps {
  comment: CommentWithUser
  onReplyAdded: () => void
}

export default function Comment({ comment, onReplyAdded }: CommentProps) {
  const { user } = useAuth()
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !user) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          photo_id: comment.photo_id,
          user_id: user.id,
          content: replyText.trim(),
          parent_id: comment.id
        })

      if (error) throw error

      setReplyText('')
      setShowReplyInput(false)
      onReplyAdded()
    } catch (error) {
      console.error('Reply error:', error)
      alert('Failed to add reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!user || user.id !== comment.user_id) return

    const confirmed = confirm('Delete this comment?')
    if (!confirmed) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id)

      if (error) throw error

      onReplyAdded() // Refresh comments
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete comment')
    } finally {
      setDeleting(false)
    }
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const commentDate = new Date(date)
    const seconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return commentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="comment-container">
      {/* Comment header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {comment.profile?.name?.[0]?.toUpperCase() || '?'}
        </div>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-800">
              {comment.profile?.name || 'Unknown'}
            </span>
            <span className="text-xs text-gray-400">
              {timeAgo(comment.created_at)}
            </span>
          </div>

          <p className="text-sm text-gray-700 break-words">
            {comment.content}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs font-medium text-gray-500 hover:text-blue-500 transition-colors"
            >
              Reply
            </button>

            {user && user.id === comment.user_id && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <form onSubmit={handleReply} className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
                disabled={submitting}
              />
              <button
                type="submit"
                disabled={!replyText.trim() || submitting}
                className="px-4 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-full font-medium hover:shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? '...' : 'Reply'}
              </button>
            </form>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  onReplyAdded={onReplyAdded}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}