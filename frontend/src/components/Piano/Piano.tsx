import { useEffect, useState } from "react";
import * as Tone from "tone";

const whiteKeys = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
const blackKeys = [
  { note: "C#4", position: 0.7 },
  { note: "D#4", position: 1.7 },
  { note: "F#4", position: 3.7 },
  { note: "G#4", position: 4.7 },
  { note: "A#4", position: 5.7 },
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

export default function Piano() {
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null);
  const [started, setStarted] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const s = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        console.log("🎵 Sampler cargado");
        setSampler(s);
      },
    }).toDestination();

    return () => {
      s.dispose();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const note = keyMap[e.key.toLowerCase()];
      if (note && sampler) {
        if (!pressedKeys.has(note)) {
          playNote(note);
          setPressedKeys((prev) => new Set(prev).add(note));
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = keyMap[e.key.toLowerCase()];
      if (note) {
        setPressedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(note);
          return newSet;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [sampler, pressedKeys]);

  const startAudio = async () => {
    await Tone.start();
    setStarted(true);
  };

  const playNote = (note: string) => {
    if (!sampler) return;
    sampler.triggerAttackRelease(note, "8n");
  };

  const handleMouseDown = (note: string) => {
    playNote(note);
    setPressedKeys((prev) => new Set(prev).add(note));
  };

  const handleMouseUp = (note: string) => {
    setPressedKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 text-center">
        <button
          onClick={startAudio}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all"
        >
          🎵 Iniciar Piano
        </button>
        <p className="text-sm text-gray-400 mt-2">
          Haz clic para habilitar el sonido
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-10 select-none">
      <div className="relative flex">
        {/* Teclas blancas */}
        {whiteKeys.map((note) => (
          <div
            key={note}
            onMouseDown={() => handleMouseDown(note)}
            onMouseUp={() => handleMouseUp(note)}
            onMouseLeave={() => handleMouseUp(note)}
            className={`w-16 h-56 bg-white border border-gray-400 rounded-b-lg cursor-pointer flex justify-center items-end relative transition-all duration-100 origin-top
              ${
                pressedKeys.has(note)
                  ? "scale-y-95 brightness-90"
                  : "hover:brightness-95"
              }
            `}
          >
            <span className="text-xs text-gray-600 mb-2">{note}</span>
          </div>
        ))}

        {/* Teclas negras */}
        {blackKeys.map(({ note, position }) => (
          <div
            key={note}
            onMouseDown={() => handleMouseDown(note)}
            onMouseUp={() => handleMouseUp(note)}
            onMouseLeave={() => handleMouseUp(note)}
            className={`absolute top-0 w-10 h-36 bg-black rounded-b-md cursor-pointer z-20 transition-all duration-100 origin-top
              ${
                pressedKeys.has(note)
                  ? "scale-y-95 brightness-75"
                  : "hover:brightness-90"
              }
            `}
            style={{
              left: `${position * 4}rem`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
