'use client'

import { useMemo } from 'react';  // Import useMemo
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function Providers({ children }) {

    // Memoize the queryClient to avoid recreating it on every render
    const queryClient = useMemo(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
                cacheTime: 10 * 60 * 1000, // Cache time
            },
        },
    }), []);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
