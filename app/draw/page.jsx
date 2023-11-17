import DrawingCanvas from "../components/canvas";
import { NavBar } from "../components/navbar";

export default function Draw() {
  return (
    <>
      <NavBar />
      <main className="bg-beige-900 min-h-[100vh]">
        <DrawingCanvas />
      </main>
    </>
  );
}
