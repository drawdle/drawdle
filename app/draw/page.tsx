"use client";
import { Component } from "react";
import type { DrawingCanvas } from "./draw.ts";
import { LoadingSpinner } from "@/components/LoadingSpinner.tsx";

type IProps = Readonly<Record<string, unknown>>;
interface IState {
	isReady: boolean;
	drawingCanvas: DrawingCanvas | null;
}

export default class Draw extends Component<IProps, IState> {
	constructor() {
		super({});

		this.state = {
			isReady: false,
			drawingCanvas: null,
		};
	}
	async componentDidMount() {
		const drawingCanvas = await import("./draw.ts");
		this.setState({ drawingCanvas: drawingCanvas, isReady: true });
	}
	render() {
		return (
			<main className="bg-beige-800 w-screen h-screen text-beige-200">
				{!this.state.isReady && (
					<div className="top-0 right-0 bottom-0 left-0 fixed flex flex-col justify-center items-center gap-2 bg-beige-800 select-none">
						<LoadingSpinner n={10} />
						<p>Loading...</p>
					</div>
				)}
				<div id="canvas-container" className="w-full h-full" />
			</main>
		);
	}
}
