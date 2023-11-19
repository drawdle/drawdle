"use client";
import React from "react";
import "../disableSwipeGesture.css";
import { clamp, mean } from "../utils/math";

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
    window.addEventListener("resize", () => {
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
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    };

    // Track multiple pointers
    this.activePointers = [];
    this.activePointersDist = -1;

    // Add event listeners
    document.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        if (e.ctrlKey) {
          this.canvasSetZoom(this.canvasProperties.zoom * (1 - e.deltaY / 300));
        } else {
          this.canvasMove(-e.deltaX / 2, -e.deltaY / 2);
        }
      },
      { passive: false }
    );
    const handlePointerDown = (e) => {
      this.activePointers.push(e);
      if (this.state.tool == "Pan" || this.canvas.isSpacePressed) {
        this.canvas.isgrabbing = true;
      }
    };
    const handlePointerUp = (e) => {
      const index = this.activePointers.findIndex(
        (p) => p.pointerId === e.pointerId
      );
      this.activePointers.splice(index, 1);
      if (this.state.tool == "Pan" || this.canvas.isSpacePressed) {
        this.canvas.isgrabbing = false;
      }
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
    const handlePointerMove = (e) => {
      // Find this event in the cache and update its record with this event
      const index = this.activePointers.findIndex(
        (p) => p.pointerId === e.pointerId
      );
      this.activePointers[index] = e;

      if (this.activePointers.length == 1) {
        if (this.state.tool == "Pan" || this.canvas.isSpacePressed) {
          if (this.canvas.isgrabbing) {
            this.canvasMove(e.movementX, e.movementY);
          }
        }
      }
      // If two pointers are down, check for pinch gestures
      else if (this.activePointers.length == 2) {
        // Calculate the distance between the two pointers
        const curDiff = Math.hypot(
          this.activePointers[0].clientX - this.activePointers[1].clientX,
          this.activePointers[0].clientY - this.activePointers[1].clientY
        );

        if (this.activePointersDist > 0) {
          if (curDiff > this.activePointersDist) {
            // zoom in
            this.canvasSetZoom(this.canvasProperties.zoom * 1.005);
          }
          if (curDiff < this.activePointersDist) {
            // zoom out
            this.canvasSetZoom(this.canvasProperties.zoom / 1.005);
          }
          // Pan
          this.canvasMove(
            mean([
              this.activePointers[0].movementX,
              this.activePointers[1].movementX,
            ]) / 2,
            mean([
              this.activePointers[0].movementY,
              this.activePointers[1].movementY,
            ]) / 2
          );
        }

        // Cache the distance for the next move event
        this.activePointersDist = curDiff;
      }
    };
    this.canvas.onpointerdown = handlePointerDown;
    this.canvas.onpointermove = handlePointerMove;
    this.canvas.onpointerup = handlePointerUp;
    // Variations of pointerup
    this.canvas.onpointerleave = handlePointerUp;
    this.canvas.onpointercancel = handlePointerUp;
    this.canvas.onpointerout = handlePointerUp;

    // ctrl -/+ shortcut for zoom
    // space for pan
    this.canvas.isSpacePressed = false;
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey) {
        if (e.key == "=") {
          e.preventDefault();
          let i = 0;
          var inter = setInterval(() => {
            this.canvasSetZoom(this.canvasProperties.zoom * 1.005);
            i++;
            if (i == 20) {
              clearInterval(inter);
            }
          });
        }
        if (e.key == "-") {
          e.preventDefault();
          let i = 0;
          var inter = setInterval(() => {
            this.canvasSetZoom(this.canvasProperties.zoom / 1.005);
            i++;
            if (i == 20) {
              clearInterval(inter);
            }
          });
        }
      }
      if (e.keyCode == 32) {
        // space is code 32
        this.canvas.isSpacePressed = true;
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.keyCode == 32) {
        //space is code 32
        this.canvas.isSpacePressed = false;
      }
    });

    this.drawCanvas();
  }

  drawCanvas() {
    // Clear the canvas
    this.ctx.fillStyle = "#2e2b26";
    this.ctx.fillRect(
      -this.canvas.width,
      -this.canvas.height,
      this.canvas.width * 4,
      this.canvas.height * 4
    );

    this.ctx.setTransform(
      this.canvasProperties.zoom,
      0,
      0,
      this.canvasProperties.zoom,
      (-(this.canvasProperties.zoom - 1) * this.canvas.width) / 2,
      (-(this.canvasProperties.zoom - 1) * this.canvas.height) / 2
    );

    // Create paper
    this.withDropShadow(() => {
      this.ctx.fillStyle = "#fff";
      this.ctx.fillRect(
        0 + this.canvasProperties.offset.x - this.canvasProperties.width / 2,
        0 + this.canvasProperties.offset.y - this.canvasProperties.height / 2,
        this.canvasProperties.width,
        this.canvasProperties.height
      );
    });

    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(
      0 + this.canvasProperties.offset.x,
      0 + this.canvasProperties.offset.y,
      20,
      20
    );
  }

  canvasMove(dx, dy) {
    this.canvasProperties.offset.x += dx / this.canvasProperties.zoom;
    this.canvasProperties.offset.y += dy / this.canvasProperties.zoom;
    this.drawCanvas();
  }

  canvasSetZoom(zoom) {
    zoom = clamp(zoom, 0.1, 10);
    this.canvasProperties.zoom = zoom;
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
                  this.canvasSetZoom(this.canvasProperties.zoom * 1.005);
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
                  this.canvasSetZoom(this.canvasProperties.zoom / 1.005);
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
