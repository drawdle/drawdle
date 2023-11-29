"use client";
import React, { createRef } from "react";
import "../disableSwipeGesture.css";
import { clamp, mean } from "../utils/math";
import { Tooltip } from "react-tooltip";

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
              x:
                this.state.toolbarRef.current.style.left.replace("px", "") -
                e.clientX,
              y:
                this.state.toolbarRef.current.style.top.replace("px", "") -
                e.clientY,
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
                x: clamp(
                  this.state.toolbarPos.x,
                  4,
                  (typeof window != "undefined" ? window.innerWidth : 9999) -
                    257
                ),
                y: clamp(
                  this.state.toolbarPos.y,
                  68,
                  (typeof window != "undefined" ? window.innerHeight : 9999) -
                    52
                ),
              },
            });
          },
          { once: true }
        );
      },
      toolbarRelPos: null,
      toolbarPos: { x: 8, y: 74 },
      toolbarRef: createRef(),

      brushSize: 1,
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
    this.canvas.height = window.innerHeight - 64; // 64 is offset for navbar
    window.addEventListener("resize", () => {
      // Update toolbar position
      if (this.state.toolbarRef.current) {
        this.state.toolbarRef.current.style.top =
          clamp(this.state.toolbarPos.y, 68, window.innerHeight - 52) + "px";
        this.state.toolbarRef.current.style.left =
          clamp(this.state.toolbarPos.x, 4, window.innerWidth - 257) + "px";
      }

      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight - 64; // 64 is offset for navbar
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

    // Keep track of drawn lines
    this.lines = [];

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
        this.canvas.isGrabbing = true;
      } else if (this.state.tool == "Draw" || this.state.tool == "Erase") {
        this.canvas.isDrawing = true;
        this.lines.push({
          points: [
            this.translateClientToCanvas(e.clientX, e.clientY - 64), // 64 is offset for navbar height
          ],
          color: this.state.tool == "Erase" ? "#fff" : "#000",
          size: this.state.tool == "Erase" ? 10 : this.state.brushSize,
        });
      } else if (this.state.tool == "Line") {
        this.canvas.isDrawing = true;
        this.lines.push({
          points: [
            this.translateClientToCanvas(e.clientX, e.clientY - 64), // 64 is offset for navbar height
            this.translateClientToCanvas(e.clientX, e.clientY - 64), // same point write, 2nd point will be changed as mouse moves
          ],
          color: "#000",
          size: 1,
        });
      }
    };
    const handlePointerUp = (e) => {
      const index = this.activePointers.findIndex(
        (p) => p.pointerId === e.pointerId
      );
      this.activePointers.splice(index, 1);
      if (this.state.tool == "Pan" || this.canvas.isSpacePressed) {
        this.canvas.isGrabbing = false;
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
          if (this.canvas.isGrabbing) {
            this.canvasMove(e.movementX, e.movementY);
          }
        } else if (this.state.tool == "Draw" || this.state.tool == "Erase") {
          if (this.canvas.isDrawing) {
            this.lines[this.lines.length - 1].points.push(
              this.translateClientToCanvas(e.clientX, e.clientY - 64) // 64 is offset for navbar height
            );
            this.drawCanvas();
          }
        } else if (this.state.tool == "Line") {
          if (this.canvas.isDrawing) {
            // change 2nd point to current mouse position
            this.lines[this.lines.length - 1].points[1] =
              this.translateClientToCanvas(e.clientX, e.clientY - 64); // 64 is offset for navbar height
            this.drawCanvas();
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
            this.canvasSetZoom(this.canvasProperties.zoom * 1.006);
          }
          if (curDiff < this.activePointersDist) {
            // zoom out
            this.canvasSetZoom(this.canvasProperties.zoom / 1.006);
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
        if (e.key == "=" && e.key == "-") return e.preventDefault();

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
      } else {
        if (e.key == " ") {
          // space is code 32
          this.canvas.isSpacePressed = true;
          this.canvas.isDrawing = false;
          document.getElementById("drawingCanvas").style.cursor = this.canvas
            .isGrabbing
            ? "grabbing"
            : "grab";
        }

        // Shortcut for tools
        if (e.key == "m") {
          this.setState({ tool: "Pan" });
          this.canvas.isDrawing = false;
        } else if (e.key == "b") {
          this.setState({ tool: "Draw" });
          this.canvas.isGrabbing = false;
        }
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key == " ") {
        //space is code 32
        this.canvas.isSpacePressed = false;
        this.canvas.isGrabbing = false;
        document.getElementById("drawingCanvas").style.cursor = "";
      }
    });

    this.drawCanvas();
  }

  drawCanvas() {
    this.ctx.setTransform(
      this.canvasProperties.zoom,
      0,
      0,
      this.canvasProperties.zoom,
      (-(this.canvasProperties.zoom - 1) * this.canvas.width) / 2,
      (-(this.canvasProperties.zoom - 1) * this.canvas.height) / 2
    );

    // Clear the canvas
    this.ctx.save();
    this.ctx.resetTransform();
    this.ctx.fillStyle = "#2e2b26";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();

    // Create paper
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(
      this.canvasProperties.offset.x - this.canvasProperties.width / 2,
      this.canvasProperties.offset.y - this.canvasProperties.height / 2,
      this.canvasProperties.width,
      this.canvasProperties.height
    );

    // Draw lines
    this.ctx.lineCap = "round";
    for (let i = 0; i < this.lines.length; i++) {
      this.ctx.lineWidth = this.lines[i].size;
      this.ctx.strokeStyle = this.lines[i].color;
      this.ctx.beginPath();
      this.ctx.moveTo(
        this.lines[i].points[0].x + this.canvasProperties.offset.x,
        this.lines[i].points[0].y + this.canvasProperties.offset.y
      );
      for (let j = 1; j < this.lines[i].points.length; j++) {
        this.ctx.lineTo(
          this.lines[i].points[j].x + this.canvasProperties.offset.x,
          this.lines[i].points[j].y + this.canvasProperties.offset.y
        );
      }
      this.ctx.stroke();
    }

    // Remove lines that are outside of the paper
    this.ctx.fillStyle = "#2e2b26";
    this.ctx.fillRect(
      this.canvasProperties.offset.x - this.canvasProperties.width / 2 - 42000,
      -42000,
      42000,
      84000
    );
    this.ctx.fillRect(
      this.canvasProperties.offset.x + this.canvasProperties.width / 2,
      -42000,
      42000,
      84000
    );
    this.ctx.fillRect(
      -42000,
      this.canvasProperties.offset.y - this.canvasProperties.height / 2 - 42000,
      84000,
      42000
    );
    this.ctx.fillRect(
      -42000,
      this.canvasProperties.offset.y + this.canvasProperties.height / 2,
      84000,
      42000
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

  translateClientToCanvas(x, y) {
    var percentagePos = {
      x: x / this.canvas.width,
      y: y / this.canvas.height,
    };
    var canvasBounds = {
      x1:
        this.canvas.width -
        this.canvasProperties.offset.x -
        this.canvas.width / 2 / this.canvasProperties.zoom -
        this.canvas.width / 2,
      x2:
        this.canvas.width -
        this.canvasProperties.offset.x +
        this.canvas.width / 2 / this.canvasProperties.zoom -
        this.canvas.width / 2,
      y1:
        this.canvas.height -
        this.canvasProperties.offset.y -
        this.canvas.height / 2 / this.canvasProperties.zoom -
        this.canvas.height / 2,
      y2:
        this.canvas.height -
        this.canvasProperties.offset.y +
        this.canvas.height / 2 / this.canvasProperties.zoom -
        this.canvas.height / 2,
    };
    return {
      x:
        canvasBounds.x1 + percentagePos.x * (canvasBounds.x2 - canvasBounds.x1),
      y:
        canvasBounds.y1 + percentagePos.y * (canvasBounds.y2 - canvasBounds.y1),
    };
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
          className="flex justify-start items-center p-2 bg-beige-800 fixed text-beige-200 rounded-md gap-1 shadow-md"
          style={{
            left: clamp(
              this.state.toolbarPos.x,
              4,
              (typeof window != "undefined" ? window.innerWidth : 9999) - 257
            ), // 253 + 4
            top: clamp(
              this.state.toolbarPos.y,
              68,
              (typeof window != "undefined" ? window.innerHeight : 9999) - 52
            ), // 48 + 4
          }}
          ref={this.state.toolbarRef}
        >
          <Tooltip
            id="toolbar-tooltip"
            place="bottom"
            delayShow={500}
            style={{
              background: "#898272",
            }}
          />
          <div
            className={
              (this.state.toolbarGrabbing ? "cursor-grabbing" : "cursor-grab") +
              " select-none"
            }
            onMouseDown={(e) => {
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
              data-tooltip-id="toolbar-tooltip"
              data-tooltip-content={e.tooltip || e.text || ""}
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
              data-tooltip-id="toolbar-tooltip"
              data-tooltip-content={e.tooltip || e.text || ""}
            >
              <i className={e.icon}></i>
            </button>
          ))}
          <div className="border-l border-beige-700 h-8 w-0"></div>
          <input
            className="bg-beige-700 h-4 rounded-sm w-16 outline-none px-2 py-4 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            onChange={(e) => {
              this.setState({ brushSize: clamp(e.target.value, 1, 100) || 1 });
            }}
            type="number"
            min="1"
            max="100"
            value={clamp(this.state.brushSize, 1, 100) || 1}
          ></input>
        </div>
      </>
    );
  }
}
