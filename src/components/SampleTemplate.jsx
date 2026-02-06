import "./SampleTemplate.css";
import { useEffect, useRef, useState } from "react";
import Countdown from "./Countdown";
import html2canvas from "html2canvas";

const TEMPLATE_MAP = {
  sample: [null, null],
  triple: [null, null, null],
  quad: [null, null, null, null]
};



export default function SampleTemplate({ resetSignal, onDownloadReady, template }){
    const [photos, setPhotos] = useState(
        TEMPLATE_MAP[template] || TEMPLATE_MAP.sample
        );




  const templateRef = useRef(null);
  const canvasRef = useRef(null);
    const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
//   const [photos, setPhotos] = useState([null, null]);
    const [currentIndex, setCurrentIndex] = useState(null);

  const [isCounting, setIsCounting] = useState(false);

    useEffect(() => {
        setPhotos(TEMPLATE_MAP[template] || TEMPLATE_MAP.sample);
        setCurrentIndex(null);
        setIsCounting(false);
        startCamera();
    }, [template]);







  /* START CAMERA */
    async function startCamera() {
        if (streamRef.current) return;

        try {
            const s = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 960 }
            }
            });

            streamRef.current = s;
            setStream(s);
        } catch (err) {
            console.error("Camera error:", err);
        }
    }


    function stopCamera() {
        if (!streamRef.current) return;

        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setStream(null);
    }
    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);




  /* RESET */
    useEffect(() => {
        setPhotos(TEMPLATE_MAP[template]);
        setCurrentIndex(null);
        setIsCounting(false);
        startCamera();
    }, [resetSignal]);

    


  /* SPACEBAR TO START CAPTURE */

    useEffect(() => {
        function handleKey(e) {
            if (e.code === "Space") {
            e.preventDefault();

            // start only if not already running
                if (currentIndex === null && streamRef.current) {
                    setCurrentIndex(0);
                    setIsCounting(true);
                }
            }
        }

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [currentIndex]);




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
    const ctx = canvas.getContext("2d");

    // Match canvas to slot ratio (3:4)
    const targetRatio = 3 / 4;

    const videoWidth = videoEl.videoWidth;
    const videoHeight = videoEl.videoHeight;
    const videoRatio = videoWidth / videoHeight;

    let sx, sy, sw, sh;

    // Crop center (cover behavior)
    if (videoRatio > targetRatio) {
        // Video too wide
        sh = videoHeight;
        sw = sh * targetRatio;
        sx = (videoWidth - sw) / 2;
        sy = 0;
    } else {
        // Video too tall
        sw = videoWidth;
        sh = sw / targetRatio;
        sx = 0;
        sy = (videoHeight - sh) / 2;
    }

    canvas.width = sw;
    canvas.height = sh;

    ctx.drawImage(
        videoEl,
        sx, sy, sw, sh,
        0, 0, sw, sh
    );

    const img = canvas.toDataURL("image/png");

    setPhotos(prev => {
        const copy = [...prev];
        copy[index] = img;
        return copy;
    });

    if (index < photos.length - 1) {
        setCurrentIndex(index + 1);
        setIsCounting(true);
    } else {
        setCurrentIndex(null);
        setIsCounting(false);
        stopCamera();
    }
    }



  return (
    <>
        <div className="polaroid-frame" ref={templateRef}>

        {photos.map((photo, index) => (
            <div key={index} className="photo-slot">

                {photo && <img src={photo} />}

                {!photo && streamRef.current && (
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

                {currentIndex === index && isCounting && (
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


        {/* <p className="hint">Press SPACE to capture</p> */}


        <canvas ref={canvasRef} hidden />

        </div>

    </>
  );
}
