import "./SampleTemplate.css";
import { useEffect, useRef, useState } from "react";
import Countdown from "./Countdown";
import html2canvas from "html2canvas";

export default function SampleTemplate({ resetSignal, onDownloadReady }) {

  const templateRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [photos, setPhotos] = useState([null, null]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isCounting, setIsCounting] = useState(false);


  /* START CAMERA */
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(s => setStream(s));
  }, []);

  /* RESET */
  useEffect(() => {
    setPhotos([null, null]);
    setActiveIndex(null);
  }, [resetSignal]);
  /* SPACEBAR TO START CAPTURE */
    useEffect(() => {
        function handleKey(e) {
            if (e.code === "Space" && activeIndex !== null) {
                e.preventDefault();
                setIsCounting(true);
            }
        }

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [activeIndex]);



  /* DOWNLOAD FUNCTION */
  function downloadImage() {
    if (!templateRef.current) return;

    html2canvas(templateRef.current, {
      scale: 3
    }).then(canvas => {
      const link = document.createElement("a");
      link.download = "photobooth.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  /* PASS DOWNLOAD FUNCTION TO PARENT */
  useEffect(() => {
    if (onDownloadReady) {
      onDownloadReady(() => downloadImage);
    }
  }, [onDownloadReady]);


  /* TAKE PHOTO */
  function takePhoto(index, videoEl) {
    if (!videoEl) return;

    const canvas = canvasRef.current;

    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0);

    const img = canvas.toDataURL("image/png");

    setPhotos(prev => {
      const copy = [...prev];
      copy[index] = img;
      return copy;
    });

    setActiveIndex(null);
    setIsCounting(false);

  }

  return (
    <div className="polaroid-frame" ref={templateRef}>

      {photos.map((photo, index) => (
        <div
          key={index}
          className="photo-slot"
          onClick={() => {
            if (!photo) {
                setActiveIndex(index);
                setIsCounting(false);
            }

          }}
        >

          {/* PHOTO */}
          {photo && <img src={photo} />}

          {/* LIVE CAMERA */}
          {!photo && (
            <video
              autoPlay
              muted
              playsInline
              ref={(el) => {
                if (el && stream) {
                  el.srcObject = stream;
                }
              }}
            />
          )}

          {/* COUNTDOWN */}
          {activeIndex === index && isCounting && (
            <div className="countdown-layer">
              <Countdown
                onFinish={(videoEl) =>
                  takePhoto(index, videoEl)
                }
              />
            </div>
          )}

        </div>
      ))}

      <p className="hint">Press SPACE to capture</p>


      <canvas ref={canvasRef} hidden />

    </div>
  );
}
