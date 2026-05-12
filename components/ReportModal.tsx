'use client'

import { useState, useEffect } from "react"
import { ContentType, REPORT_REASONS } from "@/constants/reportReasons"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useAuth } from "./AuthProvider"
import { X } from "lucide-react"

interface ReportModalProps {
    isOpen: boolean
    onClose: () => void
    contentType: ContentType
    contentId: string
    reportedUserId: string
}

export default function ReportModal({ isOpen, onClose, contentType, contentId, reportedUserId  }: ReportModalProps) {
    const { user } = useAuth()
    const [selectedReason, setSelectedReason] = useState<string | null>(null)
    const [additionalInfo, setAdditionalInfo] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [visible, setVisible] = useState(false)

    const reasons = REPORT_REASONS[contentType] || []

    useEffect(() => {
        if (isOpen) {
            setVisible(true)
        } else {
            setVisible(false)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) {
            const timeout = setTimeout(() => {
                setSelectedReason(null)
                setAdditionalInfo('')
            }, 300)
            return () => clearTimeout(timeout)
        }
    }, [isOpen])

    const handleSubmit = async () => {
        if (!selectedReason) return

        setSubmitting(true)
        try {
            const { error } = await supabase.from('reports').insert({
                reporter_id: user?.id,
                reported_user_id: reportedUserId,
                content_type: contentType,
                content_id: contentId,
                reason: selectedReason,
                additional_info: additionalInfo.trim() || null,
            })

            if (error) throw error

            toast.success('Report submitted. Thank you for helping keep YALBUM safe.')
            onClose()
        } catch (error) {
            console.error('Report error:', error)
            toast.error('Failed to submit report. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen && !visible) return null

    return (
        <div
            className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            {/* Sheet */}
            <div
                onClick={(e) => e.stopPropagation()}
                className={`
                w-full max-w-lg bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[75vh]
                transition-transform duration-250 ease-out
                ${visible ? 'translate-y-0' : 'translate-y-full'}
                `}
            >
                {/* Header */}
                <div className='flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0'>
                    <h2 className='text-lg font-bold text-gray-900'>Report Content</h2>
                    <button
                        onClick={onClose}
                        className='p-1.5 hover:bg-gray-100 rounded-full transition-colors'
                        aria-label='Close'
                    >
                        <X size={20} className='text-gray-500' />
                    </button>
                </div>
        
                {/* Scrollable body */}
                <div className='flex-1 overflow-y-auto px-5 py-4 min-h-0'>
                    <p className='text-sm font-semibold text-gray-700 mb-4'>
                        Why are you reporting this {contentType.replace('_', ' ')}?
                    </p>
            
                    {/* Reason list */}
                    <div className='flex flex-col gap-3'>
                        {reasons.map((reason) => (
                        <button
                            key={reason}
                            onClick={() => setSelectedReason(reason)}
                            className={`
                            flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-lg border-2 transition-colors
                            ${selectedReason === reason
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-gray-50 border-transparent hover:bg-gray-100'
                            }
                            `}
                        >
                            {/* Radio dot */}
                            <span className={`
                            flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                            ${selectedReason === reason ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                            `}>
                            {selectedReason === reason && (
                                <span className='w-2 h-2 rounded-full bg-white' />
                            )}
                            </span>
                            <span className={`text-sm ${selectedReason === reason ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                            {reason}
                            </span>
                        </button>
                        ))}
                    </div>
            
                    {/* Additional info */}
                    <label className='block mt-5 mb-2 text-sm font-semibold text-gray-700'>
                        Additional information <span className='font-normal text-gray-400'>(optional, max 500 char.)</span>
                    </label>
                    <textarea
                        className='w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition'
                        placeholder='Provide any additional context...'
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        maxLength={500}
                        rows={3}
                    />
            
                    {/* Privacy note */}
                    <p className='mt-3 mb-1 text-xs text-gray-400 italic'>
                        Reports are confidential. The user will not be notified that you reported them.
                    </p>
                </div>
        
                {/* Footer */}
                <div className='flex gap-3 px-5 py-4 border-t border-gray-200 flex-shrink-0'>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className='flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedReason || submitting}
                        className='flex-1 py-2.5 rounded-lg bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
                    >
                        {submitting ? (
                        <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                        </svg>
                        ) : (
                        'Submit Report'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}