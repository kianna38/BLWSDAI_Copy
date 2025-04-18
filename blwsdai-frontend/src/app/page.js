'use client'; // Ensuring client-side behavior

import { useState } from 'react';
import Image from 'next/image';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle your login logic here (e.g., Firebase Auth, API call)
    };

    return (
        <div className="flex min-h-screen bg-cover bg-no-repeat bg-center relative" style={{ backgroundImage: "url('/images/login_bg.png')" }}>
            {/* Centering the entire content */}
            <div className="flex justify-center items-center my-auto h-full w-full relative z-10">
                <div className="bg-slate-100/80 p-8 rounded-lg shadow-lg max-w-2xl w-full flex items-center justify-between">
                    {/* Logo on the left */}
                    <div className="flex justify-center items-center">
                        <Image src="/images/BLWSDAI_logo.png" alt="BLWSDAI Logo" width={500} height={500} />
                    </div>

                    {/* Form on the right */}
                    <div className="flex flex-col w-full ml-6">
                        <h2 className="text-left text-2xl font-semibold mb-4 text-gray-700">Login to your account</h2>
                        <form onSubmit={handleSubmit} className="w-full">
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    className="bg-slate-100/80 placeholder:text-slate-300 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-6">
                                <div className='flex justify-between'>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <a href="#" className="text-blue-600 text-sm hover:text-blue-800">Forgot?</a>
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="bg-slate-100/80  placeholder:text-slate-300 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-between items-center mb-6">
                                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                                    Login now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
