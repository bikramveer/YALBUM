'use client'

import { useRouter } from "next/navigation"
import { Camera, Folder, Users, Sparkles, Star, Shield, Cloud, Download } from "lucide-react"
import Link from 'next/link'
import Logo from "./Logo"

const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
};

export default function LandingPage() {
    const router = useRouter()

    const features = [
    {
      icon: Camera,
      title: 'Capture Every Moment',
      description: 'Upload and organize your precious photos in beautiful albums that tell your story.'
    },
    {
      icon: Folder,
      title: 'Smart Organization',
      description: 'Create custom folders, sort by date or user, and find any photo instantly.'
    },
    {
      icon: Users,
      title: 'Share Together',
      description: 'Invite loved ones to shared albums and build memories together, anywhere.'
    },
    {
      icon: Sparkles,
      title: 'Beautiful Interface',
      description: 'Enjoy a clean, modern design that works seamlessly on mobile and desktop.'
    },
    {
      icon: Cloud,
      title: 'Always Accessible',
      description: 'Access your photos from any device, anytime. Your memories, always with you.'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Your photos are precious. We keep them safe with industry-leading security.'
    }
  ]

  const screenshots = [
    {
      src: '/screenshots/login.jpg',
      alt: 'Modern Design'
    },
    {
      src: '/screenshots/album.jpg',
      alt: 'Photo Organization'
    },
    {
      src: '/screenshots/post.jpg',
      alt: 'Share and Comment with Friends'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
        <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo and Brand */}
                    <button className="flex items-center gap-3 transition-all hover:scale-105">
                        <Logo width={32} height={32} />
                        <span onClick={() => scrollToSection('hero')} className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent tracking-wide">
                            Y A L B U M
                        </span>
                    </button>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-cyan-200 font-medium transition-colors">
                            Features
                        </button>
                        <button onClick={() => scrollToSection('screenshots')} className="text-gray-600 hover:text-cyan-200 font-medium transition-colors">
                            Screenshots
                        </button>
                        <button onClick={() => scrollToSection('download')} className="text-gray-600 hover:text-cyan-200 font-medium transition-colors">
                            Download
                        </button>
                    </nav>

                    {/* Login Button */}
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                    Login / Sign Up
                    </button>
                </div>
            </div>
        </header>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-200 via-cyan-200 to-teal-200" id="hero">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="text-center">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Logo width={128} height={128} />
                </div>

                {/* Title */}
                <h1 className="text-5xl lg:text-7xl font-bold text-gray mb-6 tracking-wide">
                Y A L B U M
                </h1>

                {/* Subtitle */}
                <p className="text-xl lg:text-2xl text-gray/95 mb-4 max-w-2xl mx-auto">
                Share Your Memories
                </p>
                <p className="text-lg lg:text-xl text-gray/85 mb-12 max-w-2xl mx-auto">
                The beautiful way to organize, share, and cherish your photos together
                </p>

                {/* App Store Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <a 
                    href="https://apps.apple.com/us/app/yalbum-photo-albums/id6760424577" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-3 min-w-[200px]"
                >
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-bold">App Store</div>
                    </div>
                </a>

                <a 
                    href="YOUR_PLAY_STORE_URL" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-black hover:bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-3 min-w-[200px] opacity-50 cursor-not-allowed"
                    onClick={(e) => e.preventDefault()}
                >
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <div className="text-left">
                    <div className="text-xs">Coming Soon</div>
                    <div className="text-lg font-bold">Google Play</div>
                    </div>
                </a>
                </div>

                {/* Web App Link */}
                <div className="mb-8">
                <Link 
                    href="/login"
                    target="blank"
                    className="inline-flex bg-white text-black px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-3 min-w-[200px]"
                >
                    Or use the web app →
                </Link>
                </div>

                {/* Rating/Stats */}
                <div className="flex flex-wrap justify-center gap-8 text-gray/90">
                <div className="flex items-center gap-2">
                    {/* {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                    ))} */}
                    <span className="ml-2 font-semibold">New on App Store</span>
                </div>
                <div>
                    <span className="font-semibold">Free to Use</span>
                </div>
                </div>
            </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50" id="features">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Everything You Need
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features designed to help you organize and share your memories effortlessly
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                <div 
                    key={index}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                    </p>
                </div>
                ))}
            </div>
            </div>
        </section>

        {/* Screenshots Section */}
        <section className="py-20 lg:py-32 bg-white" id="screenshots">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    See It In Action
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    A beautiful, intuitive interface that makes organizing photos a joy
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {screenshots.map((screenshot, index) => (
                        <div 
                            key={index}
                            className="group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all"
                        >
                            <div className="aspect-[9/16] bg-gradient-to-br from-blue-100 to-teal-100">
                                <img
                                    src={screenshot.src}
                                    alt={screenshot.alt}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <p className="text-white font-semibold text-lg">{screenshot.alt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 relative overflow-hidden" id="download">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                    Start Sharing Your Memories Today
                </h2>
                <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                    Join thousands of users who are already organizing and sharing their precious moments with Y ALBUM
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button 
                        onClick={() => router.push('/login')}
                        className="bg-white hover:bg-gray-100 text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-3"
                    >
                    Get Started
                    </button>
                    {/* <button className="bg-transparent border-2 border-white hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all">
                        Learn More
                    </button> */}
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center text-gray-400 text-sm">
                    <p>&copy; 2026 YALBUM. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>
  )
}