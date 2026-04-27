'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import Logo from '@/components/Logo'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)
    setError(null)

    // Auto-advance
    if (digit && index < 5) {
      inputs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits filled
    if (digit && index === 5) {
      const fullCode = [...newCode].join('')
      if (fullCode.length === 6) {
        handleVerify(fullCode)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      handleVerify(pasted)
    }
  }

  const handleVerify = async (token: string) => {
    if (token.length !== 6) return
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      })

      if (error) throw error

      if (data.session) {
        toast.success('Email verified! Welcome to YALBUM 🎉')
        router.push('/albums')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code. Please try again.')
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return
    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (error) throw error
      toast.success('A new code has been sent to your email.')
      setResendCooldown(60)
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleVerify(code.join(''))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="auth-card w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo width={40} height={40} />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Check your email
        </h1>
        <p className="text-center text-gray-500 mb-2 text-sm">
          We sent a 6-digit code to
        </p>
        <p className="text-center font-semibold text-gray-700 mb-8 text-sm">
          {email || 'your email address'}
        </p>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* OTP Input */}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                disabled={loading}
                className={`
                  w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                  ${digit ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 bg-gray-50 text-gray-800'}
                  ${error ? 'border-red-300 bg-red-50' : ''}
                  focus:border-teal-500 focus:bg-white focus:shadow-md
                  disabled:opacity-50
                `}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || code.join('').length !== 6}
            className="auth-button w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive a code?{' '}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className="text-teal-500 font-semibold hover:text-teal-600 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resending
                ? 'Sending...'
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend code'}
            </button>
          </p>
        </div>

        {/* Back to signup */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/signup')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back to sign up
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full' />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}