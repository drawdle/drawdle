import Link from "next/link";
import "../globals.css";

import { Playpen_Sans } from "next/font/google";
import { NavBar } from "@/app/components/navbar";
const playpen_sans = Playpen_Sans({ subsets: ["latin"], weight: "300" });

export default function Custom404() {
	return (
		<>
			<main
				className={
					playpen_sans.className +
					" bg-beige-500 h-screen w-screen px-12 flex flex-col justify-center items-center select-none"
				}
			>
				<NavBar />
				<title>404 - Page not found - Drawdle</title>
				<p className="font-semibold text-7xl text-beige-900 text-center">404</p>
				<p className="text-beige-700 text-center text-xl">
					We couldn't find the page you were looking for
				</p>

				<Link
					href={"/"}
					className="flex gap-2 bg-beige-800 hover:bg-beige-700 mt-8 px-8 py-3 rounded-full text-beige-300 text-xl transition-colors"
				>
					<i className="bi bi-house"></i>
					<span>Go back to home</span>
				</Link>
			</main>
		</>
	);
}
