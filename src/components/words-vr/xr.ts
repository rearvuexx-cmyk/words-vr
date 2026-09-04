import type { WebGLRenderer } from "three";

let renderer: WebGLRenderer | null = null;

export function bindRenderer(gl: WebGLRenderer) {
  gl.xr.enabled = true;
  renderer = gl;
}

export function isPresenting() {
  return renderer?.xr.isPresenting ?? false;
}

export async function enterVRSession() {
  if (typeof navigator === "undefined" || !navigator.xr) {
    throw new Error("WebXR is not available in this browser");
  }
  if (!renderer) throw new Error("The floor is still loading");
  const ok = await navigator.xr.isSessionSupported("immersive-vr");
  if (!ok) throw new Error("This device does not support immersive VR");
  const session = await navigator.xr.requestSession("immersive-vr", {
    optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"],
  });
  await renderer.xr.setSession(session);
}
