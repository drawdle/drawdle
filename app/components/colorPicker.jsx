import { Component, useState } from "react";
import { clamp } from "../utils/math";
import {
  checkHlLuminosityCurve,
  hsl2rgb,
  hsv2hsl,
  hsv2rgb,
} from "../utils/colors";

export class ColorPicker extends Component {
  constructor() {
    super();
    this.state = {
      hue: 0,
      saturation: 0,
      value: 0,
      mouseDown1d: false,
      mouseDown2d: false,
      selector1dPos: 0,
      selector2dPos: {
        x: 0,
        y: 0,
      },
      hsl: {
        h: 0,
        s: 1,
        l: 0.5,
      },
      rgb: {
        r: 255,
        g: 0,
        b: 0,
      },
    };
  }

  /**
   * Updates the color with the given values.
   *
   * @param {{h: Number, s: Number, v: Number}|{r: Number, g: Number, b: Number}|{h: Number, s: Number, l: Number}} color - New color values.
   * @param {"hsv"|"rgb"|"hsl"} type - The type of the color value.
   * @return {void} This function does not return a value.
   */
  updateColor(color, type) {
    switch (type) {
      case "hsv":
        var hsv = color;
        var temp_hsl = hsv2hsl(hsv.h, hsv.s, hsv.v);
        var hsl = {
          h: temp_hsl[0],
          s: temp_hsl[1],
          l: temp_hsl[2],
        };
        var temp_rgb = hsv2rgb(hsl.h, hsl.s, hsl.l);
        var rgb = {
          r: temp_rgb[0],
          g: temp_rgb[1],
          b: temp_rgb[2],
        };
        break;

      case "rgb":
        var rgb = color;
        var temp_hsl = rgb2hsl(rgb.r, rgb.g, rgb.b);
        var hsl = {
          h: temp_hsl[0],
          s: temp_hsl[1],
          l: temp_hsl[2],
        };
        var temp_hsv = rgb2hsv(rgb.r, rgb.g, rgb.b);
        var hsv = {
          h: temp_hsv[0],
          s: temp_hsv[1],
          v: temp_hsv[2],
        };
        break;

      case "hsl":
        var hsl = color;
        var temp_hsv = hsl2hsv(hsl.h, hsl.s, hsl.l);
        var hsv = {
          h: temp_hsv[0],
          s: temp_hsv[1],
          v: temp_hsv[2],
        };
        var temp_rgb = hsl2rgb(hsl.h, hsl.s, hsl.l);
        var rgb = {
          r: temp_rgb[0],
          g: temp_rgb[1],
          b: temp_rgb[2],
        };
        break;
    }

    this.setState({
      hsl: {
        h: hsl[0],
        s: hsl[1],
        l: hsl[2],
      },
    });
    this.setState({
      rgb: {
        r: rgb[0],
        g: rgb[1],
        b: rgb[2],
      },
    });
  }

  onSaturationValueChange(e) {
    const slider2d = document.querySelector(".slider2d");
    const boundingRect = slider2d.getBoundingClientRect();
    const posPercent = clamp(
      (e.clientX - boundingRect.left) / boundingRect.width,
      0,
      1
    );
    this.setState({
      selector2dPos: {
        x: clamp(e.clientX - boundingRect.left, 0, boundingRect.width),
        y: clamp(e.clientY - boundingRect.top, 0, boundingRect.height),
      },
    });
    const newSaturation = clamp(posPercent * 100, 0, 100);
    const newValue = clamp(100 - posPercent * 100, 0, 100);
    this.setState({ saturation: newSaturation, value: newValue });
  }

  onHueChange(e) {
    const slider1d = document.querySelector(".slider1d");
    const boundingRect = slider1d.getBoundingClientRect();
    const posPercent = clamp(
      (e.clientY - boundingRect.top) / boundingRect.height,
      0,
      1
    );
    this.setState({
      selector1dPos: clamp(
        e.clientY - boundingRect.top,
        0,
        boundingRect.height
      ),
    });
    const newHue = 360 - clamp(posPercent * 360, 0, 359.99);
    this.setState({ hue: newHue });
  }

  componentDidMount() {
    document.addEventListener("mousedown", (e) => {
      const slider1d = document.querySelector(".slider1d");
      const slider2d = document.querySelector(".slider2d");

      if (e.target == slider1d) {
        this.setState({ mouseDown1d: true });
        this.onHueChange(e);
      } else if (e.target == slider2d) {
        this.setState({ mouseDown2d: true });
        this.onSaturationValueChange(e);
      }
    });
    document.addEventListener("mousemove", (e) => {
      if (this.state.mouseDown1d) {
        this.onHueChange(e);
      } else if (this.state.mouseDown2d) {
        this.onSaturationValueChange(e);
      }
    });
    document.addEventListener("mouseup", (e) => {
      if (this.state.mouseDown1d) {
        this.setState({ mouseDown1d: false });
      } else if (this.state.mouseDown2d) {
        this.setState({ mouseDown2d: false });
      }
    });
  }

  render() {
    return (
      <div className="w-[calc(128rem/4)] h-96 bg-beige-800 flex flex-col justify-center items-center">
        <div className="w-128 h-64 flex flex-row gap-4">
          <div
            className="w-64 h-64 select-none"
            style={{
              background: `hsl(${this.state.hue}, 100%, 50%)`,
            }}
            draggable={false}
          >
            <div
              className="bg-gradient-to-r from-white to-transparent w-full h-full"
              draggable={false}
            >
              <div
                className="slider2d bg-gradient-to-t from-black to-transparent w-full h-full relative"
                draggable={false}
              >
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-black rounded-full pointer-events-none"
                  draggable={false}
                  style={{
                    top: this.state.selector2dPos.y,
                    left: this.state.selector2dPos.x,
                    borderColor: checkHlLuminosityCurve(
                      this.state.selector2dPos,
                      256,
                      256,
                      this.state.hue
                    )
                      ? "white"
                      : "black",
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div
            className="slider1d h-64 w-8 vertical-rainbow select-none relative"
            draggable={false}
          >
            <div
              className="w-11 h-1 border-[6px] border-y-transparent border-x-white -translate-x-1.5 -translate-y-1/2 absolute pointer-events-none"
              style={{
                top: this.state.selector1dPos,
              }}
              draggable={false}
            ></div>
          </div>
        </div>
      </div>
    );
  }
}
