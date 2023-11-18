"use client";
import React from "react";
import "../disableSwipeGesture.css";

/**
 * Clamp a value between a minimum and maximum bound.
 *
 * @param {number} x - The value to clamp.
 * @param {number} a - The minimum bound.
 * @param {number} b - The maximum bound.
 * @returns {number} - The clamped value.
 */
const clamp = (x, a, b) => Math.max(a, Math.min(x, b));

export default class DrawingCanvas extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tool: "Pan",
      toolbarGrabbing: false,
      /**
       * Callback function for toolbar move event.
       * @param {MouseEvent} e - The mouse event object.
       */
      toolbarMoveListenerCb: (e) => {
        if (this.state.toolbarRelPos == null) {
          // Update toolbarRelPos when it is null
          this.setState({
            toolbarRelPos: {
              x: this.state.toolbarPos.x - e.clientX,
              y: this.state.toolbarPos.y - e.clientY,
            },
          });
        } else {
          // Update toolbarPos when toolbarRelPos is not null
          this.setState({
            toolbarPos: {
              x: e.clientX + this.state.toolbarRelPos.x,
              y: e.clientY + this.state.toolbarRelPos.y,
            },
          });
        }

        // Add mouseup event listener to remove the move and reset toolbar position
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

  /**
   * Initializes the drawing canvas and sets up event handlers.
   */
  componentDidMount() {
    // Initialize the canvas
    this.canvas = document.getElementById("drawingCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight - 64;
    document.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight - 64;
      this.drawCanvas();
    });
    this.canvasProperties = {
      width: 720,
      height: 480,
      zoom: 1,
      offset: {
        x: 0,
        y: 0,
      },
    };
    this.canvasProperties.offset = {
      x: this.canvas.width / 2 - this.canvasProperties.width / 2,
      y: this.canvas.height / 2 - this.canvasProperties.height / 2,
    };

    // Add event listeners
    const handlePointerDown = (e) => {
      if (this.state.tool == "Pan") {
        this.canvas.isgrabbing = true;
      }
    };
    const handlePointerUp = (e) => {
      if (this.state.tool == "Pan") {
        this.canvas.isgrabbing = false;
      }
    };
    const handlePointerMove = (e) => {
      if (this.state.tool == "Pan") {
        if (this.canvas.isgrabbing) {
          this.canvasMove(e.movementX, e.movementY);
        }
      }
    };
    this.canvas.onpointerdown = handlePointerDown;
    this.canvas.onpointerup = handlePointerUp;
    this.canvas.onpointermove = handlePointerMove;

    this.drawCanvas();
  }

  drawCanvas() {
    // Clear the canvas
    this.ctx.fillStyle = "#2e2b26";
    this.ctx.fillRect(
      0,
      0,
      this.canvas.width * this.canvasProperties.zoom,
      this.canvas.height * this.canvasProperties.zoom
    );

    // Create paper
    this.withDropShadow(() => {
      this.ctx.fillStyle = "#fff";
      this.ctx.fillRect(
        0 + this.canvasProperties.offset.x,
        0 + this.canvasProperties.offset.y,
        this.canvasProperties.width * this.canvasProperties.zoom,
        this.canvasProperties.height * this.canvasProperties.zoom
      );
    });
  }

  canvasMove(x, y) {
    this.canvasProperties.offset.x += x;
    this.canvasProperties.offset.y += y;
    this.drawCanvas();
  }

  withDropShadow(cb) {
    // Save the original shadow properties
    const originalShadowColor = this.ctx.shadowColor;
    const originalShadowBlur = this.ctx.shadowBlur;
    const originalShadowOffsetX = this.ctx.shadowOffsetX;
    const originalShadowOffsetY = this.ctx.shadowOffsetY;

    // Set the new shadow properties
    this.ctx.shadowColor = "#0002";
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetX = 5;
    this.ctx.shadowOffsetY = 5;

    // Execute the callback function
    cb();

    // Restore the original shadow properties
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
