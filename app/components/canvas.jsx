"use client";
import React from "react";
import "../disableSwipeGesture.css";

const clamp = (x, a, b) => Math.max(a, Math.min(x, b));

export default class DrawingCanvas extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tool: "Pan",
      toolbarGrabbing: false,
      toolbarMoveListenerCb: (e) => {
        if (this.state.toolbarRelPos == null) {
          this.setState({
            toolbarRelPos: {
              x: this.state.toolbarPos.x - e.clientX,
              y: this.state.toolbarPos.y - e.clientY,
            },
          });
        } else {
          this.setState({
            toolbarPos: {
              x: e.clientX + this.state.toolbarRelPos.x,
              y: e.clientY + this.state.toolbarRelPos.y,
            },
          });
        }

        document.addEventListener(
          "mouseup",
          () => {
            document.removeEventListener(
              "mousemove",
              this.state.toolbarMoveListenerCb
            );
            this.setState({ toolbarGrabbing: false });
            this.setState({ toolbarRelPos: null });
            this.setState({
              toolbarPos: {
                x: clamp(this.state.toolbarPos.x, 4, window.innerWidth - 144),
                y: clamp(this.state.toolbarPos.y, 68, window.innerHeight - 52),
              },
            });
          },
          { once: true }
        );
      },
      toolbarRelPos: null,
      toolbarPos: { x: 8, y: 74 },
    };
  }

  componentDidMount() {
    // Initialize the canvas
    this.canvas = document.getElementById("drawingCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight - 64;
    this.canvasProperties = {
      width: 720,
      height: 480,
      zoom: 1,
      offset: {
        x: 0,
        y: 0,
      },
    };

    this.pointersList = [];
    this.pointersOldDist = -1;
    this.canvas.isdragging = false;

    this.pointerDownHandler = (e) => {
      if (this.state.tool == "Pan") this.canvas.isdragging = true;
      this.pointersList.push(e);
    };
    this.pointerUpHandler = (e) => {
      if (this.state.tool == "Pan") this.canvas.isdragging = false;

      // Remove the pointer from the list
      const index = this.pointersList.findIndex(
        (p) => p.pointerId == e.pointerId
      );
      this.pointersList.splice(index, 1);
    };
    this.pointerMoveHandler = (e) => {
      // Update the pointer ID inside the list
      const index = this.pointersList.findIndex(
        (p) => p.pointerId == e.pointerId
      );
      this.pointersList[index] = e;

      // Check if there is only 1 active pointer
      if (this.pointersList.length == 1) {
        if (this.canvas.isdragging) {
          this.canvasMove(e.movementX, e.movementY);
        }
      }
      // Check if there are 2 active pointers
      else if (this.pointersList.length == 2) {
        const distance = Math.hypot(
          this.pointersList[0].x - this.pointersList[1].x,
          this.pointersList[0].y - this.pointersList[1].y
        );

        if (this.pointersOldDist < distance) {
          this.canvasSetZoom(this.canvasProperties.zoom + 0.008);
        } else if (this.pointersOldDist > distance) {
          this.canvasSetZoom(this.canvasProperties.zoom - 0.008);
        }
        this.pointersOldDist = distance;
      }
    };
    this.canvas.onpointermove = this.pointerMoveHandler;
    this.canvas.onpointerdown = this.pointerDownHandler;
    // All the same thing (pretty much)
    this.canvas.onpointerup = this.pointerUpHandler;
    this.canvas.onpointerleave = this.pointerUpHandler;
    this.canvas.onpointerout = this.pointerUpHandler;
    this.canvas.onpointercancel = this.pointerUpHandler;

    this.draw();
  }

  // Update the canvas
  draw() {
    this.ctx.setTransform(
      this.canvasProperties.zoom,
      0,
      0,
      this.canvasProperties.zoom,
      this.canvasProperties.offset.x,
      this.canvasProperties.offset.y
    );

    // Clear the canvas
    this.ctx.fillStyle = "#2e2b26";
    this.ctx.fillRect(
      0 - this.canvasProperties.offset.x / this.canvasProperties.zoom,
      0 - this.canvasProperties.offset.y / this.canvasProperties.zoom,
      this.canvas.width / this.canvasProperties.zoom,
      this.canvas.height / this.canvasProperties.zoom
    );

    // Redraw the canvas paper
    this.ctx.fillStyle = "white";
    this.withDropShadow(() => {
      this.ctx.fillRect(
        (this.canvas.width / 2 - this.canvasProperties.width / 2) /
          this.canvasProperties.zoom,
        (this.canvas.height / 2 - this.canvasProperties.height / 2) /
          this.canvasProperties.zoom,
        this.canvasProperties.width,
        this.canvasProperties.height
      );
    });
  }

  canvasMove(x, y) {
    this.canvasProperties.offset.x += x;
    this.canvasProperties.offset.y += y;
    this.draw();
  }

  canvasSetZoom(zoom) {
    zoom = clamp(zoom, 0.1, 4);
    const deltaZoom = zoom - this.canvasProperties.zoom;
    this.canvasProperties.zoom = zoom;

    this.canvasProperties.offset.x +=
      (-deltaZoom * this.canvasProperties.width) / 2;
    this.canvasProperties.offset.y +=
      (-deltaZoom * this.canvasProperties.height) / 2;

    this.draw();
  }

  withDropShadow(cb) {
    const originalShadowColor = this.ctx.shadowColor;
    const originalShadowBlur = this.ctx.shadowBlur;
    const originalShadowOffsetX = this.ctx.shadowOffsetX;
    const originalShadowOffsetY = this.ctx.shadowOffsetY;
    this.ctx.shadowColor = "#0002";
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetX = 5;
    this.ctx.shadowOffsetY = 5;
    cb();
    this.ctx.shadowColor = originalShadowColor;
    this.ctx.shadowBlur = originalShadowBlur;
    this.ctx.shadowOffsetX = originalShadowOffsetX;
    this.ctx.shadowOffsetY = originalShadowOffsetY;
  }

  render() {
    return (
      <>
        <canvas
          id="drawingCanvas"
          className="fixed top-16 left-0"
          style={{
            // VERY IMPORTANT, CANVAS WILL NOT WORK ON TOUCHSCREEN OTHERWISE
            touchAction: "none",
          }}
        ></canvas>
        <div
          id="toolbar"
          className="flex justify-start items-center p-2 bg-beige-800 fixed text-beige-200 rounded-md gap-1"
          style={{
            top: clamp(this.state.toolbarPos.y, 68, window.innerHeight - 52),
            left: clamp(this.state.toolbarPos.x, 4, window.innerWidth - 144),
          }}
        >
          <div
            className={
              (this.state.toolbarGrabbing ? "cursor-grabbing" : "cursor-grab") +
              " select-none"
            }
            onMouseDown={(e) => {
              this.setState({
                toolbarRelPos: {
                  x: this.state.toolbarPos.x - e.clientX,
                  y: this.state.toolbarPos.y - e.clientY,
                },
              });
              this.setState({ toolbarGrabbing: true });
              this.setState({
                toolbarMoveListener: document.addEventListener(
                  "mousemove",
                  this.state.toolbarMoveListenerCb
                ),
              });
            }}
            onClick={() => {
              document.removeEventListener(
                "mousemove",
                this.state.toolbarMoveListenerCb
              );
              this.setState({ toolbarGrabbing: false });
            }}
          >
            <i className="bi-grip-vertical"></i>
          </div>
          {[
            {
              text: "Pan",
              icon: "bi-arrows-move",
            },
            {
              text: "Draw",
              icon: "bi-pencil",
            },
            {
              text: "Erase",
              icon: "bi-eraser",
            },
            {
              text: "Line",
              icon: "bi-slash-lg",
            },
          ].map((e, i) => (
            <button
              key={i}
              className={
                (this.state.tool == e.text
                  ? "bg-[#fff2] "
                  : "bg-transparent ") + "w-8 h-8 hover:bg-[#fff4] rounded"
              }
              onClick={() => {
                this.setState({ tool: e.text });
              }}
            >
              <i className={e.icon}></i>
            </button>
          ))}
          <div className="border-l border-beige-700 h-8 w-0"></div>
          {[
            {
              text: "Zoom",
              icon: "bi-zoom-in",
              onClick: () => {
                let i = 0;
                var inter = setInterval(() => {
                  this.canvasSetZoom(this.canvasProperties.zoom + 0.005);
                  i++;
                  if (i == 20) {
                    clearInterval(inter);
                  }
                });
              },
            },
            {
              text: "Zoom out",
              icon: "bi-zoom-out",
              onClick: () => {
                let i = 0;
                var inter = setInterval(() => {
                  this.canvasSetZoom(this.canvasProperties.zoom - 0.005);
                  i++;
                  if (i == 20) {
                    clearInterval(inter);
                  }
                });
              },
            },
          ].map((e, i) => (
            <button
              key={i}
              className={"w-8 h-8 hover:bg-[#fff4] rounded"}
              onClick={e.onClick}
            >
              <i className={e.icon}></i>
            </button>
          ))}
        </div>
      </>
    );
  }
}
