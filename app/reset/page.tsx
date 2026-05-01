'use client'

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [sessionReady, setSessionReady] = useState(false)

    useEffect(() => {
        const exchangeCode = async () => {
            const params = new URLSearchParams(window.location.search)
            const code = params.get('code')

            if (code) {
                try {
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
                    if (error) throw error
                    if (data.session) {
                        setSessionReady(true)
                    }
                } catch (error) {
                    console.error('Failed to exchange code for session:', error)
                }
            }
        }

        exchangeCode()

        // Keep as fallback for non-PKCE flows
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
                    setSessionReady(true)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            setSuccess(true)
            // Sign out so user must sign in with fresh password
            await supabase.auth.signOut()
        } catch (error: any) {
            setError(error.message || 'Failed to reset password')
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

                {!success ? (
                    <>
                        <p className="text-center text-gray-600 mb-8">
                            Enter your new password below
                        </p>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {!sessionReady && (
                            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                                Loading your session... If this persists, try clicking the reset link again.
                            </div>
                        )}

                        <form onSubmit={handleReset} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        required
                                        className="auth-input"
                                        disabled={!sessionReady}
                                    />
                                    <button
                                        type='button'
                                        className='absolute -translate-y-2/4 cursor-pointer text-gray-400 p-1.5 rounded-[10px] border-[none] right-2.5 top-2/4 hover:text-gray-500 background-transparent'
                                        onClick={() => setShowPassword(v => !v)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat your password"
                                        required
                                        className="auth-input"
                                        disabled={!sessionReady}
                                    />
                                    <button
                                        type='button'
                                        className='absolute -translate-y-2/4 cursor-pointer text-gray-400 p-1.5 rounded-[10px] border-[none] right-2.5 top-2/4 hover:text-gray-500 background-transparent'
                                        onClick={() => setShowConfirm(v => !v)}
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !sessionReady}
                                className="auth-button w-full"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Resetting...
                                    </span>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    // Success state
                    <div className="text-center">
                        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-lg font-semibold text-gray-800 mb-2">
                            Password reset successfully!
                        </p>
                        <p className="text-sm text-gray-600 mb-8">
                            Your password has been updated. You can now sign in with your new password.
                        </p>
                        <Link
                            href="/login"
                            className="auth-button inline-block text-center"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                )}

                {!success && (
                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                            ← Back to sign in
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className='min-h-screen flex items-center justify-center bg-blue-50'>
                <div className='animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full' />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}