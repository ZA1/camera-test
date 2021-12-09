import { OpenCvProvider } from 'opencv-react';
import Main from './Main';

function App() {
  return (
    <OpenCvProvider openCvPath='/opencv.js'>
      <Main />
    </OpenCvProvider>
  );
}

export default App;
