import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import * as Tone from "tone";
import { useEffect, useRef, useState } from "react";

/* SETUP DE NOTAS - a mejorar, hardcodeado por el momento para testeo*/

const whiteKeys = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];

const blackKeys = [
  { note: "C#4", offset: 0.7 },
  { note: "D#4", offset: 1.7 },
  { note: "F#4", offset: 3.7 },
  { note: "G#4", offset: 4.7 },
  { note: "A#4", offset: 5.7 },
];

const keyMap: Record<string, string> = {
  a: "C4",
  w: "C#4",
  s: "D4",
  e: "D#4",
  d: "E4",
  f: "F4",
  t: "F#4",
  g: "G4",
  y: "G#4",
  h: "A4",
  u: "A#4",
  j: "B4",
  k: "C5",
};

/* COMPONENTE TEECLA DEL PIANO */

type KeyProps = {
  note: string;
  color: "white" | "black";
  position: [number, number, number];
  width: number;
  depth: number;
  active: boolean;
  onPress: (note: string) => void;
  onRelease: (note: string) => void;
};

function Key({
  note,
  color,
  position,
  width,
  depth,
  active,
  onPress,
  onRelease,
}: KeyProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const targetY = active ? -0.15 : 0;
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
        onPress(note);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onRelease(note);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        onRelease(note);
      }}
    >
      <boxGeometry args={[width, 0.5, depth]} />
      <meshStandardMaterial
        color={color}
        metalness={color === "black" ? 0.5 : 0.1}
        roughness={color === "black" ? 0.3 : 0.7}
      />
    </mesh>
  );
}

/* COMPONENTE PIANO 3D */

export default function Piano3D() {
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null);
  const [pressedNotes, setPressedNotes] = useState<Set<string>>(new Set());

  /* -------- Tone Sampler -------- */
  useEffect(() => {
    const s = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      release: 2,
      onload: () => {
        setSampler(s);
        console.log("Sampler cargado");
      },
    }).toDestination();

    return () => {
      s.dispose();
    };
  }, []);

  useEffect(() => {
    Tone.start();
  }, []);

  /* -------- Piano 3D -------- */
  const pressNote = (note: string) => {
    if (!sampler || pressedNotes.has(note)) return;

    sampler.triggerAttack(note);
    setPressedNotes((prev) => new Set(prev).add(note));
  };

  const releaseNote = (note: string) => {
    if (!sampler) return;

    sampler.triggerRelease(note, "+0.2");
    setPressedNotes((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  };

  useEffect(() => {
    if (!sampler) return;

    const down = (e: KeyboardEvent) => {
      const note = keyMap[e.key.toLowerCase()];
      if (note) pressNote(note);
    };

    const up = (e: KeyboardEvent) => {
      const note = keyMap[e.key.toLowerCase()];
      if (note) releaseNote(note);
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [sampler, pressedNotes]);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-800 to-black">

      <Canvas camera={{ position: [0, 4, 10], fov: 45 }} shadows>
        <ambientLight intensity={0.4} />

        <directionalLight
          position={[5, 8, 5]}
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
            note={note}
            color="white"
            width={1}
            depth={4}
            position={[i * 1.2 - 4.2, 0, 0]}
            active={pressedNotes.has(note)}
            onPress={pressNote}
            onRelease={releaseNote}
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
            position={[offset * 1.2 - 4.2, 0.15, -0.3]}
            active={pressedNotes.has(note)}
            onPress={pressNote}
            onRelease={releaseNote}
          />
        ))}

        <OrbitControls />
      </Canvas>
    </div>
  );
}