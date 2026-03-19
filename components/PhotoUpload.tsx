'use client';

import { useState, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { checkDemoUser } from "@/lib/demoUser";
import { useDemoModal } from "./DemoModalProvider";
import { uploadPhoto, validateImageFile, getPhotoMetadata } from '@/lib/storage';
// import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
// import heic2any from 'heic2any';

interface PhotoUploadProps {
    onUploadComplete: () => void
    currentFolderId: string | null
    albumId: string
}

export default function PhotoUpload({ onUploadComplete, currentFolderId, albumId }: PhotoUploadProps) {
    const { user } = useAuth();
    const { showDemoModal } = useDemoModal();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        if (checkDemoUser(user?.email)) {
            showDemoModal('upload photos');
            return;
        }
        fileInputRef.current?.click();
    }

    const handleFileSelect = async(e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !user) return;

        setUploading(true);
        setError(null);

        try {
            const processedFiles: File[] = [];

            for (const file of Array.from(files)) {
                const isHeic = file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic');

                if (isHeic) {
                    try {
                        const heic2any = (await import('heic2any')).default;
                        
                        const convertedBlob = await heic2any({
                            blob: file,
                            toType: 'image/jpeg',
                            quality: 0.9,
                        });

                        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

                        const convertedFile = new File(
                            [blob],
                            file.name.replace(/\.heic$/i, '.jpg'),
                            { type: 'image/jpeg' }
                        );

                        processedFiles.push(convertedFile);
                    } catch (conversionError) {
                        console.error('HEIC conversion failed:', conversionError);
                        setError(`Failed to convert ${file.name}. Please try converting to JPEG first.`);
                        continue;
                    }
                } else {
                    processedFiles.push(file);
                }
            }

            for (const file of processedFiles) {
                const validation = validateImageFile(file);
                if (!validation.valid) {
                    setError(validation.error || 'Invalid file');
                    continue;
                }

                const storagePath = await uploadPhoto(file, user.id);
                const metadata = getPhotoMetadata(file);

                const { error: dbError } = await supabase
                    .from('photos')
                    .insert({
                        user_id: user.id,
                        album_id: albumId,
                        storage_path: storagePath,
                        folder_id: currentFolderId,
                        ...metadata,
                    });

                if (dbError) throw dbError;
            }

            onUploadComplete();

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    }

    return (
        <>
            <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic'
                multiple
                onChange={handleFileSelect}
                className='hidden'
            />

            <button
                onClick={handleButtonClick}
                disabled={uploading}
                className='upload-button'
            >
                {uploading ? (
                    <span className='flex items-center gap-2'>
                        <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                            <circle
                                className='opacity-25'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'
                                fill='none'
                            />

                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        
                        </svg>
                        Uploading...
                    </span>
                ) : (
                    <span className='flex items-center gap-2'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />

                        </svg>
                        Upload
                    </span>
                )}
            </button>

            {error && (
                <div className='fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm animate-slideUp'>
                    <p className='text-sm'>{error}</p>
                </div>
            )}
        </>
    )
}