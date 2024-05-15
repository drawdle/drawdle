"use client";
import { Component } from "react";

export default class Draw extends Component {
	componentDidMount() {
		require("./draw.ts");
	}
	render() {
		return (
			<main className="bg-beige-800 w-screen h-screen">
				<div id="canvas-container" className="w-full h-full" />
			</main>
		);
	}
}
