import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Project Happy Home",
	manifest: "/manifest.json",
	icons: {
		icon: "/icon-192.png",
		apple: "/icon-192.png",
	},
};

// export const viewport: Viewport = {
// 	themeColor: "#4f46e5",
// };

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
	return (
		<html lang="fr">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<ConvexClientProvider>{children}</ConvexClientProvider>
			</body>
		</html>
	);
};

export default RootLayout;
