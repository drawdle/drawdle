"use client";
import { Component, createRef, useState, type RefObject } from "react";
import Draggable from "react-draggable";

import type { DrawingCanvas } from "./draw.ts";
import { LoadingSpinner } from "@/components/LoadingSpinner.tsx";
import { ColorPicker } from "@/components/ColorPicker.tsx";
import type { HexColor } from "@/utils/color.ts";
import {
    ArrowLeft,
	ArrowRight,
	Brush,
	Eraser,
	Film,
	GripVertical,
	Move,
	Redo,
	Save,
	Undo,
	X,
} from "lucide-react";

type ITool = "brush" | "eraser" | "pan";

type IProps = Readonly<Record<string, unknown>>;
interface IState {
	isReady: boolean;
	drawingCanvas: DrawingCanvas | null;
	currentTool: ITool;
	brushSize: number;
	eraserSize: number;

	showColorPicker: boolean;
	color: HexColor;

	showTutorial: boolean;
}

export default class Draw extends Component<IProps, IState> {
	toolbarRef: RefObject<HTMLDivElement | null>;
	keydownHandler?: (event: KeyboardEvent) => void;
	keyupHandler?: (event: KeyboardEvent) => void;

	toolBeforePan: ITool = "brush";

	constructor(props: IProps) {
		super(props);

		this.state = {
			isReady: false,
			drawingCanvas: null,
			currentTool: "brush",
			brushSize: 1,
			eraserSize: 5,

			showColorPicker: false,
			color: "#000000",

			showTutorial: false,
		};

		this.toolbarRef = createRef<HTMLDivElement>();
	}
	async componentDidMount(): Promise<void> {
		const drawingCanvas = await import("./draw.ts");
		this.setState({ drawingCanvas: drawingCanvas, isReady: true });
		drawingCanvas.setTool("brush");

		let prevKey = {
			ctrlKey: false,
			code: "",
		};
		this.keydownHandler = (e) => {
			if (e.code === prevKey.code && e.ctrlKey === prevKey.ctrlKey) return;
			prevKey = { ctrlKey: e.ctrlKey, code: e.code };

			if (e.ctrlKey) {
				switch (e.code) {
					case "KeyZ":
						drawingCanvas.undo();
						break;
					case "KeyY":
						drawingCanvas.redo();
						break;
				}
				return;
			}
			switch (e.code) {
				case "Space":
					this.toolBeforePan = this.state.currentTool;
					this.setState({ currentTool: "pan" });
					drawingCanvas.setTool("pan");
					break;
				case "KeyB":
					drawingCanvas.setTool("brush");
					break;
				case "KeyE":
					drawingCanvas.setTool("eraser");
					break;
			}
		};
		this.keyupHandler = (e) => {
			prevKey = {
				ctrlKey: false,
				code: "",
			};

			switch (e.code) {
				case "Space":
					drawingCanvas.setTool(this.toolBeforePan);
					this.setState({ currentTool: this.toolBeforePan });
					break;
			}
		};

		window.addEventListener("keydown", this.keydownHandler);
		window.addEventListener("keyup", this.keyupHandler);
	}
	componentWillUnmount(): void {
		if (this.keydownHandler) {
			window.removeEventListener("keydown", this.keydownHandler);
		}
        if (this.keyupHandler) {
            window.removeEventListener("keyup", this.keyupHandler);
        }
	}

	async saveDrawing() {
		if (this.state.drawingCanvas?.getLines().length === 0) {
			return;
		}
		await fetch("/api/save", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			// Stringify this only ONCE
			body: JSON.stringify({
				data: JSON.stringify(this.state.drawingCanvas?.getLines()),
			}),
		});
	}

	render() {
		return (
			<>
				<main className="bg-beige-800 w-screen h-screen text-beige-200 select-none">
					{!this.state.isReady && (
						<div className="top-0 right-0 bottom-0 left-0 fixed flex flex-col justify-center items-center gap-2 bg-beige-800 select-none">
							<LoadingSpinner n={10} />
							<p>Loading...</p>
						</div>
					)}
					<div id="canvas-container" className="w-full h-full" />
					<Draggable
						offsetParent={
							typeof document !== "undefined" ? document.body : undefined
						}
						nodeRef={this.toolbarRef as RefObject<HTMLElement>}
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
							className="flex justify-stretch items-center gap-1 bg-beige-900 shadow-xl p-1 rounded-md min-w-20 h-10 text-beige-500 text-xl text-center select-none"
							ref={this.toolbarRef}
						>
							<GripVertical className="w-4 cursor-move handle" />
							<button
								type="button"
								onClick={() => {
									this.saveDrawing();
								}}
								className="flex justify-center items-center bg-transparent hover:bg-[#fff4_!important] rounded-md w-8 h-8 transition-colors"
							>
								<Save size={20} />
							</button>
							<button
								type="button"
								onClick={() => {
									this.setState({ showTutorial: !this.state.showTutorial });
								}}
								className="flex justify-center items-center bg-transparent hover:bg-[#fff4_!important] rounded-md w-8 h-8 transition-colors"
							>
								<Film size={20} />
							</button>
							<div className="border-beige-800 border-l h-6" />
							{[
								{
									name: "Undo",
									icon: Undo,
									onClick: () => {
										this.state.drawingCanvas?.undo();
									},
								},
								{
									name: "Redo",
									icon: Redo,
									onClick: () => {
										this.state.drawingCanvas?.redo();
									},
								},
							].map(({ name, icon, onClick }) => {
								const Icon = icon;
								return (
									<button
										key={name}
										type="button"
										onPointerDown={onClick}
										className="flex justify-center items-center bg-transparent hover:bg-[#fff4_!important] rounded-md w-8 h-8 transition-colors"
									>
										<Icon key={name} size={20} />
									</button>
								);
							})}
							<div className="border-beige-800 border-l h-6" />
							{[
								{
									name: "Brush",
									icon: Brush,
									tool: "brush" as ITool,
									onClick: () => {
										this.state.drawingCanvas?.setTool("brush");
										this.setState({ currentTool: "brush" });
									},
								},
								{
									name: "Eraser",
									icon: Eraser,
									tool: "eraser" as ITool,
									onClick: () => {
										this.state.drawingCanvas?.setTool("eraser");
										this.setState({ currentTool: "eraser" });
									},
								},
								{
									name: "Move",
									icon: Move,
									tool: "pan" as ITool,
									onClick: () => {
										this.state.drawingCanvas?.setTool("pan");
										this.setState({ currentTool: "pan" });
									},
								},
							].map(({ name, icon, tool, onClick }) => {
								const Icon = icon;
								return (
									<button
										key={name}
										type="button"
										onPointerDown={() => {
											onClick();
											if (tool !== "pan") {
												this.toolBeforePan = tool;
											}
										}}
										className="flex justify-center items-center bg-transparent hover:bg-[#fff4_!important] rounded-md w-8 h-8 transition-colors"
										style={{
											background:
												this.state.currentTool === tool ? "#fff2" : "",
										}}
									>
										<Icon key={name} size={20} />
									</button>
								);
							})}
							{["brush", "eraser"].includes(this.state.currentTool) && (
								<div className="flex gap-0.5">
									<div className="self-center mr-0.5 border-beige-800 border-l h-6" />
									<button
										type="button"
										className="hover:bg-beige-800 rounded-md w-8 h-8"
										onClick={() => {
											const s = Math.min(
												100,
												Math.max(
													1,
													(this.state.currentTool === "eraser"
														? this.state.eraserSize
														: this.state.brushSize) - 1
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
										className="bg-beige-800 border border-transparent focus:border-beige-700 rounded-md outline-hidden w-10 text-sm text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
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
												Math.max(
													1,
													(this.state.currentTool === "eraser"
														? this.state.eraserSize
														: this.state.brushSize) + 1
												)
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
									<div className="self-center mr-0.5 border-beige-800 border-l h-6" />
									<button
										type="button"
										className="mx-1.5 rounded-full w-7 h-7"
										style={{
											background: this.state.color,
										}}
										onClick={() => {
											this.setState({ showColorPicker: true });
										}}
									/>
								</div>
							)}
						</div>
					</Draggable>
				</main>
				{this.state.showColorPicker && (
					<ColorPicker
						color={this.state.color}
						updateColor={(color) => {
							this.setState({ color: color });
							this.state.drawingCanvas?.setColor(color);
						}}
						onClose={() => this.setState({ showColorPicker: false })}
						visible={this.state.showColorPicker}
					/>
				)}
				<TutorialPane
					show={this.state.showTutorial}
					onClose={() => this.setState({ showTutorial: false })}
				/>
			</>
		);
	}
}

const tutorials = [
	{
		name: "Color theory",
		id: "E918sCkgSRU",
		description:
			"In this video, you will learn how to use colors in your drawings to make them more appealing. You will learn about the color wheel, complementary colors, and how to create a color palette.",
	},
];
const TutorialPane = ({
	show,
	onClose,
}: {
	show: boolean;
	onClose: () => void;
}) => {
	const [currentPage, setCurrentPage] = useState(0);

	return (
		<div
			className="top-0 right-0 bottom-0 fixed flex flex-col gap-3 bg-beige-900 shadow-2xl p-4 rounded-l-4xl w-96 text-beige-200 transition-all duration-300"
			style={{
				opacity: show ? 1 : 0,
				translate: show ? "0 0" : "100% 0",
			}}
		>
			<button
				type="button"
				className="top-4 right-4 absolute bg-beige-800 p-2 rounded-lg text-beige-200 text-xl"
				onClick={onClose}
			>
				<X size={20} />
			</button>
			<h1 className="p-2 text-xl">{tutorials[currentPage].name}</h1>
			<iframe
				className="rounded-xl w-full aspect-video"
				src={`https://www.youtube-nocookie.com/embed/${tutorials[currentPage].id}`}
				title="YouTube video player"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				referrerPolicy="strict-origin-when-cross-origin"
				allowFullScreen
			/>
			<p className="p-2 text-sm">{tutorials[currentPage].description}</p>

            <div className="grow" />

			<div className="flex justify-stretch items-center gap-2 opacity-50 p-2 w-full">
				<button
					type="button"
					className="flex justify-start items-center gap-2 bg-beige-800 px-4 py-2 rounded-xl w-1/2 text-beige-200"
					onClick={() => {}}
				>
					<ArrowLeft size={20} />
					Previous
				</button>
				<button
					type="button"
					className="flex justify-end items-center gap-2 bg-beige-800 px-4 py-2 rounded-xl w-1/2 text-beige-200"
					onClick={() => {}}
				>
					Next
					<ArrowRight size={20} />
				</button>
			</div>
		</div>
	);
};
