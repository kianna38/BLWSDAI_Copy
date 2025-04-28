import Providers from '@/components/Providers';
import './globals.css';

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
                </Providers>
            </body>
        </html>
    );
}
