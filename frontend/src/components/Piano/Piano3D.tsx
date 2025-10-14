import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useState, useRef } from "react";

const whiteKeys = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
const blackKeys = [
  { note: "C#4", offset: 0.7 },
  { note: "D#4", offset: 1.7 },
  { note: "F#4", offset: 3.7 },
  { note: "G#4", offset: 4.7 },
  { note: "A#4", offset: 5.7 },
];

type KeyProps = {
  color: "white" | "black";
  position: [number, number, number];
  width: number;
  depth: number;
  note: string;
};

function Key({ color, position, width, depth }: KeyProps) {
  const [pressed, setPressed] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!meshRef.current) return;
    const targetY = pressed ? (color === "black" ? -0.08 : -0.12) : 0;
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      position[1] + targetY,
      0.25
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
      onPointerDown={(e) => {
        e.stopPropagation(); 
        setPressed(true);
      }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      <boxGeometry args={[width, 0.5, depth]} />
      <meshStandardMaterial
        color={color}
        metalness={color === "black" ? 0.5 : 0.1}
        roughness={color === "black" ? 0.4 : 0.7}
      />
    </mesh>
  );
}

export default function Piano3D() {
  return (
    <div className="w-full h-screen bg-gray-900">
      <Canvas camera={{ position: [0, 5, 12], fov: 45 }} shadows>
        {/* Luces */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Piso */}
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.25, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#222" />
        </mesh>

        {/* Teclas blancas */}
        {whiteKeys.map((note, i) => (
          <Key
            key={note}
            note={note}
            color="white"
            width={1}
            depth={4}
            position={[i * 1.2 - 4, 0, 0]}
          />
        ))}

        {/* Teclas negras */}
        {blackKeys.map(({ note, offset }) => (
          <Key
            key={note}
            note={note}
            color="black"
            width={0.7}
            depth={2.5}
            position={[offset * 1.2 - 4, 0.15, -0.5]}
          />
        ))}

        <OrbitControls />
      </Canvas>
    </div>
  );
}
