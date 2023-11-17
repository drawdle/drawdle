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

    // https://codepen.io/chengarda/pen/wRxoyB
    this.canvas.onpointerdown = (e) => {
      this.canvas.isdragging = true;
    };
    this.canvas.onpointerup = (e) => {
      console.log(e);
      this.canvas.isdragging = false;
    };
    this.canvas.onpointermove = (e) => {
      if (this.state.tool == "Pan" && this.canvas.isdragging) {
        this.canvasMove(e.movementX, e.movementY);
      }
    };
    this.canvas.onscroll = (e) => {
      e.preventDefault();
      console.log(e);
      this.canvasSetZoom(e.deltaY / 100 + 1);
    };

    this.draw();
  }

  draw() {
    this.ctx.fillStyle = "#2e2b26";
    this.ctx.fillRect(
      0 - this.canvasProperties.offset.x,
      0 - this.canvasProperties.offset.y,
      this.canvas.width,
      this.canvas.height
    );
    this.ctx.fillStyle = "white";
    this.withDropShadow(() => {
      this.ctx.fillRect(
        this.canvas.width / 2 - this.canvasProperties.width / 2,
        this.canvas.height / 2 - this.canvasProperties.height / 2,
        this.canvasProperties.width,
        this.canvasProperties.height
      );
    });
  }

  canvasMove(x, y) {
    this.canvasProperties.offset.x += x;
    this.canvasProperties.offset.y += y;
    this.ctx.translate(x, y);
    this.draw();
  }

  canvasSetZoom(zoom) {
    this.canvasProperties.zoom = zoom;
    this.ctx.scale(zoom, zoom);
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
            {
              text: "Zoom",
              icon: "bi-zoom-in",
            },
            {
              text: "Zoom out",
              icon: "bi-zoom-out",
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
        </div>
      </>
    );
  }
}
