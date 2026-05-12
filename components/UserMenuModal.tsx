'use client'

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface UserMenuModalProps {
    isOpen: boolean
    onClose: () => void
    onReportUsername: () => void
    onReportProfilePicture: () => void
    userName: string
}

export default function UserMenuModal({ isOpen, onClose, onReportUsername, onReportProfilePicture, userName }: UserMenuModalProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setVisible(true)
        } else {
            setVisible(false)
        }
    }, [isOpen])

    if (!isOpen && !visible) return null

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-5 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`
                w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden
                transition-transform duration-200
                ${visible ? 'scale-100' : 'scale-95'}
                `}
            >
                {/* Header */}
                <div className='flex items-center justify-between px-4 py-3.5 border-b border-gray-200'>
                    <span className='text-sm font-semibold text-gray-900'>{userName}</span>
                    <button
                        onClick={onClose}
                        className='p-1 hover:bg-gray-100 rounded-full transition-colors'
                        aria-label='Close'
                    >
                        <X size={18} className='text-gray-500' />
                    </button>
                </div>
        
                {/* Actions */}
                <button
                    onClick={() => { onReportUsername(); onClose() }}
                    className='w-full text-left px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-gray-50 transition-colors border-b border-gray-200'
                >
                    Report Username
                </button>
        
                <button
                    onClick={() => { onReportProfilePicture(); onClose() }}
                    className='w-full text-left px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-gray-50 transition-colors border-b border-gray-200'
                >
                    Report Profile Picture
                </button>
        
                <button
                    onClick={onClose}
                    className='w-full text-left px-4 py-3.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors'
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}