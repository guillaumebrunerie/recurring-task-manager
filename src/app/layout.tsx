import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata, Viewport } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ConvexClientProvider } from "./ConvexClientProvider";

import "./globals.css";

export const metadata: Metadata = {
	title: "Happy Home",
	manifest: "/manifest.json",
	icons: { icon: "/icon-base.png", apple: "/icon-base.png" },
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
			<body>
				<ConvexAuthNextjsServerProvider>
					<NuqsAdapter>
						<ConvexClientProvider>{children}</ConvexClientProvider>
					</NuqsAdapter>
				</ConvexAuthNextjsServerProvider>
			</body>
		</html>
	);
};

export default RootLayout;
