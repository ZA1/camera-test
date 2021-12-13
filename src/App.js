import React, { useCallback, useEffect, useState } from 'react';
import Main from './Main';

const scriptTagId = "open-cv-script-tag";
// const detectModelTask = fetch("/models/detect.caffemodel");
// const detectProtoTxtTask = fetch("/models/detect.prototxt");
// const srModelTask = fetch("/models/sr.caffemodel");
// const srProtoTxtTask = fetch("/models/sr.prototxt");

function App() {
  const [cv, setCv] = useState();

  // const loadModels = useCallback(async () => {
  //   window.Module.FS_createPath("/", "models", true, true);
  //   for (const file of fileTasks) {
  //     const result = await file.fetch;
  //     const buffer = await result.arrayBuffer();
  //     window.Module.FS_createDataFile(`/models/${file.fileName}`, null, Uint8Array.from(buffer), true, true, true)
  //   }
  // }, []);

  const moduleLoaded = useCallback(async () => {
    setCv(await window.cv);
  }, [setCv]);

  useEffect(() => {
    if(!document.getElementById(scriptTagId)) {
      window.Module = {
        //preRun: loadModels,
        onRuntimeInitialized: moduleLoaded,
        print: function(text) {
          console.log(text);
        },
        printErr: function(text) {
          console.error(text);
        },
      };
      
      const tag = document.createElement("script");
      tag.id = scriptTagId;
      tag.src = "/opencv_custom.js";
      tag.nonce = true;
      tag.defer = true;
      tag.async = true;
      document.body.appendChild(tag);

      const dataFilesTag = document.createElement("script");
      dataFilesTag.id = scriptTagId;
      dataFilesTag.src = "/wechat_qrcode_files.js";
      dataFilesTag.nonce = true;
      dataFilesTag.defer = true;
      dataFilesTag.async = true;
      document.body.appendChild(dataFilesTag);

      //fileTasks = modelFiles.map(f => { return {fileName: f, fetch: fetch(`/models/${f}`)}});
    }
  }, [moduleLoaded]);

  return (
    <Main cv={cv} />
  );
}

export default App;
