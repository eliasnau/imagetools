import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/providers";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CommandMenu } from "@/components/command-menu";
import { Topbar } from "@/components/topbar";
import NextTopLoader from "nextjs-toploader";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "imagetools",
	description: "imagetools",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<NextTopLoader showSpinner={false} />
				<ClerkProvider>
					<Providers>
						<SidebarProvider>
							<AppSidebar />
							<SidebarInset>
								<CommandMenu />
								<Topbar />
								{children}
							</SidebarInset>
						</SidebarProvider>
					</Providers>
				</ClerkProvider>
			</body>
		</html>
	);
}
