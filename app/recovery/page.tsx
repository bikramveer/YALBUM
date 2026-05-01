'use client'

import { Suspense, useState} from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { supabase } from '@/lib/supabase';

function ForgotPasswordForm() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sent, setSent] = useState(false)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!email.trim()) {
            setError('Please enter your email address')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: 'https://yalbum.app/reset'
            })
            if (error) throw error
            setSent(true)
        } catch (error: any) {
            setError(error.message || 'Failed to send reset email')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="auth-card w-full max-w-md">

                <div className="flex justify-center mb-6">
                    <Logo width={40} height={40} />
                </div>

                <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
                    Y A L B U M
                </h1>

                {!sent ? (
                    <>
                        <p className="text-center text-gray-600 mb-8">
                            Enter your email and we'll send you a reset link
                        </p>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSend} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="auth-input"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-button w-full"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    // Success state
                    <div className="text-center">
                        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-lg font-semibold text-gray-800 mb-2">
                            Check your email
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                            We sent a reset link to
                        </p>
                        <p className="text-sm font-semibold text-gray-800 mb-6">
                            {email}
                        </p>
                        <p className="text-xs text-gray-500 mb-8">
                            Didn't get it? Check your spam folder or try resending.
                        </p>
                        <button
                            onClick={() => setSent(false)}
                            className="auth-button w-full"
                        >
                            Resend Link
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={
            <div className='min-h-screen flex items-center justify-center bg-blue-50'>
                <div className='animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full' />
            </div>
        }>
            <ForgotPasswordForm />
        </Suspense>
    )
}