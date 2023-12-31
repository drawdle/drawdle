"use client";
import Image from "next/image";
import { NavBar } from "./components/navbar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="flex min-h-screen flex-col items-center justify-between bg-beige-800">
        <div
          id="header"
          className="transition-[translate,margin] duration-0 bg-beige-500 h-[70vh] min-h-[300px] w-full pt-16 flex items-center justify-center flex-col"
        >
          <p className="text-5xl text-beige-900">Draw-dle</p>
          <p className="text-beige-700">Learn to draw by completing doodles</p>
          <button
            className="mt-8 rounded-full bg-beige-800 hover:bg-beige-700 transition-colors px-8 py-3 text-2xl text-beige-300"
            onClick={() => {
              document.body.style.overflow = "hidden";
              document.getElementById("transition").style.transitionDuration =
                "1000ms";
              document.getElementById("header").style.transitionDuration =
                "1000ms";
              document.getElementById("body").style.transitionDuration =
                "1000ms";

              document.getElementById("transition").style.paddingBottom =
                "120vh";
              document.getElementById("transition").style.top = "-10vh";
              document.getElementById("header").style.translate = "0 -70vh";
              document.getElementById("header").style.marginBottom = "-70vh";
              document.getElementById("body").style.translate = "0 30vh";
              document.getElementById("body").style.marginBottom = "-30vh";
              setTimeout(() => {
                try {
                  document.getElementById("drawLink").click();
                } catch {}
              }, 1000);
            }}
          >
            Start
            <Link id="drawLink" href={"/draw?transition=1"}></Link>
          </button>
        </div>
        <div
          id="transition"
          className="transition-[padding_top] duration-0 w-full h-0 fixed top-[70vh] bg-beige-200"
          style={{
            paddingBottom: "0vh",
          }}
        ></div>
        <div
          id="body"
          className="transition-[translate,margin] duration-0 max-w-[860px] w-full flex flex-col gap-2 px-16 py-12 text-beige-100"
        >
          <p className="text-2xl text-beige-200">About us</p>
          <p>lorem ipsum dolor sit amet </p>
        </div>
      </main>
    </>
  );
}
