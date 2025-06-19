'use client';
import dynamic from 'next/dynamic';
import {usePathname} from 'next/navigation';
const ThemeCustomization = dynamic(() => import('@/themes'), { ssr: false })
import Snackbar from '@/components/@extended/Snackbar';
import Notistack from '@/components/third-party/Notistack';
import MainLayout from '../MainLayout';
import "../../../styles/globals.css";
import Toast from '@/utils/Toast';
import { useEffect } from 'react';
import { alpha, Box, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MsalClientProvider from '../MsalClientProvider';
import { useMsal } from '@azure/msal-react';

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const theme = useTheme();
    const pathname = usePathname();
    const isAuthRoute = pathname === '/login' || pathname === '/logout' || pathname === '/petromin-auth' || pathname === '/unsubscribe';
    const { instance, accounts } = useMsal();
    // Special edge case.
    // once user lands on /dahboard or any other route but his token expires as this expires in 7 days.
    // so user will redirect to /login page/
    useEffect(() => {
        if (localStorage.getItem('token') && isAuthRoute) {
            if (pathname !== '/unsubscribe') {
                window.location.pathname = '/clients';
            }
        } 
        // eslint-disable-next-line
    }, []);
    
    return (
        <>
            <Toast/>
            {isAuthRoute ? (
                <ThemeCustomization>{children}</ThemeCustomization>
                ) : (

                        <ThemeCustomization>
                            <Notistack>
                                <MainLayout>
                                    <Snackbar/>
                                    {children}
                                </MainLayout>
                            </Notistack>
                        </ThemeCustomization>
                )
            }
        </>
    );
}
