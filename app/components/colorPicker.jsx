import { Component, useState } from "react";
import { clamp } from "../utils/math";
import {
  checkHlLuminosityCurve,
  hex2rgb,
  hsv2rgb,
  rgb2hex,
  rgb2hsv,
} from "../utils/colors";

export class ColorPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hue: 0,
      saturation: 0,
      value: 0,
      mouseDown1d: false,
      mouseDown2d: false,
      selector1dPos: 0,
      selector2dPos: {
        x: 0,
        y: 256,
      },
      selectorSize: 256,
      rgb: {
        r: 0,
        g: 0,
        b: 0,
      },
      hex: props.color ? props.color.replace("#", "") : "000000",
      oldHex: props.color ? props.color.replace("#", "") : "000000",
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
        var hsv = {
          h: color.h,
          s: color.s,
          v: color.v,
        };
        var temp_rgb = hsv2rgb(color.h, color.s, color.v);
        var rgb = {
          r: temp_rgb[0],
          g: temp_rgb[1],
          b: temp_rgb[2],
        };
        var hex = rgb2hex(rgb.r, rgb.g, rgb.b);
        break;

      case "rgb":
        var rgb = {
          r: color.r,
          g: color.g,
          b: color.b,
        };
        var temp_hsv = rgb2hsv(color.r, color.g, color.b);
        var hsv = {
          h: temp_hsv[0],
          s: temp_hsv[1],
          v: temp_hsv[2],
        };
        var hex = rgb2hex(rgb.r, rgb.g, rgb.b);
        break;

      case "hex":
        var temp_rgb = hex2rgb(color);
        var rgb = {
          r: temp_rgb[0],
          g: temp_rgb[1],
          b: temp_rgb[2],
        };
        var temp_hsv = rgb2hsv(rgb.r, rgb.g, rgb.b);
        var hsv = {
          h: temp_hsv[0],
          s: temp_hsv[1],
          v: temp_hsv[2],
        };
    }
    this.setState({
      rgb: rgb,
    });
    this.setState({
      hue: hsv.h,
      saturation: hsv.s,
      value: hsv.v,
    });
    this.setState({ hex: hex });

    const newSlider2dPosX = (hsv.s / 100) * this.state.selectorSize;
    const newSlider2dPosY = ((100 - hsv.v) / 100) * this.state.selectorSize;
    this.setState({
      selector2dPos: {
        x: newSlider2dPosX,
        y: newSlider2dPosY,
      },
    });

    const newSlider1dPos = ((360 - hsv.h) / 360) * this.state.selectorSize;
    this.setState({
      selector1dPos: newSlider1dPos,
    });
  }

  onSaturationValueChange(e) {
    const slider2d = document.querySelector(".slider2d");
    const boundingRect = slider2d.getBoundingClientRect();
    const posPercentX = clamp(
      (e.clientX - boundingRect.left) / boundingRect.width,
      0,
      1
    );
    const posPercentY = clamp(
      (e.clientY - boundingRect.top) / boundingRect.height,
      0,
      1
    );
    this.setState({
      selector2dPos: {
        x: clamp(e.clientX - boundingRect.left, 0, boundingRect.width),
        y: clamp(e.clientY - boundingRect.top, 0, boundingRect.height),
      },
    });
    const newSaturation = clamp(posPercentX * 100, 0, 100);
    const newValue = clamp(100 - posPercentY * 100, 0, 100);
    this.setState({ saturation: newSaturation, value: newValue });
    this.updateColor(
      { h: this.state.hue, s: newSaturation, v: newValue },
      "hsv"
    );
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
    this.updateColor(
      { h: newHue, s: this.state.saturation, v: this.state.value },
      "hsv"
    );
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
    document.addEventListener("mouseup", () => {
      if (this.state.mouseDown1d) {
        this.setState({ mouseDown1d: false });
      } else if (this.state.mouseDown2d) {
        this.setState({ mouseDown2d: false });
      }
    });

    this.updateColor(this.state.hex, "hex");
  }

  render() {
    return (
      <div className="flex flex-row justify-center items-center bg-beige-900 bg-opacity-50 w-[100vw] h-[100vh] fixed top-0 left-0 z-[9999]">
        <div className="w-[calc(144rem/4)] h-96 bg-beige-800 text-beige-200 flex flex-col justify-center items-center rounded-lg gap-8">
          <div className="w-128 h-64 flex flex-row gap-4 mt-4">
            {/* Saturation and luminosity 2D slider */}
            <div
              className="w-64 h-64 select-none rounded"
              style={{
                background: `hsl(${this.state.hue}, 100%, 50%)`,
              }}
              draggable={false}
            >
              <div
                className="bg-gradient-to-r from-white to-transparent w-full h-full rounded"
                draggable={false}
              >
                <div
                  className="slider2d bg-gradient-to-t from-black to-transparent w-full h-full relative rounded"
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
                        this.state.selectorSize,
                        this.state.selectorSize,
                        this.state.hue
                      )
                        ? "white"
                        : "black",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Hue slider */}
            <div
              className="slider1d h-64 w-8 vertical-rainbow select-none relative rounded"
              draggable={false}
            >
              <div
                className="w-11 h-1 border-[6px] border-y-transparent border-x-beige-200 -translate-x-1.5 -translate-y-1/2 absolute pointer-events-none"
                style={{
                  top: this.state.selector1dPos,
                }}
                draggable={false}
              ></div>
            </div>

            <div className="flex flex-col gap-4">
              {/* HSV input */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                  <p>H:</p>
                  <input
                    type="number"
                    className="bg-beige-700 border border-[#fff2] hover:border-[#fff4] focus:border-[#fff4] h-4 rounded w-10 outline-none px-1 py-3 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={0}
                    max={360}
                    value={Math.round(this.state.hue).toString()}
                    onChange={(e) => {
                      const newHue = clamp(e.target.value, 0, 360);
                      this.setState({ hue: newHue });
                      this.updateColor(
                        {
                          h: newHue,
                          s: this.state.saturation,
                          v: this.state.value,
                        },
                        "hsv"
                      );
                    }}
                  />
                  <p>º</p>
                </div>
                <div className="flex flex-row gap-2">
                  <p>S:</p>
                  <input
                    type="number"
                    className="bg-beige-700 border border-[#fff2] hover:border-[#fff4] focus:border-[#fff4] h-4 rounded-md w-10 outline-none px-1 py-3 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={0}
                    max={100}
                    value={Math.round(this.state.saturation).toString()}
                    onChange={(e) => {
                      const newSaturation = clamp(e.target.value, 0, 100);
                      this.setState({
                        saturation: newSaturation,
                      });
                      this.updateColor(
                        {
                          h: this.state.hue,
                          s: newSaturation,
                          v: this.state.value,
                        },
                        "hsv"
                      );
                    }}
                  />
                  <p>%</p>
                </div>
                <div className="flex flex-row gap-2">
                  <p>V:</p>
                  <input
                    type="number"
                    className="bg-beige-700 border border-[#fff2] hover:border-[#fff4] focus:border-[#fff4] h-4 rounded-md w-10 outline-none px-1 py-3 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={0}
                    max={100}
                    value={Math.round(this.state.value).toString()}
                    onChange={(e) => {
                      const newValue = clamp(e.target.value, 0, 100);
                      this.setState({
                        value: newValue,
                      });
                      this.updateColor(
                        {
                          h: this.state.hue,
                          s: this.state.saturation,
                          v: newValue,
                        },
                        "hsv"
                      );
                    }}
                  />
                  <p>%</p>
                </div>
              </div>

              {/* RGB input */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                  <p>R:</p>
                  <input
                    type="number"
                    className="bg-beige-700 border border-[#fff2] hover:border-[#fff4] focus:border-[#fff4] h-4 rounded-md w-10 outline-none px-1 py-3 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={0}
                    max={255}
                    value={Math.round(this.state.rgb.r).toString()}
                    onChange={(e) => {
                      const newRgb = {
                        ...this.state.rgb,
                        r: clamp(e.target.value, 0, 255),
                      };
                      this.setState({
                        rgb: newRgb,
                      });
                      this.updateColor(newRgb, "rgb");
                    }}
                  />
                </div>
                <div className="flex flex-row gap-2">
                  <p>G:</p>
                  <input
                    type="number"
                    className="bg-beige-700 border border-[#fff2] hover:border-[#fff4] focus:border-[#fff4] h-4 rounded-md w-10 outline-none px-1 py-3 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={0}
                    max={255}
                    value={Math.round(this.state.rgb.g).toString()}
                    onChange={(e) => {
                      const newRgb = {
                        ...this.state.rgb,
                        g: clamp(e.target.value, 0, 255),
                      };
                      this.setState({
                        rgb: newRgb,
                      });
                      this.updateColor(newRgb, "rgb");
                    }}
                  />
                </div>
                <div className="flex flex-row gap-2">
                  <p>B:</p>
                  <input
                    type="number"
                    className="bg-beige-700 border border-[#fff2] hover:border-[#fff4] focus:border-[#fff4] h-4 rounded-md w-10 outline-none px-1 py-3 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={0}
                    max={255}
                    value={Math.round(this.state.rgb.b).toString()}
                    onChange={(e) => {
                      const newRgb = {
                        ...this.state.rgb,
                        b: clamp(e.target.value, 0, 255),
                      };
                      this.setState({
                        rgb: newRgb,
                      });
                      this.updateColor(newRgb, "rgb");
                    }}
                  />
                </div>
              </div>

              {/* HEX input */}
              <div className="flex flex-row gap-1">
                <p>#</p>
                <input
                  type="text"
                  maxLength={6}
                  className="bg-beige-700 border border-[#fff2] hover:border-[#fff4] focus:border-[#fff4] h-4 rounded-md w-24 outline-none px-1 py-3 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={this.state.hex}
                  onChange={(e) => {
                    const newHex = e.target.value;
                    this.setState({
                      hex: newHex,
                    });
                    this.updateColor(newHex, "hex");
                  }}
                  onKeyDown={(e) => {
                    const allowedChars = [
                      "0",
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "a",
                      "b",
                      "c",
                      "d",
                      "e",
                      "f",
                      "backspace",
                      "enter",
                      "delete",
                    ];
                    if (!allowedChars.includes(e.key.toLowerCase()))
                      e.preventDefault();
                  }}
                />
              </div>
            </div>

            {/* Color preview */}
            <div className="flex flex-col gap-1 text-xs items-center -mt-2">
              <p>New</p>
              <div className="w-16 h-20 flex flex-col rounded-md overflow-hidden">
                <div
                  className="w-full h-1/2"
                  style={{ backgroundColor: "#" + this.state.hex }}
                ></div>
                <div
                  className="w-full h-1/2"
                  style={{ backgroundColor: "#" + this.state.oldHex }}
                ></div>
              </div>
              <p>Current</p>
            </div>
          </div>

          {/* Modal buttons */}
          <div className="flex flex-row gap-2 w-full justify-end px-8">
            <button
              className="transition-colors bg-transparent hover:bg-[#fff2] border border-transparent w-24 px-4 py-1 rounded-full"
              onClick={() => {
                if (this.props.onClose) this.props.onClose();
              }}
            >
              Cancel
            </button>
            <button
              className="transition-colors bg-transparent hover:bg-beige-400 hover:text-beige-900 border border-beige-400 w-24 px-4 py-1 rounded-full"
              onClick={() => {
                if (this.props.updateColor)
                  this.props.updateColor(this.state.hex);
                if (this.props.onClose) this.props.onClose();
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
}
