import type { Metadata } from "next";
import "../../styles/globals.css";
import Favicon from '../../public/favicon.ico'
import DashboardLayout from "@/components/dahboard/layout";
import ClientProviders from "@/components/ClientProviders";
import MsalClientProvider from "@/components/MsalClientProvider";

/**
 * 2 types of metadata.
 * static: metadata: Metadata
 * dynamic: (generateMetadata) it is based on different routes, params etc.
 */
export const metadata: Metadata = {
    title: "Loyalty Management Admin",
    description: "Loyalty Management Admin Dashboard",
    // icons: {
    //     icon: '/favicon.ico'
    //     // icon: `https://po-cdn-nonprod.azureedge.net/b2cpages/favicon.ico`,
    // },
    icons: [
        { rel: "icon", url: Favicon.src },  // Primary favicon
    ],
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body>
          <ClientProviders>
            <MsalClientProvider>
                <DashboardLayout>{children}</DashboardLayout>
            </MsalClientProvider> 
          </ClientProviders>
        </body>
        </html>
    );
}