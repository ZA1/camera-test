import './App.css';
import { useRef, useState } from 'react';

function App() {
  const videoRef = useRef();
  const [error, setError] = useState();
  const [constraints, setConstraints] = useState(JSON.stringify({
    audio: false,
    video: { width: 1280, height: 720, facingMode: "user" }
  }, null, 3));

  const apply = async () => {
    let stream = null;

    try {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      stream = await navigator.mediaDevices.getUserMedia(JSON.parse(constraints));
      videoRef.current.srcObject = stream;
      setError("");
      /* use the stream */
    } catch (err) {
      setError(err.message);
    }
  }

  const loadedMetadata = () => {
    videoRef.current.play();
  };

  return (
    <div className="App">
      <textarea onChange={(e) => setConstraints(e.target.value)} value={constraints}></textarea><button onClick={apply}>Apply</button>
      <div>
        <video ref={videoRef} onLoadedMetadata={loadedMetadata}></video>
      </div>
      <div className="error">
        {error}
      </div>
    </div>
  );
}

export default App;
