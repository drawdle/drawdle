import Image from "next/image";
import { NavBar } from "./components/navbar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="flex min-h-screen flex-col items-center justify-between bg-beige-800">
        <div className="bg-beige-400 h-[70vh] w-full flex items-center justify-center flex-col">
          <p className="text-5xl text-beige-900">Draw-dle</p>
          <p className="text-beige-700">Learn to draw by completing doodles</p>
          <Link href={"/draw"}>
            <button className="mt-8 rounded-full bg-beige-800 px-8 py-3 text-2xl text-beige-300">
              Start
            </button>
          </Link>
        </div>
        <div className="max-w-[860px] w-full flex flex-col gap-2 px-16 py-12 text-beige-100">
          <p className="text-2xl text-beige-200">About us</p>
          <p>lorem ipsum dolor sit amet </p>
        </div>
      </main>
    </>
  );
}
