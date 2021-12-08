import './App.css';
import { useEffect, useRef, useState } from 'react';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { BrowserQRCodeReader } from '@zxing/browser';

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [error, setError] = useState();
  const [caps, setCaps] = useState({});
  const [update, setUpdate] = useState(1);
  const [code, setCode] = useState();
  const [constraints, setConstraints] = useState({
    audio: false,
    video: { width: 1280, height: 720, facingMode: "user" }
  });

  useEffect(() => {
    const reader = new BrowserQRCodeReader();
    const hints = new Map();
    const formats = [BarcodeFormat.QR_CODE];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

    const scan = () => {

      if (videoRef.current.srcObject && !videoRef.current.paused) {
        // const canvas = document.getElementById('canvas');//get canvas
        // const video = videoRef.current;
        // canvas.width = video.videoWidth;
        // canvas.height = video.videoHeight;
        // const context = canvas.getContext('2d');//get canvas context
        // context.drawImage(video, 0, 0);

        // const luminanceSource = new RGBLuminanceSource(context.getImageData(0, 0, canvas.width, canvas.height), canvas.width, canvas.height);
        // const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        document.getElementById("contain").style.width = canvasRef.current.width + "px";
        const ctx = canvasRef.current.getContext('2d');
        try {
          const code = reader.decode(videoRef.current);
          const points = code.getResultPoints();
          ctx.strokeStyle = '#7e7';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(points[0].getX(), points[0].getY());
          ctx.lineTo(points[1].getX(), points[1].getY());
          ctx.lineTo(points[2].getX(), points[2].getY());
          ctx.lineTo(points[3].getX(), points[3].getY());
          ctx.lineTo(points[0].getX(), points[0].getY());
          ctx.stroke();
          setCode(code.getText());
        } catch {
          setCode("");
        }
      }
      timer = setTimeout(scan, 250);
    }

    let timer = setTimeout(scan, 250);

    return () => clearTimeout(timer);
  })

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
      const video = { ...constraints.video };
      video[name] = parseFloat(event.target.value);
      setConstraints({ ...constraints, video });
      setUpdate(update + 1);
    }

    const remove = () => {
      const video = { ...constraints.video };
      delete video[name];
      setConstraints({ ...constraints, video });
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
      const video = { ...constraints.video };
      video[name] = event.target.value;
      setConstraints({ ...constraints, video });
    }

    const remove = () => {
      const video = { ...constraints.video };
      delete video[name];
      setConstraints({ ...constraints, video });
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
        {error &&<div className="error">
          {error}
        </div>}
      </div>
      <div id="contain" style={{ position: "relative" }}>
        <video ref={videoRef} onLoadedMetadata={loadedMetadata} style={{ position: "absolute", top: 0, left: 0 }}></video>
        <canvas ref={canvasRef} id="canvas" style={{ position: "absolute", top: 0, left: 0 }}></canvas>
        {code && <div className="code">
          {code}
        </div>}
      </div>

    </div>
  );
}

export default App;
