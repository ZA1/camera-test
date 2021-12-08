import './App.css';
import { useRef, useState } from 'react';

function App() {
  const videoRef = useRef();
  const [error, setError] = useState();
  const [caps, setCaps] = useState({});
  const [update, setUpdate] = useState(1);
  const [constraints, setConstraints] = useState({
    audio: false,
    video: { width: 1280, height: 720, facingMode: "user" }
  });

  const apply = async () => {
    let stream = null;

    try {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      setCaps(stream.getTracks()[0].getCapabilities());
      console.log(stream.getTracks()[0].getConstraints());
      setError("");
      /* use the stream */
    } catch (err) {
      setError(err.message);
    }
  }

  const loadedMetadata = () => {
    videoRef.current.play();
  };

  const Slider = (name, cap) => {
    const change = (event) => {
      const video = {...constraints.video};
      video[name] = parseFloat(event.target.value);
      setConstraints({...constraints, video});
      setUpdate(update + 1);
    }

    const remove = () => {
      const video = {...constraints.video};
      delete video[name];
      setConstraints({...constraints, video});
      setUpdate(update + 1);
    }

    const value = constraints.video[name];
    return <div key={name + "-edt"}>
      <input className="range" key={name + "-range"} update={update} type="range" max={cap.max} min={cap.min} step={cap.step} value={value} onChange={change} />
      <input className="val" key={name + "-num"} update={update} type="number" max={cap.max} min={cap.min} step={cap.step || 0.01} value={value} onChange={change} />
      <button onClick={remove}>X</button>
      </div>;
  }

  const Select = (name, cap) => {
    const change = (event) => {
      const video = {...constraints.video};
      video[name] = event.target.value;
      setConstraints({...constraints, video});
    }

    const remove = () => {
      const video = {...constraints.video};
      delete video[name];
      setConstraints({...constraints, video});
    }

    return <div>
      <select value={constraints.video[cap]} onChange={change}>
        {cap.map(v => <option>{v}</option>)}
      </select>
      <button onClick={remove}>X</button>
    </div>;
  }

  return (
    <div className="App">
      <div>
        <pre className="caps">{JSON.stringify(constraints, null, 3)}</pre>
        <div className="settings">
          {Object.keys(caps).map(cap => 
              <>
              <label>{cap}</label>
              {Array.isArray(caps[cap])
                ? Select(cap, caps[cap])
                : (typeof caps[cap]) === "object" 
                  ? Slider(cap, caps[cap])
                  : <pre>{caps[cap]}</pre>}
            </>
          )}
        </div>
        <button onClick={apply}>Apply</button>
      </div>
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
