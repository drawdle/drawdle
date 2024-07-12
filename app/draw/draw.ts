import * as PIXI from "pixi.js";
import { DropShadowFilter } from "pixi-filters";
import { Viewport } from "pixi-viewport";

type Tool = "brush" | "eraser" | "pan";
type PanMode = "pan-zoom" | "none";

const params = {
	tool: "brush",
	color: 0x000000,
	isPanning: false,
	brushSize: 1,
	eraserSize: 5,
};

let _setPanMode = (_: "pan-zoom" | "none") => {};
export function setPanMode(mode: "pan-zoom" | "none") {
	_setPanMode(mode);
}

const app = new PIXI.Application();
app
	.init({
		background: 0x5b564d,
		resizeTo: document.body,
		antialias: true,
		autoDensity: true,
		resolution: window.devicePixelRatio,
	})
	.then(() => {
		(document.getElementById("canvas-container") as HTMLDivElement).appendChild(
			app.canvas
		);

		const viewport = new Viewport({
			screenWidth: window.innerWidth,
			screenHeight: window.innerHeight,

			events: app.renderer.events,
			disableOnContextMenu: true,
			stopPropagation: true,
			passiveWheel: false,
			allowPreserveDragOutside: true,
		});
		app.stage.addChild(viewport);
		window.addEventListener("resize", () => {
			app.renderer.resize(window.innerWidth, window.innerHeight);
			viewport.resize(window.innerWidth, window.innerHeight);
		});
		document.addEventListener(
			"touchstart",
			(e) => {
				e.preventDefault();
			},
			{ passive: false }
		);
		main(viewport);
	});

function main(viewport: Viewport) {
	// viewport.drag({ factor: 0 }).pinch({ factor: 0 }).wheel({ percent: 0 });
	viewport.drag({ pressDrag: false }).pinch().wheel().decelerate();
	_setPanMode = (mode: "pan-zoom" | "none") => {
		if (mode === "pan-zoom") {
			viewport.drag().pinch().wheel().decelerate();
		} else {
			viewport.drag({ pressDrag: false }).pinch().wheel().decelerate();
		}
	};

	// pan and zoom
	const activePointers: number[] = [];
	viewport.on("touchstart", (e) => {
		activePointers.push(e.pointerId);
		if (activePointers.length >= 2) {
			params.isPanning = true;
		} else {
			params.isPanning = false;
		}
	});
	viewport.on("touchend", (e) => {
		activePointers.splice(activePointers.indexOf(e.pointerId), 1);
		if (activePointers.length >= 2) {
			params.isPanning = true;
		} else {
			params.isPanning = false;
		}
	});

	const container = new PIXI.Container();
	viewport.addChild(container);

	// create paper
	const paper = new PIXI.Graphics();
	paper.rect(-320, -240, 640, 480);
	paper.fill({
		color: 0xffffff,
	});
	paper.position.set(window.innerWidth / 2, window.innerHeight / 2);
	paper.filters = [
		new DropShadowFilter({
			color: 0x000000,
			alpha: 0.3,
			blur: 2,
			offset: { x: 5, y: 5 },
			quality: 10,
		}),
	];
	container.addChild(paper);

	// drawing
	const drawingLayer = new PIXI.Container();
	container.addChild(drawingLayer);
	const mask = new PIXI.Graphics().rect(-320, -240, 640, 480).fill(0xffffff);
	mask.position.set(window.innerWidth / 2, window.innerHeight / 2);
	drawingLayer.addChild(mask);
	drawingLayer.mask = mask;

	viewport.interactive = true;
	let isPointerDown = false;
	viewport.addEventListener("pointerdown", (e) => {
		if (params.isPanning) return;

		isPointerDown = true;
		if (["brush", "eraser"].includes(params.tool)) {
			drawingLayer.addChild(
				new PIXI.Graphics()
					.setStrokeStyle({
						color: params.color,
						cap: "round",
						join: "round",
						width:
							params.tool === "eraser" ? params.eraserSize : params.brushSize,
					})
					.moveTo(
						(e.clientX - viewport.x) / viewport.scale.x,
						(e.clientY - viewport.y) / viewport.scale.y
					)
			);
		}
	});
	viewport.addEventListener("pointerup", (e) => {
		isPointerDown = false;
	});
	viewport.on("pointermove", (e) => {
		if (params.isPanning) return;

		if (["brush", "eraser"].includes(params.tool) && isPointerDown) {
			const currentLine = drawingLayer.children.findLast(
				(c) => c instanceof PIXI.Graphics
			) as PIXI.Graphics;
			currentLine
				.lineTo(
					(e.clientX - viewport.x) / viewport.scale.x,
					(e.clientY - viewport.y) / viewport.scale.y
				)
				.stroke();
		}
	});
}

export function setTool(tool: Tool) {
	params.tool = tool;
	if (tool === "pan") {
		setPanMode("pan-zoom");
	}
	if (["brush", "eraser"].includes(tool)) {
		setPanMode("none");
		params.color = tool === "brush" ? 0x000000 : 0xffffff;
	}
}

export function setSize(size: number) {
	if (params.tool === "brush") {
		params.brushSize = size;
	} else if (params.tool === "eraser") {
		params.eraserSize = size;
	}
}

export interface DrawingCanvas {
	setTool: (tool: Tool) => void;
	setPanMode: (mode: PanMode) => void;
	setSize: (size: number) => void;
}
