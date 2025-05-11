'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, DollarSign, Share2, BarChart, Users, User, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserById } from '@/hooks/useUser';
import useAuthStore from '@/store/useAuthStore';
import LogoutModal from './modals/LogoutModal';

export default function Sidebar() {
    const pathname = usePathname();
    const { token, userId, userRole } = useAuthStore(state => state);
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const { data: user, isLoading } = useUserById(userId);
    const isAdmin = userRole === 'Admin';

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
        setIsOpen(false);
    }, [pathname]);

    if (isLoading) return (
        <div className="flex items-center justify-center h-screen bg-[#3d5a80]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e0fbfc]"></div>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="sm:hidden fixed top-2 right-2 z-50 bg-cyan-50 p-2 rounded shadow hover:bg-cyan-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                {!isOpen ? <Menu className="text-cyan-500" size={16} /> : <X className="text-cyan-500" size={16} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`text-sm text-gray-100 shadow-lg h-screen flex flex-col items-center p-4
                    transition-transform duration-300 z-40 fixed top-0 left-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 sm:w-64 rounded-r-[20px]`}
                style={{ 
                    backgroundColor: '#3d5a80',
                    backgroundImage: 'linear-gradient(to bottom, #3d5a80, #2c3e50)'
                }}
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-12">
                    <div className="flex items-center gap-2 bg-white/10 p-3 rounded-lg">
                        <img src="/images/BLWSDAI_logo.png" alt="Logo" className="w-10" />
                        <p className="font-bold text-[#e0fbfc] text-lg">BLWSDAI</p>
                    </div>
                </div>

                {/* User Info */}
                <div className="hidden sm:flex flex-col items-center text-center mb-8 w-full">
                    <div className="relative">
                        <img
                            src={`images/${userRole || 'Staff'}.png`}
                            alt="User"
                            className="w-24 h-24 rounded-full mb-3 border-4 border-[#8ecae6]/30"
                        />
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <p className="font-bold text-[#e0fbfc] text-lg">{user?.name || 'Admin Name'}</p>
                    <p className="text-[#8ecae6] text-sm capitalize px-3 py-1 rounded-full mt-1">{user?.role || 'Admin'}</p>
                </div>

                {/* Nav Items Wrapper */}
                <div className="flex-1 flex items-center gap-2 mb-15 w-full">
                    <nav className="flex flex-col w-full gap-y-2">
                        {navItems.map(({ href, label, icon }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                    ${pathname.startsWith(href) 
                                        ? 'bg-[#8ecae6] text-[#023047] font-bold shadow-md' 
                                        : 'hover:bg-[#8ecae6]/20 text-[#e0fbfc] hover:translate-x-1'}`}
                            >
                                <div className={`p-1.5 rounded-md ${pathname.startsWith(href) ? 'bg-[#023047]/10' : 'bg-[#8ecae6]/10'}`}>
                                    {icon}
                                </div>
                                <span className="ml-1">{label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Logout Button */}
                <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-all duration-200 hover:translate-x-1 bg-red-500/10 px-4 py-2 rounded-lg w-full justify-center"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </aside>

            <LogoutModal isOpen={isLogoutModalOpen} setIsOpen={setIsLogoutModalOpen} onLogout={logout} />
        </>
    );
}
