'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, DollarSign, Share2, BarChart, Users, User, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserById } from '@/hooks/useUser';  // Fixing the usage of useUser
import useAuthStore from '@/store/useAuthStore'; // Zustand store for auth state

export default function Sidebar() {
    const pathname = usePathname();
    const { token, userId, userRole } = useAuthStore(state => state); // Getting userId and token from Zustand
    const { logout } = useAuth(); // Use the logout mutation from useAuth
    const [isOpen, setIsOpen] = useState(false);

    // Using the useUser hook to fetch user data by userId
    const { data: user, isLoading } = useUserById(userId); // Replace with your correct hook to get user data

    const isAdmin = userRole === 'Admin'; // Check if the user is an admin

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
        { href: '/consumers', label: 'Consumers', icon: <Users size={20} /> },
        { href: '/readings', label: 'Readings', icon: <FileText size={20} /> },
        { href: '/billings_payment', label: 'Billings & Payment', icon: <DollarSign size={20} /> },
        { href: '/report', label: 'Report', icon: <BarChart size={20} /> },
        ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: <Users size={20} /> }] : []),
        { href: '/profile', label: 'Profile', icon: <User size={20} /> },
    ];

    useEffect(() => {
        setIsOpen(false); // Close sidebar when route (pathname) changes
    }, [pathname]);

    if (isLoading) return <div>Loading...</div>; // Show loading if user data is being fetched

    return (
        <>
            {/* Burger button for mobile view */}
            <button
                className="sm:hidden fixed top-2 right-2 z-50 bg-cyan-50 p-2 rounded shadow hover:bg-cyan-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                {!isOpen ? <Menu className="text-cyan-500" size={16} /> : <X className="text-cyan-500" size={16} />}
            </button>

            {/* Sidebar for all views */}
            <aside
                className={`bg-sky-200 text-sm text-gray-800 shadow-md h-screen flex flex-col items-center p-4
                    transition-transform duration-300 z-40 fixed top-0 left-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 sm:w-64`}
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-4">
                    <img src="/images/BLWSDAI_logo.png" alt="Logo" className="w-10 mb-2" />
                    <p className="font-bold">BLWSDAI</p>
                </div>

                {/* User Info */}
                <div className="hidden sm:flex flex-col items-center text-center mb-6">
                    <img
                        src={`images/${userRole || 'Staff'}.png`}
                        alt="User"
                        className="w-24 h-24 rounded-full mb-2"
                    />
                    <p className="font-bold">{user?.name || 'Admin Name'}</p>
                    <p className="text-blue-600 text-sm capitalize">{user?.role || 'Admin'}</p>
                </div>

                {/* Nav Items */}
                <div className="mt-10 sm:mt-1">
                    <nav className="w-full space-y-2 ">
                        {navItems.map(({ href, label, icon }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setIsOpen(false)} // Close sidebar when a link is clicked (for mobile view)
                                className={`flex items-center gap-3 px-10 sm:px-6 py-2 rounded-md transition 
                                    ${pathname.startsWith(href) ? 'bg-blue-500 text-white' : 'hover:bg-blue-200 text-gray-800'}
                                    ${pathname.startsWith(href) ? 'font-bold' : ''}  // Make active item bold
                                `}
                            >
                                {icon}
                                <span className="ml-2">{label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <button
                    onClick={logout}
                    className="mt-auto flex items-center gap-2 text-red-600 hover:text-red-800 transition mt-6"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>
        </>
    );
}
