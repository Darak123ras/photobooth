import {
  useEffect,
  useRef,
  useState
} from "react";

import Countdown from "./Countdown";

import "./CameraModal.css";

export default function CameraModal({
  onCapture
}) {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [counting, setCounting] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");


  useEffect(() => {

    let stream;

    async function startCamera() {

      try {

        stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user"
            },
            audio: false
          });

        if (videoRef.current) {

          videoRef.current.srcObject =
            stream;

        }

      } catch (error) {

        console.error(
          "Unable to access camera:",
          error
        );

        setCameraError(
          "Camera access was blocked. Please allow camera permission."
        );

      }
    }


    startCamera();


    return () => {

      if (stream) {

        stream
          .getTracks()
          .forEach(track =>
            track.stop()
          );

      }

    };

  }, []);


  function takePhoto() {

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;


    if (
      !video ||
      !canvas ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      return;
    }


    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;


    const context =
      canvas.getContext("2d");


    /*
      Mirror final photo because
      selfie camera preview is mirrored.
    */

    context.save();

    context.translate(
      canvas.width,
      0
    );

    context.scale(
      -1,
      1
    );

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.restore();


    const photo =
      canvas.toDataURL(
        "image/png"
      );


    onCapture(photo);

    setCounting(false);
  }


  return (
    <div className="camera-modal">

      <div className="camera-window">

        <div className="camera-top">

          <span>
            📸 Photobooth
          </span>

          <span className="live-badge">
            <span />
            LIVE
          </span>

        </div>


        <div className="camera-preview">

          {cameraError ? (

            <div className="camera-error">
              {cameraError}
            </div>

          ) : (

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
            />

          )}


          {counting && (

            <div className="countdown-overlay">

              <Countdown
                onFinish={takePhoto}
              />

            </div>

          )}

        </div>


        <div className="camera-controls">

          {!counting && (
            <button
              className="capture-button"
              onClick={() =>
                setCounting(true)
              }
              disabled={Boolean(cameraError)}
            >
              <span className="capture-circle">
                <span />
              </span>

              Take Photo
            </button>
          )}


          {counting && (
            <p className="camera-ready-text">
              Get ready ♡
            </p>
          )}

        </div>

      </div>


      <canvas
        ref={canvasRef}
        hidden
      />

    </div>
  );
}