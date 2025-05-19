'use client'; // Ensuring client-side behavior

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth'; // Import your custom useAuth hook
import useAuthStore from '@/store/useAuthStore'; // Import Zustand store
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useResetPassword } from '@/hooks/useUser';


export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const router = useRouter();
    const { resetPassword } = useResetPassword();

    const { login, loginLoading, loginError } = useAuth(); // Use the login mutation from useAuth
    const { token, userId } = useAuthStore(); // Access Zustand state

    const [hasMounted, setHasMounted] = useState(false); // Track if component has mounted

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        login({ email, password });
    };

    // Handle forgot password submission
    const handleForgotPassword = (e) => {
        e.preventDefault();
        setShowForgotPasswordModal(false);
    };

    // Redirect to dashboard if user is already logged in
    useEffect(() => {
        // Wait for the component to mount, then check if the user is logged in
        if (hasMounted && token && userId) {
            console.log('User is already logged in, redirecting to dashboard...');
            router.push('/dashboard');
        }
    }, [hasMounted, token, userId, router]);

    // Ensure the component is mounted before performing any client-side logic
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Handle redirect or show loading state
    if (loginLoading) {
        return <div>Loading...</div>; // Optionally, you can show a loading indicator
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left side with background image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <div
                    className="absolute inset-0 bg-cover bg-no-repeat bg-center"
                    style={{ backgroundImage: "url('/images/login_bg.png')" }}
                ></div>
            </div>

            {/* Right side with login form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-100">
                {/* System Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-[#023047] mb-8 text-center">
                    BLWSDAI Water Billing and Management System
                </h1>

                {/* Logo */}
                <div className="mb-8">
                    <Image 
                        src="/images/BLWSDAI_logo.png" 
                        alt="BLWSDAI Logo" 
                        width={200} 
                        height={200}
                        className="w-auto h-auto"
                    />
                </div>

                {/* Login Form */}
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">Login to your account</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@email.com"
                                className="mt-1 text-black bg-white placeholder:text-slate-400 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPasswordModal(true)}
                                    className="text-blue-600 text-sm hover:text-blue-800"
                                >
                                    Forgot?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="mt-1 text-black bg-white placeholder:text-slate-400 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-[#023047] transition disabled:opacity-50"
                            disabled={loginLoading}
                        >
                            {loginLoading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPasswordModal && (
                <div className="fixed inset-0 bg-slate-500/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <h3 className="text-2xl text-[#fb8500] font-semibold mb-4">Reset Password</h3>
                        <p className="text-sm text-gray-700 mb-4">
                            Enter your account email below. Your password will be reset to:
                            <br />
                            <span className="block font-medium mt-2">
                                <code>role.NameNoSpaces.email</code>
                            </span>
                            <br />
                            <strong className="block mt-2">
                                Example: <br />
                                Role: Admin, Name: Maria Clara, Email: clara@example.com
                            </strong>
                            <span className="block mt-1 text-green-700 font-semibold">
                                Password → <code>Admin.MariaClara.clara@example.com</code>
                            </span>
                        </p>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mb-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowForgotPasswordModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    resetPassword(email);
                                    setShowForgotPasswordModal(false);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-[#023047] transition"
                            >
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
