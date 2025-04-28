'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore'; // Zustand store
import Sidebar from '@/components/Sidebar';

export default function ProtectedLayout({ children }) {
    const { token, userId } = useAuthStore(); // Access Zustand state
    const router = useRouter();

    const [hasMounted, setHasMounted] = useState(false); // Track client-side mount

    // Ensure code is only executed on the client
    useEffect(() => {
        setHasMounted(true); // Set to true when component is mounted on client
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (hasMounted && (!token || !userId)) {
            console.log('User is not authenticated, redirecting...');
            router.replace('/'); // Redirect to the login page if user is not authenticated
        }
    }, [hasMounted, token, userId, router]);

    // Only render the layout after mounting to avoid hydration issues
    if (!hasMounted) {
        return <div>Loading...</div>; // You can show a loading indicator until the component mounts
    }

    return (
        <div>
            <Sidebar />  {/* Render Sidebar */}
            <main className="flex-1 ml-0 sm:ml-64 transition-all duration-300">
                {children}   {/* Render the protected content */}
            </main>
        </div>
    );
}
