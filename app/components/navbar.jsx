import Link from "next/link";

export function NavBar() {
  return (
    <div className="fixed top-0 left-0 w-[100vw] items-center h-16 bg-beige-200 flex gap-1 px-4 text-beige-800">
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
