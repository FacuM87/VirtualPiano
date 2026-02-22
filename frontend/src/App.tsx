import './App.css'
import Piano3D from './components/Piano/Piano3D'
import Piano from './components/Piano/Piano'
import { useState } from 'react';

type PianoMode = '2D' | '3D'| null
function App() {
  const [mode, setMode] = useState<PianoMode>(null);

  return (
    <>
      {
        mode === null ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-4" >
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all" onClick={() => setMode('2D')}>Piano 2D</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all" onClick={() => setMode('3D')}>Piano 3D</button>
          </div>
        ) : (
          mode === '2D' ? <Piano/> : <Piano3D/>
        )
      }
    </>
  )
}

export default App
