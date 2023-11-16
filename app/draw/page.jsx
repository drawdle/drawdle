import { NavBar } from "../components/navbar";

export default function Draw() {
  return (
    <>
      <NavBar />
      <main className="bg-beige-800 min-h-[100vh]">
        <div></div>
        <canvas></canvas>
      </main>
    </>
  );
}
