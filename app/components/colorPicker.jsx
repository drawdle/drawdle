import { useState } from "react";
import { clamp } from "../utils/math";
import { hsv2hsl } from "../utils/colors";

export function ColorPicker() {
  const [mouseDown2d, setMouseDown2d] = useState(false);
  const [mouseDown1d, setMouseDown1d] = useState(false);
  const [selector2dPos, setSelector2dPos] = useState({ x: 0, y: 0 });
  const [selector1dPos, setSelector1dPos] = useState(0);

  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [value, setValue] = useState(0);

  const [hsl, setHsl] = useState({ h: 0, s: 1, l: 0.5 });
  function onSaturationValueChange(e) {
    if (e.type == "mouseup") {
      setMouseDown2d(false);
    } else if (
      e.type == "mousedown" ||
      (e.type == "mousemove" && mouseDown2d)
    ) {
      if (e.type == "mousedown") {
        setMouseDown2d(true);
      }
      const boundingRect = e.target.getBoundingClientRect();
      const posPercent = {
        x: clamp((e.clientX - boundingRect.left) / boundingRect.width, 0, 1),
        y: clamp((e.clientY - boundingRect.top) / boundingRect.height, 0, 1),
      };
      setSelector2dPos({
        x: clamp(e.clientX - boundingRect.left, 0, boundingRect.width),
        y: clamp(e.clientY - boundingRect.top, 0, boundingRect.height),
      });
      const newSaturation = posPercent.x;
      const newValue = 1 - posPercent.y;
      setSaturation(newSaturation);
      setValue(newValue);
      updateHsl({ h: hue, s: newSaturation, v: newValue });
    }
  }
  function onHueChange(e) {
    if (e.type == "mouseup") {
      setMouseDown1d(false);
    } else if (
      e.type == "mousedown" ||
      (e.type == "mousemove" && mouseDown1d)
    ) {
      if (e.type == "mousedown") {
        setMouseDown1d(true);
      }
      const boundingRect = e.target.getBoundingClientRect();
      const posPercent = clamp(
        (e.clientY - boundingRect.top) / boundingRect.height,
        0,
        1
      );
      setSelector1dPos(
        clamp(e.clientY - boundingRect.top, 0, boundingRect.height)
      );
      const newHue = 360 - clamp(posPercent * 360, 0, 359.99);
      setHue(newHue);
      updateHsl({ h: newHue, s: saturation, v: value });
    }
  }

  function updateHsl(hsv) {
    const hsl = hsv2hsl(hue, saturation, value);
    setHsl({ h: hsl[0], s: hsl[1], l: hsl[2] });
  }
  document.body.addEventListener("mouseup", onSaturationValueChange);
  return (
    <div className="w-128 h-32 flex flex-row gap-4">
      <div
        className="w-64 h-64 select-none"
        style={{
          background: `hsl(${hsl.h}, 100%, 50%)`,
        }}
        draggable={false}
      >
        <div
          className="bg-gradient-to-r from-white to-transparent w-full h-full"
          draggable={false}
        >
          <div
            className="bg-gradient-to-t from-black to-transparent w-full h-full relative"
            draggable={false}
            onMouseUp={onSaturationValueChange}
            onMouseDown={onSaturationValueChange}
            onMouseMove={onSaturationValueChange}
            onMouseLeave={onSaturationValueChange}
            onMouseEnter={onSaturationValueChange}
          >
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-black rounded-full pointer-events-none"
              draggable={false}
              style={{
                top: selector2dPos.y,
                left: selector2dPos.x,
              }}
            ></div>
          </div>
        </div>
      </div>
      <div
        className="h-64 w-8 vertical-rainbow select-none relative"
        draggable={false}
        onMouseUp={onHueChange}
        onMouseDown={onHueChange}
        onMouseMove={onHueChange}
        onMouseLeave={onHueChange}
        onMouseEnter={onHueChange}
      >
        <div
          className="w-11 h-1 border-[6px] border-y-transparent border-x-white -translate-x-1.5 -translate-y-1/2 absolute pointer-events-none"
          style={{
            top: selector1dPos,
          }}
          draggable={false}
        ></div>
      </div>
    </div>
  );
}
