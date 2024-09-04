"use client";
import { Component } from "react";
import Draggable from "react-draggable";

import type { DrawingCanvas } from "./draw.ts";
import { LoadingSpinner } from "@/components/LoadingSpinner.tsx";

type IProps = Readonly<Record<string, unknown>>;
interface IState {
	isReady: boolean;
	drawingCanvas: DrawingCanvas | null;
	currentTool: "brush" | "eraser" | "pan";
	brushSize: number;
	eraserSize: number;
}

export default class Draw extends Component<IProps, IState> {
	constructor() {
		super({});

		this.state = {
			isReady: false,
			drawingCanvas: null,
			currentTool: "brush",
			brushSize: 1,
			eraserSize: 5,
		};
	}
	async componentDidMount() {
		const drawingCanvas = await import("./draw.ts");
		this.setState({ drawingCanvas: drawingCanvas, isReady: true });
		drawingCanvas.setTool("brush");
	}
	render() {
		return (
			<main className="bg-beige-800 w-screen h-screen text-beige-200 select-none">
				{!this.state.isReady && (
					<div className="top-0 right-0 bottom-0 left-0 fixed flex flex-col justify-center items-center gap-2 bg-beige-800 select-none">
						<LoadingSpinner n={10} />
						<p>Loading...</p>
					</div>
				)}
				<div id="canvas-container" className="w-full h-full" />
				<Draggable
					handle=".handle"
					defaultPosition={{ x: 12, y: 12 }}
					defaultClassName="fixed top-0 left-0"
					bounds={{
						left: 12,
						right:
							(typeof window !== "undefined"
								? window.innerWidth -
								  (document.getElementById("toolbar")?.getBoundingClientRect()
										.width || 0)
								: Number.POSITIVE_INFINITY) - 12,
						top: 12,
						bottom:
							(typeof window !== "undefined"
								? window.innerHeight -
								  (document.getElementById("toolbar")?.getBoundingClientRect()
										.height || 0)
								: Number.POSITIVE_INFINITY) - 12,
					}}
				>
					<div
						id="toolbar"
						className="flex justify-stretch items-center gap-1 bg-beige-900 shadow-xl p-1 rounded-md min-w-20 h-10 text-beige-500 text-center text-xl"
					>
						<i className="bi-grip-vertical w-4 cursor-move bi handle" />
						{[
							{
								name: "Brush",
								icon: "bi-brush",
								tool: "brush",
								onClick: () => {
									this.state.drawingCanvas?.setTool("brush");
									this.setState({ currentTool: "brush" });
								},
							},
							{
								name: "Eraser",
								icon: "bi-eraser",
								tool: "eraser",
								onClick: () => {
									this.state.drawingCanvas?.setTool("eraser");
									this.setState({ currentTool: "eraser" });
								},
							},
							{
								name: "Move",
								icon: "bi-arrows-move",
								tool: "pan",
								onClick: () => {
									this.state.drawingCanvas?.setTool("pan");
									this.setState({ currentTool: "pan" });
								},
							},
						].map(({ name, icon, tool, onClick }) => (
							<button
								key={name}
								type="button"
								onPointerDown={onClick}
								className="bg-transparent hover:bg-[#fff4_!important] rounded-md w-8 h-8 transition-colors"
								style={{
									background: this.state.currentTool === tool ? "#fff2" : "",
								}}
							>
								<i key={name} className={`bi ${icon}`} />
							</button>
						))}
						{["brush", "eraser"].includes(this.state.currentTool) && (
							<div className="flex gap-0.5">
								<div className="mr-0.5 border-beige-800 border-l h-6 self-center" />
								<button
									type="button"
									className="hover:bg-beige-800 rounded-md w-8 h-8"
									onClick={() => {
										const s = Math.min(
											100,
											Math.max(
												1,
												this.state.currentTool === "eraser"
													? this.state.eraserSize
													: this.state.brushSize - 1
											)
										);
										this.state.currentTool === "eraser"
											? this.setState({ eraserSize: s })
											: this.setState({ brushSize: s });
										this.state.drawingCanvas?.setSize(s);
									}}
								>
									-
								</button>
								<input
									type="number"
									className="bg-beige-800 border border-transparent focus:border-beige-700 rounded-md w-10 text-center text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
									value={
										this.state.currentTool === "eraser"
											? this.state.eraserSize
											: this.state.brushSize
									}
									onChange={(e) => {
										if (Number.parseInt(e.target.value) > 0) {
											const s = Math.min(
												100,
												Math.max(1, Number.parseInt(e.target.value))
											);
											this.state.currentTool === "eraser"
												? this.setState({ eraserSize: s })
												: this.setState({ brushSize: s });

											this.state.drawingCanvas?.setSize(s);
										}
									}}
								/>
								<button
									type="button"
									className="hover:bg-beige-800 rounded-md w-8 h-8"
									onClick={() => {
										const s = Math.min(
											100,
											Math.max(1, this.state.brushSize + 1)
										);
										this.state.currentTool === "eraser"
											? this.setState({ eraserSize: s })
											: this.setState({ brushSize: s });
										this.state.drawingCanvas?.setSize(s);
									}}
								>
									+
								</button>
							</div>
						)}
						{this.state.currentTool === "brush" && (
							<div className="flex gap-0.5">
								<div className="mr-0.5 border-beige-800 border-l h-6 self-center" />
								<button
									type="button"
									className="bg-black mx-1.5 rounded-full w-7 h-7"
								/>
							</div>
						)}
					</div>
				</Draggable>
			</main>
		);
	}
}
