export function ColorPicker() {
  return (
    <div className="w-48 h-32">
      <div className="bg-[hsl(0,100%,50%)] w-56 h-56">
        <div className="bg-gradient-to-r from-white to-transparent w-full h-full">
          <div className="bg-gradient-to-t from-black to-transparent w-full h-full relative">
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-black rounded-full"
              style={{
                top: 0,
                left: 0,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
