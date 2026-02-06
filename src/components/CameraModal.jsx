import { useEffect, useRef, useState } from "react";
import Countdown from "./Countdown";
import "./CameraModal.css";

export default function CameraModal({ onCapture }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [counting, setCounting] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      });
  }, []);

  function takePhoto() {
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    onCapture(c.toDataURL("image/png"));
  }

  return (
    <div className="modal">

      <video ref={videoRef} autoPlay />

      {!counting && (
        <button onClick={() => setCounting(true)}>
          Capture
        </button>
      )}

      {counting && <Countdown onFinish={takePhoto} />}

      <canvas ref={canvasRef} hidden />

    </div>
  );
}
