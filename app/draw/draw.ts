import * as PIXI from "pixi.js";
import { DropShadowFilter } from "pixi-filters";
import { Viewport } from "pixi-viewport";

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
		viewport.drag().pinch().wheel().decelerate();
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
}
