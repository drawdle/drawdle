import Link from "next/link";

export function NavBar() {
	return (
		<div className="top-0 left-0 z-50 fixed flex items-center gap-1 bg-beige-400 px-4 w-[100vw] h-16 text-beige-800">
			{[
				{
					link: "/draw",
					text: "Draw",
				},
				{
					link: "/",
					text: "Lesson",
				},
			].map((e, i) => (
				<Link
					key={i}
					href={e.link}
					className="bg-transparent hover:bg-[#0001] px-3 py-2 rounded-lg"
				>
					{e.text}
				</Link>
			))}
		</div>
	);
}
