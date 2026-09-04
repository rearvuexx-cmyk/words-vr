import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Player } from "./player";
import { Venue } from "./venue";
import { useFloor } from "./session";
import { bindRenderer } from "./xr";

export function FloorCanvas() {
  const entered = useFloor((s) => s.entered);
  const cinema = useFloor((s) => s.cinema);

  return (
    <Canvas
      className="absolute inset-0 h-full w-full touch-none"
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 70, near: 0.08, far: 80, position: [0, 1.65, 7.4] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ background: "#070606" }}
      onCreated={({ gl }) => bindRenderer(gl)}
    >
      <Suspense fallback={null}>
        <Venue />
      </Suspense>
      {entered && !cinema && <Player />}
    </Canvas>
  );
}
