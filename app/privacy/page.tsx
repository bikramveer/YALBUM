// 'use client'
// import { useRouter } from "next/navigation"
// import Logo from "@/components/Logo"

// export default function Privacy() {
//     const router = useRouter();

//     return (
//         <main className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-teal-50">
//             <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-40">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    
//                     <div className="flex items-center gap-3" onClick={() => router.push('/login')}>  
//                             <Logo width={32} height={32} />

//                         <div>
//                             <h1 className="text-xl font-bold text-gray-800">Y A L B U M</h1>
//                         </div>  
//                     </div>
//                 </div>
//             </header>

//             <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
//                 <div className="mb-10">
//                     <div className="text-3xl font-bold text-gray-800 mb-2">Privacy Policy</div>

//                     <div className="text-sm text-gray-800">Last updated: March 25, 2026</div>
//                 </div>
//             </div>
//         </main>
//     )
// }

'use client'
import { useRouter } from "next/navigation"
import Logo from "@/components/Logo"

export default function Privacy() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-teal-50">
            <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    
                    <div 
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={() => router.push('/login')}
                    >  
                        <Logo width={32} height={32} />
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Y A L B U M</h1>
                        </div>  
                    </div>
                </div>
            </header>

            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
                        <p className="text-sm text-gray-500">Last updated: March 25, 2026</p>
                    </div>

                    {/* Introduction */}
                    <div className="prose prose-blue max-w-none">
                        <p className="text-gray-700 leading-relaxed mb-8">
                            At YALBUM, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                            and protect your information when you use our photo sharing application.
                        </p>

                        {/* Section 1 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Information</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        When you create an account, we collect:
                                    </p>
                                    <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                                        <li>Email address (for account creation and authentication)</li>
                                        <li>Display name</li>
                                        <li>Password (encrypted and never stored in plain text)</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Content You Upload</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        We store the photos and content you choose to upload to YALBUM, including:
                                    </p>
                                    <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                                        <li>Photos and images</li>
                                        <li>Album names and descriptions</li>
                                        <li>Folder names and organization</li>
                                        <li>Comments on photos</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Usage Information</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        We automatically collect certain information about how you use YALBUM:
                                    </p>
                                    <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                                        <li>Album membership and permissions</li>
                                        <li>Upload and access timestamps</li>
                                        <li>Device type and operating system (for app functionality)</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                            
                            <p className="text-gray-700 leading-relaxed mb-4">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Provide and maintain the YALBUM service</li>
                                <li>Enable photo sharing and album collaboration</li>
                                <li>Authenticate your account and keep it secure</li>
                                <li>Send important service updates and notifications</li>
                                <li>Improve and optimize the app experience</li>
                                <li>Respond to your support requests</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Protect Your Information</h2>
                            
                            <p className="text-gray-700 leading-relaxed mb-4">
                                We take security seriously and implement industry-standard measures to protect your data:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>All data is transmitted using secure HTTPS encryption</li>
                                <li>Photos are stored on secure, encrypted servers (Supabase)</li>
                                <li>Passwords are hashed and never stored in plain text</li>
                                <li>Access to photos is restricted to album members only</li>
                                <li>Regular security updates and monitoring</li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
                            
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                                <p className="text-blue-900 font-semibold">
                                    We do NOT sell, rent, or share your personal information with third parties for marketing purposes.
                                </p>
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-4">
                                We only share your information in these limited circumstances:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>With album members:</strong> Photos you upload to shared albums are visible to other members you've invited</li>
                                <li><strong>Service providers:</strong> We use Supabase for secure data storage and authentication</li>
                                <li><strong>Legal requirements:</strong> If required by law or to protect our rights</li>
                            </ul>
                        </section>

                        {/* Section 5 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Choices</h2>
                            
                            <p className="text-gray-700 leading-relaxed mb-4">
                                You have control over your data:
                            </p>
                            
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Access Your Data</h3>
                                    <p className="text-gray-700">
                                        You can view and download all your photos and content at any time through the app.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete Your Data</h3>
                                    <p className="text-gray-700">
                                        You can delete individual photos, albums, or your entire account from the app settings. 
                                        Deleted data is permanently removed from our servers.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Export Your Data</h3>
                                    <p className="text-gray-700">
                                        Download your photos individually or as complete albums at any time.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Update Your Information</h3>
                                    <p className="text-gray-700">
                                        Edit your account information, display name, and email in the app settings.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
                            
                            <p className="text-gray-700 leading-relaxed">
                                We retain your information only as long as necessary to provide the YALBUM service. 
                                When you delete your account, we permanently delete your photos and personal information 
                                from our servers within 30 days, except where we're required to retain certain data for 
                                legal compliance.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
                            
                            <p className="text-gray-700 leading-relaxed">
                                YALBUM is not intended for children under 13 years of age. We do not knowingly collect 
                                personal information from children under 13. If you believe we have collected information 
                                from a child under 13, please contact us immediately.
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h2>
                            
                            <p className="text-gray-700 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any significant 
                                changes by email or through the app. Your continued use of YALBUM after changes are posted 
                                constitutes your acceptance of the updated policy.
                            </p>
                        </section>

                        {/* Section 9 */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Users</h2>
                            
                            <p className="text-gray-700 leading-relaxed">
                                YALBUM is hosted on servers located in the United States. If you access YALBUM from outside 
                                the United States, your information will be transferred to and stored in the United States. 
                                By using YALBUM, you consent to this transfer.
                            </p>
                        </section>

                        {/* Contact Section */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
                            
                            <p className="text-gray-700 leading-relaxed mb-4">
                                If you have questions about this Privacy Policy or how we handle your data, please contact us:
                            </p>
                            
                            <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                                <p className="text-gray-700">
                                    <strong className="text-gray-900">Email:</strong>{' '}
                                    <a href="mailto:yalbumadmin@gmail.com" className="text-blue-600 hover:text-blue-700 underline">
                                        yalbumadmin@gmail.com
                                    </a>
                                </p>
                                <p className="text-gray-700">
                                    <strong className="text-gray-900">App:</strong> Settings → Help & Support
                                </p>
                            </div>
                        </section>

                        {/* Summary Box */}
                        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Privacy Summary</h3>
                            <ul className="space-y-2 text-gray-700 text-sm">
                                <li>✓ We only collect data necessary to provide the service</li>
                                <li>✓ We never sell or share your personal information</li>
                                <li>✓ Your photos are encrypted and secure</li>
                                <li>✓ You can delete your data at any time</li>
                                <li>✓ We're transparent about how we use your information</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        ← Back to YALBUM
                    </button>
                </div>
            </div>
        </main>
    )
}