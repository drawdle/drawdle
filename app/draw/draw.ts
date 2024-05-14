import * as PIXI from "pixi.js";

const app = new PIXI.Application();
app
	.init({
		background: 0x5b564d,
		resizeTo: document.getElementById("canvas-container") as HTMLDivElement,
		antialias: true,
	})
	.then(() => {
		document.getElementById("canvas-container")?.appendChild(app.canvas);
	});

const container = new PIXI.Container();
app.stage.addChild(container);

// create paper
const paper = new PIXI.Graphics();
paper.rect(-320, -240, 640, 480);
paper.fill({
	color: 0xffffff,
});
paper.position.set(window.innerWidth / 2, window.innerHeight / 2);
container.addChild(paper);
