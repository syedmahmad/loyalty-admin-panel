'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store';

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <AppRouterCacheProvider>
            <ReduxProvider store={store}>
                {children}
            </ReduxProvider>
        </AppRouterCacheProvider>
    );
};

export default ClientProviders;