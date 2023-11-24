import Link from "next/link";
import "../app/globals.css";

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
        <p className="text-7xl text-center text-beige-900 font-semibold">404</p>
        <p className="text-xl text-center text-beige-700">
          We couldn't find the page you were looking for
        </p>

        <Link
          href={"/"}
          className="mt-8 rounded-full bg-beige-800 hover:bg-beige-700 transition-colors px-8 py-3 text-xl text-beige-300 flex gap-2"
        >
          <i className="bi bi-house"></i>
          <span>Go back to home</span>
        </Link>
      </main>
    </>
  );
}
