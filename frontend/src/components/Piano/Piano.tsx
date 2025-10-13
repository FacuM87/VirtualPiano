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

export default function Piano() {
  const [sampler, setSampler] = useState<Tone.Sampler | null>(null);
  const [started, setStarted] = useState(false);

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

  const startAudio = async () => {
    await Tone.start();
    setStarted(true);
  };

  const playNote = (note: string) => {
    if (!sampler) return;
    sampler.triggerAttackRelease(note, "8n");
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
    <div className="flex justify-center mt-10">
      <div className="relative flex">
        {whiteKeys.map((note) => (
          <div
            key={note}
            onMouseDown={() => playNote(note)}
            className="w-16 h-56 bg-white border border-gray-400 rounded-b-lg active:bg-gray-300 cursor-pointer flex justify-center items-end relative"
          >
            <span className="text-xs text-gray-600 mb-2 select-none">{note}</span>
          </div>
        ))}

        {blackKeys.map(({ note, position }) => (
          <div
            key={note}
            onMouseDown={() => playNote(note)}
            className="absolute top-0 w-10 h-36 bg-black rounded-b-md active:bg-gray-700 cursor-pointer z-20 transition-transform active:scale-95"
            style={{
              left: `${position * 4}rem`, 
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
