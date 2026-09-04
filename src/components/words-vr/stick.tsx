import { useRef } from "react";
import { moveStick } from "./session";

export function MoveStick() {
  const origin = useRef({ x: 0, y: 0 });
  const knob = useRef<HTMLDivElement>(null);

  const apply = (clientX: number, clientY: number) => {
    const dx = clientX - origin.current.x;
    const dy = clientY - origin.current.y;
    const max = 42;
    const mag = Math.hypot(dx, dy);
    const scale = mag > max ? max / mag : 1;
    const x = (dx * scale) / max;
    const y = (-dy * scale) / max;
    moveStick.x = x;
    moveStick.y = y;
    if (knob.current) {
      knob.current.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
    }
  };

  const reset = () => {
    moveStick.x = 0;
    moveStick.y = 0;
    if (knob.current) knob.current.style.transform = "translate(0px, 0px)";
  };

  return (
    <div
      className="pointer-events-auto relative size-[112px] shrink-0 rounded-full border border-border bg-surface/70"
      onPointerDown={(e) => {
        origin.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
        apply(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        apply(e.clientX, e.clientY);
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
      aria-label="Move"
    >
      <div
        ref={knob}
        className="pointer-events-none absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg/90"
      />
    </div>
  );
}
