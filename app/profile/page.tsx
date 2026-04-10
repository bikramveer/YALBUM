'use client'

import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/lib/supabase"
import { Camera, Eye, EyeOff, Lock, LogOut, Trash2, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import "./profile.css"
import Logo from "@/components/Logo"
import Link from "next/link"
import { blockDemoAction, checkDemoUser } from "@/lib/demoUser"

export default function Profile() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    // Profile State Settings
    const [name, setName] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)

    // Password State Settings
    const [securityMode, setSecurityMode] = useState<'default' | 'change'>('default')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [pwError, setPwError] = useState('')
    const [pwStatus, setPwStatus] = useState<'idle' | 'loading' | 'success'>('idle')

    // Delete Modal Settings
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState('')
    const [deleting, setDeleting] = useState(false)

    // Loading State Settings
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [nameError, setNameError] = useState('')

    useEffect(() => {
        if (!user) {
            router.push('./login')
            return
        }
        fetchProfile()
        loadData()
    }, [user, router])

    const loadData = async () => {
            if (!user) return
    
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
    
            if (profileData) setProfile(profileData)
        }

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('name, profile_picture')
                .eq('id', user?.id)
                .single()

            if (error) throw error
            
            setName(data.name || '')
            setProfilePicture(data.profile_picture || null)
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleNameUpdate = async () => {
        if (checkDemoUser(user?.email)) {
            toast.error('Demo users cannot change the display name.')
            return
        }

        if (!name.trim()) {
            setNameError('Name cannot be empty')
            return
        }

        setSaving(true)
        setNameError('')

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ name: name.trim() })
                .eq('id', user?.id)

            if (error) throw error

            toast.success('Name updated successfully')
        } catch (error: any) {
            console.error('Error updating name:', error)
            setNameError(error.message || 'Failed to update name')
        } finally {
            setSaving(false)
        }
    }

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (checkDemoUser(user?.email)) {
            toast.error('Demo users cannot change the profile picture.')
            return
        }

        const file =e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Plesae select an image file')
            return
        }

        // Vldate file size
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB')
            return
        }

        setUploading(true)

        try {
            // Delete old profile picutre if it exists
            if (profilePicture) {
                const oldPath = profilePicture.split('/').pop()
                if (oldPath) {
                    await supabase.storage
                        .from('profile-pictures')
                        .remove([`${user?.id}/${oldPath}`])
                }
            }

            // Upload new profile picture
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${user?.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('profile-pictures')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(filePath)

            const publicUrl = urlData.publicUrl

            // Update profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ profile_picture: publicUrl })
                .eq('id', user?.id)

            if (updateError) throw updateError

            setProfilePicture(publicUrl)
            toast.success('Profile picture updated!')
        } catch (error: any) {
            console.error('Error uploading profile picture:', error)
            toast.error(error.message || 'Failed to update profile picture')
        } finally {
            setUploading(false)
        }
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setPwError('')
        if (checkDemoUser(user?.email)) {
            toast.error('Demo users cannot change the password.')
            return
        }

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPwError('All fields are required')
            return
        }

        if (newPassword.length < 6) {
            setPwError('New password must be at least 6 characters long')
            return
        }

        if (newPassword !== confirmPassword) {
            setPwError('New passwords do not match')
            return
        }

        setPwStatus('loading')

        try {
            // Verify current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user?.email || '',
                password: currentPassword,
            })

            if (signInError) {
                setPwError('Current password is incorrect')
                setPwStatus('idle')
                return
            }

            // Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (updateError) throw updateError

            setPwStatus('success')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')

            setTimeout(() => {
                setSecurityMode('default')
                setPwStatus('idle')
            }, 2000)
        } catch (error: any) {
            console.error('Error updating password:', error)
            setPwError(error.message || 'Failed to update password')
            setPwStatus('idle')
        }
    }

    // const handleDeleteAccount = async () => {
    //     if (deleteConfirmText !== 'DELETE') {
    //         alert('Please type "DELETE" to confirm')
    //         return
    //     }

    //     setDeleting(true)

    //     try {
    //         // Delete all user's data
    //         const { data: photos } = await supabase
    //             .from('photos')
    //             .select('storage_path')
    //             .eq('user_id', user?.id)

    //         if (photos && photos.length > 0) {
    //             const paths = photos.map(p => p.storage_path)
    //             await supabase.storage.from('photos').remove(paths)
    //         }

    //         if (profilePicture) {
    //             const oldPath = profilePicture.split('/').pop()
    //             if (oldPath) {
    //                 await supabase.storage
    //                     .from('profile-pictures')
    //                     .remove([`${user?.id}/${oldPath}`])
    //             }
    //         }

    //         const { error: deleteError } = await supabase
    //             .from('profiles')
    //             .delete()
    //             .eq('id', user?.id)

    //         if (deleteError) throw deleteError

    //         // Sign out
    //         await signOut()
    //         router.push('/login')
    //     } catch (error: any) {
    //         console.error('Error deleting account:', error)
    //         alert(error.message || 'Failed to delete account')
    //         setDeleting(false)
    //     }
    // }

    const handleDeleteAccount = async () => {
        if (checkDemoUser(user?.email)) {
            toast.error('Demo users cannot delete the account.')
            return
        }

        if (deleteConfirmText !== 'DELETE') {
        alert('Please type "DELETE" to confirm')
        return
        }

        setDeleting(true)

        try {
        console.log('Deleting account...')

        // Delete all user's photos from storage
        const { data: photos } = await supabase
            .from('photos')
            .select('storage_path')
            .eq('user_id', user?.id)

        if (photos && photos.length > 0) {
            const paths = photos.map(p => p.storage_path)
            await supabase.storage.from('photos').remove(paths)
        }

        // Delete profile picture
        if (profilePicture) {
            const oldPath = profilePicture.split('/').pop()
            if (oldPath) {
            await supabase.storage
                .from('profile-pictures')
                .remove([`${user?.id}/${oldPath}`])
            }
        }

        // Call the database function to delete profile AND auth user
        const { data, error } = await supabase.rpc('delete_own_account')

        if (error) {
            console.error('Delete error:', error)
            throw new Error(error.message || 'Failed to delete account')
        }

        console.log('Account deleted successfully:', data)

        alert('Account deleted successfully')
        
        // Sign out
        await signOut()
        router.push('/login')
        } catch (error: any) {
        console.error('Error deleting account:', error)
        alert(error.message || 'Failed to delete account')
        setDeleting(false)
        }
    }

    const onCancelSecurity = () => {
        setSecurityMode('default')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setPwError('')
        setPwStatus('idle')
    }

    if (loading) {
        return (
            <div className="profile-lading">
                <div className="spinner" />
                <p>Loading profile...</p>
            </div>
        )
    }

    return (
        <>
            <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    
                    <div className="flex items-center gap-3" onClick={() => router.push('/albums')}>  
                            <Logo width={32} height={32} />

                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Y A L B U M</h1>
                            <p className="text-sm text-gray-500">Welcome, {profile?.name}!</p>
                        </div>  
                    </div>

                    <div className="flex">
                        <button
                            onClick={() => router.push('/profile')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:text-teal-500 transition-all"
                            title="Profile Settings"
                        >
                            <User size={24} />
                            {/* <span className="hidden sm:inline font-medium text-gray-700">Profile</span> */}
                        </button>

                        <button
                            onClick={signOut}
                            className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                            title='Sign out'
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <div className="profile-container">

                <div className="profile-content">
                    
                    {/* Profile Picture Section */}
                    <section className="profile-card">
                        <div className="profile-card-header">
                            <div className="profile-card-title">
                                <Camera size={18} />
                                <span>Profile Picture</span>
                            </div>
                        </div>
                        
                        <div className="profile-picture-section">
                            <div className="profile-picture-preview">
                                {profilePicture ? (
                                    <img src={profilePicture} alt="Profile" className="profile-picture-image" />
                                ) : (
                                    <div className="profile-picture-placeholder">
                                        <User size={40} />
                                    </div>
                                )}
                            </div>

                            <div className="profile-picture-actions">
                                <label className="profile-upload-btn">
                                    <input
                                        type='file'
                                        accept='image/*'
                                        onChange={handleProfilePictureUpload}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                    />
                                    {uploading ? 'Uploading...' : profilePicture ? 'Change Picture' : 'Upload Picture'}
                                </label>
                                <p className="profile-picture-hint">JPG, PNG, or GIF. Max 5MB.</p>
                            </div>
                        </div>
                    </section>

                    {/* Display Name Section */}
                    <section className="profile-card">
                        <div className="profile-card-header">
                            <div className="profile-card-title">
                                <User size={18} />
                                <span>Display Name</span>
                            </div>
                        </div>

                        <div className="profile-name-section">
                            <label className="profile-field profile-field-full">
                                <span className="profile-label">Name</span>
                                <input
                                    type='text'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="profile-input"
                                    placeholder="Enter your name"
                                    maxLength={50}
                                />
                            </label>

                            {nameError && <p className="profile-error">{nameError}</p>}

                            <button
                                onClick={handleNameUpdate}
                                disabled={saving || !name.trim()}
                                className="primary-btn profile-primary"
                            >
                                {saving ? 'Saving...' : 'Update Name'}
                            </button>
                        </div>
                    </section>

                    {/* Security Section */}
                    <section className="profile-card">
                        <div className="profile-card-header">
                            <div className="profile-card-title">
                                <Lock size={18} />
                                <span>Security</span>
                            </div>
                        </div>

                        {pwStatus !== 'success' ? (
                            <>
                                {securityMode === 'default' ? (
                                    <div className="profile-security-default">
                                        <p className="profile-muted">
                                            Keep your account secure by regularly updating your password.
                                        </p>
                                        <button
                                            type='button'
                                            className="primary-btn profile-primary"
                                            onClick={() => setSecurityMode('change')}
                                        >
                                            Change Password
                                        </button>
                                    </div>
                                ) : (
                                    <form className="profile-security-form" onSubmit={handlePasswordUpdate}>
                                        <label className="profile-field profile-field-null">
                                            <span className="profile-label">Current Password</span>
                                            <div className="profile-input-with-icon">
                                                <input
                                                    type={showCurrent ? 'text' : 'password'}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="profile-input"
                                                    placeholder="********"
                                                />
                                                <button
                                                    type='button'
                                                    className="profile-eye-btn"
                                                    onClick={() => setShowCurrent((v) => !v)}
                                                    aria-label="Toggle current password visibility"
                                                >
                                                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </label>

                                        <label className="profile-field profile-field-null">
                                            <span className="profile-label">New Password</span>
                                            <div className="profile-input-with-icon">
                                                <input
                                                    type={showNew ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="profile-input"
                                                    placeholder="********"
                                                />
                                                <button
                                                    type='button'
                                                    className="profile-eye-btn"
                                                    onClick={() => setShowNew((v) => !v)}
                                                    aria-label="Toggle current password visibility"
                                                >
                                                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </label>

                                        <label className="profile-field profile-field-null">
                                            <span className="profile-label">Confirm Password</span>
                                            <div className="profile-input-with-icon">
                                                <input
                                                    type={showConfirm ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="profile-input"
                                                    placeholder="********"
                                                />
                                                <button
                                                    type='button'
                                                    className="profile-eye-btn"
                                                    onClick={() => setShowConfirm((v) => !v)}
                                                    aria-label="Toggle current password visibility"
                                                >
                                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </label>

                                        {pwError && <p className="profile-error">{pwError}</p>}

                                        <div className="profile-actions-row">
                                            <button
                                                type='button'
                                                className="profile-btn secondary"
                                                onClick={onCancelSecurity}
                                                disabled={pwStatus === 'loading'}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type='submit'
                                                className="profile-btn primary"
                                                disabled={pwStatus === 'loading'}
                                            >
                                                {pwStatus === 'loading' ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        ) : (
                            <div className="profile-success-message">
                                Password updated successfully!
                            </div>
                        )}
                    </section>

                    {/* Delete Account Section */}
                    <section className="profile-card profile-card-danger">
                        <div className="profile-card-header">
                            <div className="profile-card-title">
                                <Trash2 size={18} />
                                <span>Delete Account</span>
                            </div>
                        </div>

                        <div className="profile-delete-section">
                            <p className="profile-muted">
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="danger-btn"
                            >
                                Delete Account
                            </button>
                        </div>
                    </section>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="delete-account-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="delete-account-modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2 className="delete-account-modal-title">Delete Account?</h2>
                            <p className="delete-account-modal-text">
                                This will permanently delete your account and all your photos, albums, and commments.
                                This action cannot be undone.
                            </p>
                            <p className="delete-account-modal-text-bold">
                                Type <strong>DELETE</strong> to confirm:
                            </p>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="delete-account-modal-input"
                                placeholder="Type DELETE"
                                autoFocus
                            />
                            <div className="delete-account-modal-actions">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false)
                                        setDeleteConfirmText('')
                                    }}
                                    className="delete-account-modal-btn secondary"
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="delete-account-modal-btn danger"
                                    disabled={deleting || deleteConfirmText !== 'DELETE'}
                                >
                                    {deleting ? "Deleting..." : 'Delete Account'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

function showDemoModal(arg0: string) {
    throw new Error("Function not implemented.")
}
