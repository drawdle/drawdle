import Link from "next/link";

export default function Home() {
	return (
		<main className="flex flex-col justify-start items-stretch bg-beige-800 min-h-screen text-beige-200">
			<div className="flex flex-col justify-center items-center gap-3 bg-beige-500 h-96 text-beige-900">
				<h1 className="text-5xl">Drawdle</h1>
				<p>Learn to draw</p>
				<Link
					href={"/draw"}
					className="bg-beige-800 px-6 py-2 rounded-full text-beige-200 text-xl"
				>
					Start
				</Link>
			</div>
			<div className="flex flex-col justify-start items-start gap-4 p-24">
				<h2 className="text-2xl">Preview</h2>
				<img className="shadow-lg border border-beige-400 rounded-2xl" src="/preview.jpg" alt="Preview" />
			</div>
		</main>
	);
}
