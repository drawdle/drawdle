import type { Metadata } from "next";
import "./globals.css";

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
	title: "Drawdle",
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
			<head>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
				/>

				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@100..800&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="font-playpen">{children}</body>
		</html>
	);
}
