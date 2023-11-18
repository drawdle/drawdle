"use client";
import React from "react";
import DrawingCanvas from "../components/canvas";
import { NavBar } from "../components/navbar";

export default class Draw extends React.Component {
  componentDidMount() {
    if (new URL(window.location.href).searchParams.get("transition")) {
      window.history.pushState({}, "", "/draw");
      document.getElementById("canvasContainer").style.opacity = "0";
      document.getElementById("canvasContainer").style.transition =
        "opacity 450ms ease-in-out";
    }
    setTimeout(() => {
      document.getElementById("canvasContainer").style.opacity = "";
    });
  }
  render() {
    return (
      <>
        <NavBar />
        <main className="bg-beige-200 min-h-[100vh]">
          <div id="canvasContainer">
            <DrawingCanvas />
          </div>
        </main>
      </>
    );
  }
}
