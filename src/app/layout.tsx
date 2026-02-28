import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ConvexClientProvider } from "./ConvexClientProvider";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Project Happy Home",
	manifest: "/manifest.json",
	icons: { icon: "/icon-192x192.png", apple: "/icon-192x192.png" },
};

export const viewport: Viewport = {
	themeColor: "#f9fafb",
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
	interactiveWidget: "resizes-content",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
	return (
		<html lang="fr">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<NuqsAdapter>
					<ConvexClientProvider>{children}</ConvexClientProvider>
				</NuqsAdapter>
			</body>
		</html>
	);
};

export default RootLayout;
