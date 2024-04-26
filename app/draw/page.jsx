"use client";
import React from "react";
import DrawingCanvas from "../components/canvas/canvas";
import { NavBar } from "../components/navbar";

import "./introTransition.css";

export default class Draw extends React.Component {
	componentDidMount() {
		if (new URL(window.location.href).searchParams.get("transition")) {
			window.history.pushState({}, "", "/draw");
			document
				.getElementById("canvasContainer")
				.classList.add("introTransition");
			document.querySelector("main").classList.add("introTransition");
		}
	}
	render() {
		return (
			<>
				<main className="bg-beige-200 h-[100vh]">
					<NavBar />
					<div id="canvasContainer">
						<DrawingCanvas />
					</div>
				</main>
			</>
		);
	}
}
