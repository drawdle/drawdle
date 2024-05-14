import type { Metadata } from "next";
import { Playpen_Sans } from "next/font/google";
import "./globals.css";

const playpen_sans = Playpen_Sans({ subsets: ["latin"] });

function generateMetadata({
	title,
	description,
	iconUrl,
}: Record<string, string>): Metadata {
	return {
		title: title,
		description: description,
		openGraph: {
			title: title,
			description: description,
			images: iconUrl,
		},
		twitter: {
			title: title,
			description: description,
			images: iconUrl,
		},
	};
}

export const metadata: Metadata = generateMetadata({
	title: "Draw-dle",
	description: "Learn to draw by completing scribbles",
	iconUrl: "/favicon.ico",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={playpen_sans.className}>{children}</body>
		</html>
	);
}
