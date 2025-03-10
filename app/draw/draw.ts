import * as PIXI from "pixi.js";
import { DropShadowFilter } from "pixi-filters";
import { Viewport } from "pixi-viewport";
import type { HexColor } from "@/utils/color";

type Tool = "brush" | "eraser" | "pan";
type PanMode = "pan-zoom" | "none";

const params = {
	tool: "brush",
	color: 0x000000,
	isPanning: false,
	brushSize: 1,
	eraserSize: 5,
};

const tension = 1; // bezier curve control point strength
const newPointThreshold = 4; // how far each point has to be from each other

type CanvasObjectsList = {
	points: { x: number; y: number }[];
	color: number;
	size: number;
	disabled: boolean;
	id: number;
}[];
const canvasObjects: CanvasObjectsList = [];
const originalCanvasObjectsPush = canvasObjects.push.bind(canvasObjects);
canvasObjects.push = (...args) => {
	canvasObjects.splice(
		0,
		canvasObjects.length,
		...canvasObjects.filter((c) => !c.disabled)
	);
	return originalCanvasObjectsPush(...args);
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
	let currentLinePoints: { x: number; y: number }[] = [];
	const drawingLayer = new PIXI.Container();
	container.addChild(drawingLayer);
	const mask = new PIXI.Graphics().rect(-320, -240, 640, 480).fill(0xffffff);
	mask.position.set(window.innerWidth / 2, window.innerHeight / 2);
	drawingLayer.addChild(mask);
	drawingLayer.mask = mask;

	const drawLine = () => {
		const line = drawingLayer.children.findLast(
			(c) => c instanceof PIXI.Graphics
		) as PIXI.Graphics;
		line.clear();
		line.moveTo(currentLinePoints[0].x, currentLinePoints[0].y);
		// https://stackoverflow.com/a/49371349
		for (let i = 1; i < currentLinePoints.length - 1; i++) {
			const p0 = i > 0 ? currentLinePoints[i - 1] : currentLinePoints[0];
			const p1 = currentLinePoints[i];
			const p2 = currentLinePoints[i + 1];
			const p3 =
				i !== currentLinePoints.length - 2 ? currentLinePoints[i + 2] : p2;

			const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
			const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;

			const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
			const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

			line.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
		}
		line.stroke();
	};

	viewport.interactive = true;
	let isPointerDown = false;
	viewport.addEventListener("pointerdown", (e) => {
		if (params.isPanning) return;

		isPointerDown = true;
		if (["brush", "eraser"].includes(params.tool)) {
			drawingLayer.addChild(
				new PIXI.Graphics().setStrokeStyle({
					color: params.color,
					cap: "round",
					join: "round",
					width:
						params.tool === "eraser" ? params.eraserSize : params.brushSize,
				})
			);
			const newLine = drawingLayer.children.findLast(
				(c) => c instanceof PIXI.Graphics
			) as PIXI.Graphics;
			currentLinePoints = [
				{
					x: (e.clientX - viewport.x) / viewport.scale.x,
					y: (e.clientY - viewport.y) / viewport.scale.y,
				},
			];
			canvasObjects.push({
				points: [],
				color: params.color,
				size: params.tool === "eraser" ? params.eraserSize : params.brushSize,
				disabled: false,
				id: newLine.uid,
			});
		}
	});
	let lastPoint = { x: 0, y: 0 };
	viewport.addEventListener("pointerup", (e) => {
		isPointerDown = false;
		if (!canvasObjects[canvasObjects.length - 1]) return;
		canvasObjects[canvasObjects.length - 1].points = currentLinePoints;
	});
	viewport.on("pointermove", (e) => {
		if (params.isPanning) return;
		if (
			// cursed hypotenuse distance approximation for small numbers
			0.7 *
				(Math.abs(lastPoint.x - e.clientX) +
					Math.abs(lastPoint.y - e.clientY)) <
			newPointThreshold
		) {
			return;
		}

		if (["brush", "eraser"].includes(params.tool) && isPointerDown) {
			lastPoint = { x: e.clientX, y: e.clientY };
			currentLinePoints.push({
				x: (e.clientX - viewport.x) / viewport.scale.x,
				y: (e.clientY - viewport.y) / viewport.scale.y,
			});
			drawLine();
		}
	});

	// undo
	undo = () => {
		const mostRecentObject = canvasObjects.findLast((c) => !c.disabled);
		if (!mostRecentObject) return;

		mostRecentObject.disabled = true;
		const pixiObject = drawingLayer.children.find(
			(c) => c.uid === mostRecentObject.id
		);
		if (!pixiObject) return;
		pixiObject.visible = false;
	};

	// redo
	redo = () => {
		const oldestDisabledObject = canvasObjects.find((c) => c.disabled);
		if (!oldestDisabledObject) return;

		oldestDisabledObject.disabled = false;
		const pixiObject = drawingLayer.children.find(
			(c) => c.uid === oldestDisabledObject.id
		);
		if (!pixiObject) return;
		pixiObject.visible = true;
	};
}
export let undo: () => void;
export let redo: () => void;

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

export function setColor(color: HexColor) {
	params.color = Number.parseInt(color.replaceAll("#", ""), 16);
}

export interface DrawingCanvas {
	setTool: (tool: Tool) => void;
	setPanMode: (mode: PanMode) => void;
	setSize: (size: number) => void;
	setColor(color: HexColor): void;

	undo: () => void;
	redo: () => void;
}
