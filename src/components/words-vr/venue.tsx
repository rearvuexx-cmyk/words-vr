import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const CRIMSON = "#c41e3a";
const BONE = "#f4f1ea";
const INK = "#070606";

function Screen() {
  const map = useTexture("/media/screen.jpg");
  map.colorSpace = THREE.SRGBColorSpace;
  const pulse = useRef<THREE.MeshStandardMaterial>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const beat = 0.55 + 0.45 * Math.max(0, Math.sin(t * Math.PI * 2 * (120 / 60)));
    if (pulse.current) pulse.current.emissiveIntensity = 0.35 + beat * 0.55;
    if (glow.current) glow.current.opacity = 0.08 + beat * 0.16;
  });

  return (
    <group position={[0, 4.15, -11.35]}>
      <mesh>
        <planeGeometry args={[16.4, 9.2]} />
        <meshBasicMaterial color="#090808" />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[15.6, 8.7]} />
        <meshStandardMaterial
          ref={pulse}
          map={map}
          emissive={CRIMSON}
          emissiveIntensity={0.5}
          roughness={0.35}
          metalness={0.1}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[16.8, 9.6]} />
        <meshBasicMaterial ref={glow} color={CRIMSON} transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  );
}

function FloorGrid() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(CRIMSON) },
          uInk: { value: new THREE.Color(INK) },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          uniform vec3 uInk;
          varying vec2 vUv;
          void main() {
            vec2 uv = vUv * 18.0;
            vec2 g = abs(fract(uv) - 0.5);
            float line = 1.0 - smoothstep(0.02, 0.046, min(g.x, g.y));
            float pulse = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 2.0 + vUv.y * 10.0));
            vec3 col = mix(uInk, uColor, line * pulse * 0.55);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  );

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[22, 24]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

function Crowd() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = 36;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: ((i % 9) - 4) * 1.55 + (i % 3) * 0.12,
        z: 1.2 + Math.floor(i / 9) * 1.7 + (i % 2) * 0.2,
        phase: i * 0.73,
        h: 1.45 + (i % 5) * 0.08,
      })),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!mesh.current) return;
    seeds.forEach((s, i) => {
      const bob = Math.sin(t * 4.2 + s.phase) * 0.12;
      dummy.position.set(s.x, s.h * 0.5 + bob, s.z);
      dummy.scale.set(1, s.h + bob * 0.4, 1);
      dummy.rotation.set(0, Math.sin(t * 0.4 + s.phase) * 0.2, 0);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
      <capsuleGeometry args={[0.18, 0.85, 4, 8]} />
      <meshStandardMaterial color="#1a1414" roughness={0.85} metalness={0.05} />
    </instancedMesh>
  );
}

function Booth() {
  return (
    <group position={[0, 0, -8.6]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[4.2, 1.1, 1.4]} />
        <meshStandardMaterial color="#161111" roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, 1.18, 0.1]}>
        <boxGeometry args={[3.4, 0.12, 0.9]} />
        <meshStandardMaterial
          color="#2a1a1c"
          roughness={0.3}
          metalness={0.4}
          emissive={CRIMSON}
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh position={[-1.1, 1.32, 0.15]}>
        <boxGeometry args={[0.7, 0.08, 0.5]} />
        <meshStandardMaterial color={CRIMSON} emissive={CRIMSON} emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[1.1, 1.32, 0.15]}>
        <boxGeometry args={[0.7, 0.08, 0.5]} />
        <meshStandardMaterial color={BONE} emissive={BONE} emissiveIntensity={0.12} />
      </mesh>
    </group>
  );
}

function MovingHeads() {
  const a = useRef<THREE.SpotLight>(null);
  const b = useRef<THREE.SpotLight>(null);
  const c = useRef<THREE.SpotLight>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const aim = (light: THREE.SpotLight | null, ox: number, speed: number) => {
      if (!light) return;
      light.target.position.set(Math.sin(t * speed) * 4 + ox, 0, Math.cos(t * speed * 0.8) * 3);
      light.target.updateMatrixWorld();
    };
    aim(a.current, -2, 0.55);
    aim(b.current, 2, 0.4);
    aim(c.current, 0, 0.7);
  });

  return (
    <>
      <spotLight
        ref={a}
        position={[-5, 7.4, -2]}
        angle={0.45}
        penumbra={0.5}
        intensity={18}
        color={CRIMSON}
        distance={22}
        castShadow
      >
        <object3D attach="target" />
      </spotLight>
      <spotLight ref={b} position={[5, 7.4, -1]} angle={0.42} penumbra={0.55} intensity={14} color={BONE} distance={22}>
        <object3D attach="target" />
      </spotLight>
      <spotLight ref={c} position={[0, 7.6, 3]} angle={0.5} penumbra={0.6} intensity={8} color="#ff6b7d" distance={18}>
        <object3D attach="target" />
      </spotLight>
    </>
  );
}

function Walls() {
  const wall = "#141010";
  return (
    <group>
      <mesh position={[0, 4, -11.6]} receiveShadow>
        <boxGeometry args={[22, 8.2, 0.4]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>
      <mesh position={[-10.6, 4, 0]} receiveShadow>
        <boxGeometry args={[0.4, 8.2, 24]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>
      <mesh position={[10.6, 4, 0]} receiveShadow>
        <boxGeometry args={[0.4, 8.2, 24]} />
        <meshStandardMaterial color={wall} roughness={0.95} />
      </mesh>
      <mesh position={[0, 4, 11.8]} receiveShadow>
        <boxGeometry args={[22, 8.2, 0.4]} />
        <meshStandardMaterial color="#100e0e" roughness={0.95} />
      </mesh>
      <mesh position={[0, 8.15, 0]} receiveShadow>
        <boxGeometry args={[22, 0.3, 24]} />
        <meshStandardMaterial color="#0c0a0a" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 24]} />
        <meshStandardMaterial color="#090808" roughness={0.7} metalness={0.35} />
      </mesh>
    </group>
  );
}

function TitleBar() {
  const tex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Texture();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 2048, 256);
    ctx.fillStyle = "#f4f1ea";
    ctx.font = "700 180px 'Big Shoulders Display', Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("WORDS", 1024, 118);
    ctx.fillStyle = "#c41e3a";
    ctx.font = "600 36px Manrope, sans-serif";
    ctx.fillText("SIR  YES  SIR", 1024, 210);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }, []);

  return (
    <mesh position={[0, 7.35, -11.1]}>
      <planeGeometry args={[10, 1.25]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
}

export function Venue() {
  return (
    <>
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, 10, 26]} />
      <ambientLight intensity={0.18} color="#3a2224" />
      <hemisphereLight args={["#4a3032", "#080606", 0.35]} />
      <Walls />
      <FloorGrid />
      <Screen />
      <TitleBar />
      <Booth />
      <Crowd />
      <MovingHeads />
    </>
  );
}
