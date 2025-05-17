import Providers from '@/components/Providers';
import './globals.css';
import { Toaster } from 'react-hot-toast';


export const metadata = {
    title: 'BLWSDAI',
    description: 'Water Billing and Management System',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#1f2937', // Tailwind gray-800
                                color: '#f9fafb',      // Tailwind gray-50
                                borderRadius: '0.5rem',
                                padding: '12px 16px',
                                fontSize: '14px',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10B981', // green-500
                                    secondary: '#ECFDF5',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#EF4444', // red-500
                                    secondary: '#FEE2E2',
                                },
                            },
                        }}
                    />

                </Providers>
            </body>
        </html>
    );
}
