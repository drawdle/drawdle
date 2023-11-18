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
    this.lines = [
      [
        { x: 0, y: 0 },
        { x: 1, y: 2 },
        { x: 30, y: 40 },
      ],
    ];

    /**
     * Handles the pointer down event.
     * @param {Event} e - The pointer down event object.
     */
    this.pointerDownHandler = (e) => {
      if (this.state.tool == "Pan") {
        this.canvas.isdragging = true;
      } else if (this.state.tool == "Draw") {
        this.canvas.isdrawing = true;
        this.lines.push([]);

        this.lines[this.lines.length - 1].push({
          x: (e.clientX - this.canvas.width / 2) / this.canvasProperties.zoom,
          y:
            (e.clientY - 64 - this.canvas.height / 2) /
            this.canvasProperties.zoom,
        });
        this.draw();
      }
      this.pointersList.push(e);
    };
    /**
     * Handles the pointer up event.
     * @param {Event} e - The pointer up event object.
     */
    this.pointerUpHandler = (e) => {
      if (this.state.tool === "Pan") {
        this.canvas.isdragging = false;
      } else if (this.state.tool == "Draw") {
        this.canvas.isdrawing = false;
      }

      // Find the index of the pointer in the pointersList
      const index = this.pointersList.findIndex(
        (p) => p.pointerId === e.pointerId
      );

      // Remove the pointer from the pointersList
      this.pointersList.splice(index, 1);
    };
    /**
     * Handles the pointer move event.
     * @param {Event} e - The pointer move event object.
     */
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
        } else if (this.canvas.isdrawing) {
          this.lines[this.lines.length - 1].push({
            x: (e.clientX - this.canvas.width / 2) / this.canvasProperties.zoom,
            y:
              (e.clientY - 64 - this.canvas.height / 2) /
              this.canvasProperties.zoom,
          });
          this.draw();
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

  /**
   * Updates the canvas by redrawing its contents.
   */
  draw() {
    // Set the transformation matrix
    this.ctx.setTransform(
      this.canvasProperties.zoom, // scale x
      0, // shear y
      0, // shear x
      this.canvasProperties.zoom, // scale y
      this.canvasProperties.offset.x, // translate x
      this.canvasProperties.offset.y // translate y
    );

    // Clear the canvas
    this.ctx.fillStyle = "#2e2b26"; // set fill color to dark gray
    this.ctx.fillRect(
      0 - this.canvasProperties.offset.x / this.canvasProperties.zoom, // x coordinate of top-left corner
      0 - this.canvasProperties.offset.y / this.canvasProperties.zoom, // y coordinate of top-left corner
      this.canvas.width / this.canvasProperties.zoom, // width of rectangle
      this.canvas.height / this.canvasProperties.zoom // height of rectangle
    );

    // Redraw the canvas paper
    this.ctx.fillStyle = "white"; // set fill color to white
    this.withDropShadow(() => {
      this.ctx.fillRect(
        this.canvas.width / 2 - this.canvasProperties.width / 2, // x coordinate of top-left corner
        this.canvas.height / 2 - this.canvasProperties.height / 2, // y coordinate of top-left corner
        this.canvasProperties.width, // width of rectangle
        this.canvasProperties.height // height of rectangle
      );
    });

    this.ctx.fillRect(0, 0, 20, 20);

    // Redraw the lines
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    this.lines.forEach((line) => {
      this.ctx.beginPath();
      this.ctx.moveTo(line[0].x + cx, line[0].y + cy);
      for (let i = 1; i < line.length; i++) {
        this.ctx.lineTo(line[i].x + cx, line[i].y + cy);
      }
      this.ctx.stroke();
    });
  }

  /**
   * Moves the canvas by the given x and y coordinates.
   *
   * @param {number} x - The amount to move the canvas horizontally.
   * @param {number} y - The amount to move the canvas vertically.
   */
  canvasMove(x, y) {
    // Update the x and y offset of the canvas properties
    this.canvasProperties.offset.x += x;
    this.canvasProperties.offset.y += y;

    // Redraw the canvas
    this.draw();
  }

  /**
   * Set the zoom level of the canvas.
   * @param {number} zoom - The new zoom level.
   */
  canvasSetZoom(zoom) {
    // Clamp the zoom value between 0.1 and 4.
    zoom = clamp(zoom, 0.1, 4);

    // Calculate the difference in zoom levels.
    const deltaZoom = zoom - this.canvasProperties.zoom;

    // Update the zoom level.
    this.canvasProperties.zoom = zoom;

    // Adjust the offset based on the zoom level change.
    this.canvasProperties.offset.x -= deltaZoom * (this.canvas.width / 2);
    this.canvasProperties.offset.y -= deltaZoom * (this.canvas.height / 2);

    // Redraw the canvas.
    this.draw();
  }

  /**
   * Draw something with a drop shadow effect.
   * @param {function} cb - The function that draws an object.
   */
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
