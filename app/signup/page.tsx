'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Eye, EyeOff } from 'lucide-react';

function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      // Check or existing user with email
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
      
      if (checkError) throw checkError

      if (existingUsers && existingUsers.length > 0) {
        setError('An account with that email already exists')
        setLoading(false)
        return
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name, // This will be used by the trigger to populate profiles table
          },
        },
      })

      if (error) throw error

      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          name,
        })
      }

      // Redirect to home page (or show confirmation message)
      toast.success('Success! Check your email to verify your account.')
      router.push(`/verify?email=${encodeURIComponent(email)}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background hearts */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="heart-float" style={{ left: '20%', animationDelay: '0s' }}>💕</div>
        <div className="heart-float" style={{ left: '70%', animationDelay: '3s' }}>💗</div>
        <div className="heart-float" style={{ left: '45%', animationDelay: '6s' }}>💖</div>
      </div> */}

      {/* Sign Up Card */}
      <div className="auth-card w-full max-w-md relative z-10">
        {/* Decorative star */}
        <div className="absolute -top-3 -right-3 text-yellow-400 text-2xl animate-pulse">
          ⭐
        </div>

        {/* Main heart icon */}
        <div className="flex justify-center mb-6">
          <div className="flex justify-center mb-6">
                              {/* <div className="
                                  w-16
                                  h-16
                                  rounded-full
                                  bg-gradient-to-br
                                  from-pink-500
                                  to-purple-500
                                  flex
                                  items-center
                                  justify-center
                                  shadow-lg
                                  animate-float
                                  "
                              > */}
                                  <Logo width={40} height={40} />
                              {/* </div> */}
                          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Join Our Album
        </h1>
        <p className="text-center text-gray-600 mb-8 flex items-center justify-center gap-2">
          Create your account 🎉
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} className="space-y-5">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="auth-input"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              {/* <span className="sparkle text-purple-500">✨</span> */}
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="auth-input"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className='relative'>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="auth-input"
              />
              <button
                type='button'
                className='absolute -translate-y-2/4 cursor-pointer text-gray-400 p-1.5 rounded-[10px] border-[none] right-2.5 top-2/4 hover:text-gray-500 background-transparent hover:background-#f3f4f6'
                onClick={() => setShowPassword((v) => !v)}
                aria-label='Toggle password visibility'
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
            </label>
            <div className="relative">
                <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    required
                    className="auth-input"
                />
                <button
                  type='button'
                  className='absolute -translate-y-2/4 cursor-pointer text-gray-400 p-1.5 rounded-[10px] border-[none] right-2.5 top-2/4 hover:text-gray-500 background-transparent hover:background-#f3f4f6'
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label='Toggle password visibility'
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
          </div>

          {/* Sign Up Button */}
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
                Creating account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-500 font-semibold hover:text-teal-600 transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes heartFloat {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        .heart-float {
          position: absolute;
          font-size: 2rem;
          animation: heartFloat 15s linear infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .sparkle {
          display: inline-block;
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full' />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}