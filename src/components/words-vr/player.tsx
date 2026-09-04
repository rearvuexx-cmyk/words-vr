import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { isPresenting } from "./xr";
import { moveStick } from "./session";

const SPEED = 4.6;
const LOOK = 0.0024;
const BOUNDS = { x: 8.6, z: 10.2 };
const START = new THREE.Vector3(0, 1.65, 7.4);

type Probe = {
  getYaw: () => number;
  getSpeed: () => number;
  setKeys: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: Probe;
  }
}

export function Player() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  const yaw = useRef(0);
  const pitch = useRef(-0.08);
  const pos = useRef(START.clone());
  const speed = useRef(0);
  const keys = useRef(new Set<string>());
  const injected = useRef(new Set<string>());
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const tmpF = useRef(new THREE.Vector3());
  const tmpR = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.copy(pos.current);
    camera.rotation.order = "YXZ";
  }, [camera]);

  useEffect(() => {
    window.__controlsTest = {
      getYaw: () => yaw.current,
      getSpeed: () => speed.current,
      setKeys: (codes) => {
        injected.current = new Set(codes);
      },
    };
    return () => {
      delete window.__controlsTest;
    };
  }, []);

  useEffect(() => {
    const held = keys.current;
    const down = (e: KeyboardEvent) => {
      held.add(e.code);
      if (
        ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          e.code,
        )
      ) {
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => held.delete(e.code);
    const clear = () => held.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clear();
    });
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "none";
    el.style.cursor = "grab";

    const look = (dx: number, dy: number, scale = 1) => {
      yaw.current -= dx * LOOK * scale;
      pitch.current -= dy * LOOK * scale;
      pitch.current = Math.max(-1.2, Math.min(1.2, pitch.current));
    };

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === el) {
        look(e.movementX, e.movementY);
        return;
      }
      if (!dragging.current) return;
      look(e.clientX - last.current.x, e.clientY - last.current.y, 1.35);
      last.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerDown = (e: PointerEvent) => {
      if (isPresenting()) return;
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
      el.style.cursor = "grabbing";
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* iframe may deny capture */
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      if (document.pointerLockElement === el) return;
      look(e.clientX - last.current.x, e.clientY - last.current.y, 1.35);
      last.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      dragging.current = false;
      el.style.cursor = "grab";
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onClick = () => {
      if (isPresenting()) return;
      el.requestPointerLock?.();
    };

    window.addEventListener("mousemove", onMouseMove);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("click", onClick);
    };
  }, [gl]);

  useFrame((_, rawDt) => {
    if (isPresenting()) return;
    const dt = Math.min(rawDt, 0.1);
    const codes = keys.current;
    const extra = injected.current;
    const has = (c: string) => codes.has(c) || extra.has(c);

    let ax = moveStick.x;
    let az = moveStick.y;
    if (has("KeyW") || has("ArrowUp")) az += 1;
    if (has("KeyS") || has("ArrowDown")) az -= 1;
    if (has("KeyD") || has("ArrowRight")) ax += 1;
    if (has("KeyA") || has("ArrowLeft")) ax -= 1;
    const mag = Math.hypot(ax, az);
    if (mag > 1) {
      ax /= mag;
      az /= mag;
    }

    const y = yaw.current;
    const forward = tmpF.current.set(-Math.sin(y), 0, -Math.cos(y));
    const right = tmpR.current.set(Math.cos(y), 0, -Math.sin(y));

    pos.current.addScaledVector(forward, az * SPEED * dt);
    pos.current.addScaledVector(right, ax * SPEED * dt);
    pos.current.x = THREE.MathUtils.clamp(pos.current.x, -BOUNDS.x, BOUNDS.x);
    pos.current.z = THREE.MathUtils.clamp(pos.current.z, -BOUNDS.z, BOUNDS.z);
    pos.current.y = 1.65;

    speed.current = mag > 0.05 ? SPEED * Math.min(1, mag) : 0;

    camera.position.copy(pos.current);
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
  });

  return null;
}
