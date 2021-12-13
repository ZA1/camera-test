import './App.css';
import { useEffect, useRef, useState } from 'react';
import validSound  from './valid.mp3';
import useSound from 'use-sound';

function Main({cv}) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [error, setError] = useState();
  const [caps, setCaps] = useState({});
  const [update, setUpdate] = useState(1);
  const [code, setCode] = useState();
  const [gridSize, setGridSize] = useState(8);
  const [clipLimit, setClipLimit] = useState(40);
  const [threshold, setThreshold] = useState(100);
  const [maxVal, setMaxVal] = useState(150);
  const [applyThreshold, setApplyThreshold] = useState(true);
  //const [type, setType] = useState(0);
  const [beep] = useSound(validSound);
  const [constraints, setConstraints] = useState({
    audio: false,
    video: { width: 1280, height: 720, facingMode: "user" }
  });

  useEffect(() => {
    
    let detector;
    
    if(cv) {
        detector = new cv.wechat_qrcode_WeChatQRCode(
          "wechat_qrcode/detect.prototxt",
          "wechat_qrcode/detect.caffemodel",
          "wechat_qrcode/sr.prototxt",
          "wechat_qrcode/sr.caffemodel"
        );
    }

    const scan = () => {
      if (videoRef.current.srcObject && !videoRef.current.paused) {
        const canvas = document.getElementById('canvas');//get canvas
        const video = videoRef.current;
        //const video = document.getElementById("test");

        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // canvas.width = 350;
        // canvas.height = 350;
        // const xCut = (video.offsetWidth - canvas.width) / 2;
        // const yCut = (video.offsetHeight - canvas.height) / 2;
        // const context = canvas.getContext('2d');//get canvas context
        // context.drawImage(video, -xCut, -yCut, video.offsetWidth, video.offsetHeight);
        //const data = context.getImageData(0, 0, video.videoWidth, video.videoHeight);

        // const luminanceSource = new RGBLuminanceSource(context.getImageData(0, 0, canvas.width, canvas.height), canvas.width, canvas.height);
        // const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
        //canvasRef.current.width = videoRef.current.videoWidth;
        //canvasRef.current.height = videoRef.current.videoHeight;
        // document.getElementById("contain").style.width = canvasRef.current.width + "px";
        // const ctx = canvasRef.current.getContext('2d');
        try {
          let src = cv.imread(canvas);
          const out = new cv.MatVector()
          const results = detector.detectAndDecode(src, out);
          let i = 0
          const arr = []
          while(i < results.size()) {
            arr.push(results.get(i++))
          }
          results.delete();
          out.delete();
//           let equalDst = new cv.Mat();
//             let claheDst = new cv.Mat();
//             cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
//             cv.equalizeHist(src, equalDst);
//             let tileGridSize = new cv.Size(gridSize, gridSize);
//             // You can try more different parameters
//             let clahe = new cv.CLAHE(clipLimit, tileGridSize);
//             clahe.apply(src, claheDst);
//             //let M = cv.Mat.ones(2, 2, cv.CV_8U);
// // You can try more different parameters
// //cv.morphologyEx(equalDst, equalDst, cv.MORPH_CLOSE, M);
//             console.log(applyThreshold);
//             if(applyThreshold) {
//               cv.threshold(equalDst, equalDst, threshold, maxVal, cv.THRESH_BINARY);
//             }
//             cv.imshow('canvasOutput', equalDst);
//             //cv.imshow('canvasOutput', claheDst);
//             src.delete(); equalDst.delete(); claheDst.delete(); clahe.delete();
//           const code = reader.decodeFromCanvas(document.getElementById('canvasOutput'));

          if(arr.length > 0) {
            setCode(arr[0]);
            beep();
          }
          // const points = code.getResultPoints();
          // ctx.strokeStyle = '#7e7';
          // ctx.lineWidth = 3;
          // ctx.beginPath();
          // ctx.moveTo(points[0].getX(), points[0].getY());
          // ctx.lineTo(points[1].getX(), points[1].getY());
          // ctx.lineTo(points[2].getX(), points[2].getY());
          // ctx.lineTo(points[3].getX(), points[3].getY());
          // ctx.lineTo(points[0].getX(), points[0].getY());
          // ctx.stroke();
          
        } catch(err) {
          //console.error(err);
          setCode("");
        }
      }
      timer = setTimeout(scan, 250);
    }

    let timer = setTimeout(scan, 250);

    return () => {
      detector?.delete();
      clearTimeout(timer);
    }
  }, [applyThreshold, beep, clipLimit, code, cv, gridSize, maxVal, threshold])

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
      <div id="contain">
        <video ref={videoRef} onLoadedMetadata={loadedMetadata} style={{  top: 0, left: 0 }}></video>
        <canvas ref={canvasRef} id="canvas" style={{ top: 0, left: 0 }}></canvas>
        {code && <div className="code">
          {code}
        </div>}
      </div>
      <div className='settings'>
        <label>Grid Size</label>
        <div>
          <input type="range" value={gridSize} onChange={(e) => setGridSize(parseFloat(e.target.value))} min="1" max="10" />
          <input type="number" value={gridSize} onChange={(e) => setGridSize(parseFloat(e.target.value))} min="1" max="10" />
        </div>
        <label>Clip Limit</label>
        <div>
          <input type="range" value={clipLimit} onChange={(e) => setClipLimit(parseFloat(e.target.value))} min="1" max="255" />
          <input type="number" value={clipLimit} onChange={(e) => setClipLimit(parseFloat(e.target.value))} min="1" max="255" />
        </div>
        <label>Threshold</label>
        <div>
          <input type="range" value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} min="1" max="255" />
          <input type="number" value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} min="1" max="255" />
        </div>
        <label>Max Val</label>
        <div>
          <input type="range" value={maxVal} onChange={(e) => setMaxVal(parseFloat(e.target.value))} min="1" max="255" />
          <input type="number" value={maxVal} onChange={(e) => setMaxVal(parseFloat(e.target.value))} min="1" max="255" />
        </div>
        <label>Apply Threshold</label>
        <div>
          <label><input type="checkbox" checked={applyThreshold} onChange={(e) => {setApplyThreshold(e.target.checked); } } /> Apply</label>
          
        </div>
      </div>
      <canvas id="canvasOutput"></canvas>
    </div>
  );
}

export default Main;
