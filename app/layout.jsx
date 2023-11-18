import { Playpen_Sans } from "next/font/google";
import "./globals.css";

const playpen_sans = Playpen_Sans({ subsets: ["latin"], weight: "300" });

export const metadata = {
  title: "Draw-dle",
  description: "Learn to draw by completing doodles",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={playpen_sans.className}>{children}</body>
    </html>
  );
}
