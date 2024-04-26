"use client";
import Image from "next/image";
import { NavBar } from "./components/navbar";
import Link from "next/link";

export default function Home() {
	return (
		<>
			<NavBar />
			<main className="flex flex-col justify-between items-center bg-beige-800 min-h-screen">
				<div
					id="header"
					className="flex flex-col justify-center items-center bg-beige-500 pt-16 w-full h-[70vh] min-h-[300px] transition-[translate,margin] duration-0"
				>
					<p className="text-5xl text-beige-900">Draw-dle</p>
					<p className="text-beige-700">Learn to draw by completing doodles</p>
					<button
						className="bg-beige-800 hover:bg-beige-700 mt-8 px-8 py-3 rounded-full text-2xl text-beige-300 transition-colors"
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
					className="top-[70vh] fixed bg-beige-200 w-full h-0 transition-[padding_top] duration-0"
					style={{
						paddingBottom: "0vh",
					}}
				></div>
				<div
					id="body"
					className="flex flex-col gap-2 px-16 py-12 w-full max-w-[860px] text-beige-100 transition-[translate,margin] duration-0"
				>
					<p className="text-2xl text-beige-200">About us</p>
					<p>lorem ipsum dolor sit amet </p>
				</div>
			</main>
		</>
	);
}
