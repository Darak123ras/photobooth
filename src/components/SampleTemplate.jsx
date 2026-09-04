import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import Countdown from "./Countdown";

import "./SampleTemplate.css";


/* =========================================
   TEMPLATE DEFINITIONS
========================================= */

const TEMPLATE_MAP = {
  sample: [
    null,
    null
  ],

  triple: [
    null,
    null,
    null
  ],

  quad: [
    null,
    null,
    null,
    null
  ]
};


export default function SampleTemplate({
  resetSignal,
  onDownloadReady,
  template,
  decorations,
  setDecorations
}) {

  /* =========================================
     STATE
  ========================================= */

  const [
    photos,
    setPhotos
  ] = useState(
    TEMPLATE_MAP[template] ||
    TEMPLATE_MAP.sample
  );


  const [
    currentIndex,
    setCurrentIndex
  ] = useState(null);


  const [
    isCounting,
    setIsCounting
  ] = useState(false);


  const [
    stream,
    setStream
  ] = useState(null);


  const [
    selectedDecorationId,
    setSelectedDecorationId
  ] = useState(null);


  /* =========================================
     REFS
  ========================================= */

  const templateRef =
    useRef(null);


  const canvasRef =
    useRef(null);


  const streamRef =
    useRef(null);


  const videoRefs =
    useRef([]);


  const cameraStartingRef =
    useRef(false);


  /* =========================================
     START CAMERA
  ========================================= */

  async function startCamera() {

    if (
      streamRef.current ||
      cameraStartingRef.current
    ) {
      return;
    }


    try {

      cameraStartingRef.current =
        true;


      const cameraStream =
        await navigator.mediaDevices
          .getUserMedia({

            video: {

              width: {
                ideal: 1280
              },

              height: {
                ideal: 960
              },

              facingMode: "user"

            },

            audio: false

          });


      streamRef.current =
        cameraStream;


      setStream(
        cameraStream
      );


      setCurrentIndex(0);


    } catch (error) {

      console.error(
        "Camera error:",
        error
      );

    } finally {

      cameraStartingRef.current =
        false;

    }
  }


  /* =========================================
     STOP CAMERA
  ========================================= */

  function stopCamera() {

    if (
      !streamRef.current
    ) {
      return;
    }


    streamRef.current
      .getTracks()
      .forEach(track => {

        track.stop();

      });


    streamRef.current =
      null;


    setStream(null);
  }


  /* =========================================
     COMPONENT LOAD
  ========================================= */

  useEffect(() => {

    startCamera();


    return () => {

      stopCamera();

    };

  }, []);


  /* =========================================
     TEMPLATE CHANGE
  ========================================= */

  useEffect(() => {

    const newPhotos =
      TEMPLATE_MAP[template] ||
      TEMPLATE_MAP.sample;


    setPhotos([
      ...newPhotos
    ]);


    setIsCounting(false);


    setCurrentIndex(0);


    setSelectedDecorationId(null);


    setDecorations([]);


    if (
      !streamRef.current
    ) {

      startCamera();

    }

  }, [
    template,
    setDecorations
  ]);


  /* =========================================
     RESET SESSION
  ========================================= */

  useEffect(() => {

    const newPhotos =
      TEMPLATE_MAP[template] ||
      TEMPLATE_MAP.sample;


    setPhotos([
      ...newPhotos
    ]);


    setIsCounting(false);


    setCurrentIndex(0);


    setSelectedDecorationId(null);


    if (
      !streamRef.current
    ) {

      startCamera();

    }

  }, [
    resetSignal,
    template
  ]);


  /* =========================================
     SPACEBAR CAPTURE
  ========================================= */

  useEffect(() => {

    function handleSpacebar(
      event
    ) {

      const activeElement =
        document.activeElement;


      const isTyping =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA";


      if (
        isTyping
      ) {
        return;
      }


      if (
        event.code !== "Space"
      ) {
        return;
      }


      event.preventDefault();


      if (
        isCounting
      ) {
        return;
      }


      if (
        currentIndex === null
      ) {
        return;
      }


      if (
        !streamRef.current
      ) {
        return;
      }


      setIsCounting(true);
    }


    window.addEventListener(
      "keydown",
      handleSpacebar
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleSpacebar
      );

    };

  }, [
    currentIndex,
    isCounting
  ]);


  /* =========================================
     CAPTURE PHOTO
  ========================================= */

  function takePhoto(
    index
  ) {

    const videoElement =
      videoRefs.current[index];


    if (
      !videoElement
    ) {

      console.warn(
        "Video element not ready"
      );

      setIsCounting(false);

      return;
    }


    if (
      !videoElement.videoWidth ||
      !videoElement.videoHeight
    ) {

      console.warn(
        "Camera video is not ready yet"
      );

      setIsCounting(false);

      return;
    }


    const canvas =
      canvasRef.current;


    const context =
      canvas.getContext("2d");


    /* =====================================
       CREATE 3:4 CROP
    ===================================== */

    const targetRatio =
      3 / 4;


    const videoWidth =
      videoElement.videoWidth;


    const videoHeight =
      videoElement.videoHeight;


    const videoRatio =
      videoWidth /
      videoHeight;


    let sourceX;
    let sourceY;

    let sourceWidth;
    let sourceHeight;


    if (
      videoRatio >
      targetRatio
    ) {

      sourceHeight =
        videoHeight;


      sourceWidth =
        sourceHeight *
        targetRatio;


      sourceX =
        (
          videoWidth -
          sourceWidth
        ) / 2;


      sourceY = 0;


    } else {

      sourceWidth =
        videoWidth;


      sourceHeight =
        sourceWidth /
        targetRatio;


      sourceX = 0;


      sourceY =
        (
          videoHeight -
          sourceHeight
        ) / 2;

    }


    canvas.width =
      Math.round(
        sourceWidth
      );


    canvas.height =
      Math.round(
        sourceHeight
      );


    /* =====================================
       MIRROR PHOTO
    ========================================= */

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

      videoElement,

      sourceX,
      sourceY,

      sourceWidth,
      sourceHeight,

      0,
      0,

      canvas.width,
      canvas.height

    );


    context.restore();


    const capturedPhoto =
      canvas.toDataURL(
        "image/png"
      );


    /* =====================================
       STORE PHOTO
    ========================================= */

    setPhotos(
      previousPhotos => {

        const updatedPhotos = [
          ...previousPhotos
        ];


        updatedPhotos[index] =
          capturedPhoto;


        return updatedPhotos;
      }
    );


    /* =====================================
       NEXT PHOTO
    ========================================= */

    const nextIndex =
      index + 1;


    if (
      nextIndex <
      photos.length
    ) {

      setCurrentIndex(
        nextIndex
      );


      setIsCounting(true);


    } else {

      setCurrentIndex(null);


      setIsCounting(false);


      stopCamera();

    }
  }


  /* =========================================
     DELETE DECORATION
  ========================================= */

  function deleteDecoration(
    decorationId
  ) {

    setDecorations(
      previous =>
        previous.filter(
          item =>
            item.id !==
            decorationId
        )
    );


    setSelectedDecorationId(
      null
    );
  }


  /* =========================================
     MOVE DECORATION
  ========================================= */

  function startDragging(
    event,
    decorationId
  ) {

    event.preventDefault();

    event.stopPropagation();


    setSelectedDecorationId(
      decorationId
    );


    const frame =
      templateRef.current;


    if (!frame) {
      return;
    }


    const frameRect =
      frame.getBoundingClientRect();


    const decoration =
      decorations.find(
        item =>
          item.id ===
          decorationId
      );


    if (!decoration) {
      return;
    }


    const startPointerX =
      event.clientX;


    const startPointerY =
      event.clientY;


    const startX =
      decoration.x;


    const startY =
      decoration.y;


    function handleMove(
      moveEvent
    ) {

      const deltaX =
        moveEvent.clientX -
        startPointerX;


      const deltaY =
        moveEvent.clientY -
        startPointerY;


      const deltaPercentX =
        (
          deltaX /
          frameRect.width
        ) * 100;


      const deltaPercentY =
        (
          deltaY /
          frameRect.height
        ) * 100;


      let newX =
        startX +
        deltaPercentX;


      let newY =
        startY +
        deltaPercentY;


      newX =
        Math.max(
          3,
          Math.min(
            97,
            newX
          )
        );


      newY =
        Math.max(
          3,
          Math.min(
            97,
            newY
          )
        );


      setDecorations(
        previous =>
          previous.map(item =>

            item.id ===
            decorationId

              ? {
                  ...item,
                  x: newX,
                  y: newY
                }

              : item

          )
      );
    }


    function stopDragging() {

      window.removeEventListener(
        "pointermove",
        handleMove
      );


      window.removeEventListener(
        "pointerup",
        stopDragging
      );

    }


    window.addEventListener(
      "pointermove",
      handleMove
    );


    window.addEventListener(
      "pointerup",
      stopDragging
    );
  }


  /* =========================================
     FREE RESIZE DECORATION
  ========================================= */

  function startResizing(
    event,
    decorationId
  ) {

    event.preventDefault();

    event.stopPropagation();


    setSelectedDecorationId(
      decorationId
    );


    const decoration =
      decorations.find(
        item =>
          item.id ===
          decorationId
      );


    if (!decoration) {
      return;
    }


    const startPointerX =
      event.clientX;


    const startPointerY =
      event.clientY;


    const startSize =
      Number(
        decoration.size
      );


    function handleResize(
      moveEvent
    ) {

      const deltaX =
        moveEvent.clientX -
        startPointerX;


      const deltaY =
        moveEvent.clientY -
        startPointerY;


      /*
        Bottom-right movement:
        larger

        Top-left movement:
        smaller
      */
      const change =
        (
          deltaX +
          deltaY
        ) / 2;


      const minSize =
        decoration.type ===
        "emoji"
          ? 20
          : 14;


      const maxSize =
        decoration.type ===
        "emoji"
          ? 150
          : 120;


      const newSize =
        Math.max(
          minSize,

          Math.min(
            maxSize,

            startSize +
            change
          )
        );


      setDecorations(
        previous =>
          previous.map(item =>

            item.id ===
            decorationId

              ? {
                  ...item,
                  size: newSize
                }

              : item

          )
      );
    }


    function stopResizing() {

      window.removeEventListener(
        "pointermove",
        handleResize
      );


      window.removeEventListener(
        "pointerup",
        stopResizing
      );

    }


    window.addEventListener(
      "pointermove",
      handleResize
    );


    window.addEventListener(
      "pointerup",
      stopResizing
    );
  }


  /* =========================================
     DOWNLOAD
  ========================================= */

  const downloadImage =
    useCallback(
      async () => {

        const completedPhotos =
          photos.filter(Boolean);


        if (
          completedPhotos.length !==
          photos.length
        ) {

          alert(
            "Finish taking all photos before downloading."
          );

          return;
        }


        /* ===================================
           EXPORT DIMENSIONS
        ========================================= */

        const PHOTO_WIDTH =
          900;


        const PHOTO_HEIGHT =
          1200;


        const PADDING =
          90;


        const GAP =
          45;


        const BOTTOM_PADDING =
          130;


        let columns;
        let rows;


        if (
          photos.length === 2
        ) {

          columns = 2;
          rows = 1;


        } else if (
          photos.length === 3
        ) {

          columns = 3;
          rows = 1;


        } else {

          columns = 2;
          rows = 2;

        }


        const exportWidth =

          PADDING * 2 +

          PHOTO_WIDTH *
          columns +

          GAP *
          (
            columns - 1
          );


        const exportHeight =

          PADDING +

          PHOTO_HEIGHT *
          rows +

          GAP *
          (
            rows - 1
          ) +

          BOTTOM_PADDING;


        /* ===================================
           CREATE EXPORT CANVAS
        ========================================= */

        const exportCanvas =
          document.createElement(
            "canvas"
          );


        exportCanvas.width =
          exportWidth;


        exportCanvas.height =
          exportHeight;


        const context =
          exportCanvas.getContext(
            "2d"
          );


        context.fillStyle =
          "#ffffff";


        context.fillRect(
          0,
          0,
          exportWidth,
          exportHeight
        );


        context.imageSmoothingEnabled =
          true;


        context.imageSmoothingQuality =
          "high";


        /* ===================================
           LOAD PHOTOS
        ========================================= */

        const loadedImages =
          await Promise.all(

            photos.map(photo =>

              new Promise(
                (
                  resolve,
                  reject
                ) => {

                  const image =
                    new Image();


                  image.onload =
                    () =>
                      resolve(
                        image
                      );


                  image.onerror =
                    reject;


                  image.src =
                    photo;

                }
              )

            )

          );


        /* ===================================
           DRAW PHOTOS
        ========================================= */

        loadedImages.forEach(
          (
            image,
            index
          ) => {

            let column;
            let row;


            if (
              photos.length === 4
            ) {

              column =
                index % 2;


              row =
                Math.floor(
                  index / 2
                );


            } else {

              column =
                index;


              row =
                0;

            }


            const x =

              PADDING +

              column *
              (
                PHOTO_WIDTH +
                GAP
              );


            const y =

              PADDING +

              row *
              (
                PHOTO_HEIGHT +
                GAP
              );


            context.drawImage(

              image,

              x,
              y,

              PHOTO_WIDTH,
              PHOTO_HEIGHT

            );

          }
        );


        /* ===================================
           FOOTER
        ========================================= */

        context.save();


        context.fillStyle =
          "#805d69";


        context.textAlign =
          "center";


        context.textBaseline =
          "middle";


        context.font =
          "600 38px Segoe UI, Arial";


        context.fillText(

          "mini booth ♡",

          exportWidth / 2,

          exportHeight - 48

        );


        context.restore();


        /* ===================================
           DRAW DECORATIONS
        ========================================= */

        decorations.forEach(
          item => {

            const x =
              (
                item.x /
                100
              ) *
              exportWidth;


            const y =
              (
                item.y /
                100
              ) *
              exportHeight;


            context.save();


            context.textAlign =
              "center";


            context.textBaseline =
              "middle";


            /* =============================
               TEXT
            ============================= */

            if (
              item.type ===
              "text"
            ) {

              const exportedSize =
                item.size * 3;


              context.font =
                `800 ${exportedSize}px Segoe UI, Arial`;


              context.fillStyle =
                item.color ||
                "#ffffff";


              context.shadowColor =
                "rgba(0, 0, 0, 0.38)";


              context.shadowBlur =
                12;


              context.shadowOffsetX =
                0;


              context.shadowOffsetY =
                6;


              context.fillText(

                item.value,

                x,
                y

              );

            }


            /* =============================
               EMOJI
            ============================= */

            if (
              item.type ===
              "emoji"
            ) {

              const exportedSize =
                item.size * 3;


              context.font =
                `${exportedSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;


              context.shadowColor =
                "rgba(0, 0, 0, 0.14)";


              context.shadowBlur =
                8;


              context.shadowOffsetY =
                4;


              context.fillText(

                item.value,

                x,
                y

              );

            }


            context.restore();

          }
        );


        /* ===================================
           DOWNLOAD PNG
        ========================================= */

        const imageUrl =
          exportCanvas.toDataURL(
            "image/png"
          );


        const link =
          document.createElement(
            "a"
          );


        link.download =
          `mini-booth-${Date.now()}.png`;


        link.href =
          imageUrl;


        link.click();

      },

      [
        photos,
        decorations
      ]

    );


  /* =========================================
     GIVE DOWNLOAD FUNCTION TO STUDIO
  ========================================= */

  useEffect(() => {

    if (
      !onDownloadReady
    ) {
      return;
    }


    onDownloadReady(
      () =>
        downloadImage
    );


  }, [
    downloadImage,
    onDownloadReady
  ]);


  /* =========================================
     RENDER
  ========================================= */

  return (

    <div

      className={
        `polaroid-frame layout-${photos.length}`
      }

      ref={templateRef}

      onPointerDown={event => {

        if (
          event.target ===
          event.currentTarget
        ) {

          setSelectedDecorationId(
            null
          );

        }

      }}

    >

      {/* =====================================
          PHOTO SLOTS
      ========================================= */}

      {photos.map(
        (
          photo,
          index
        ) => {

          const isActive =
            currentIndex ===
            index;


          return (

            <div

              key={index}

              className={
                `photo-slot ${
                  isActive
                    ? "active-slot"
                    : ""
                }`
              }

              onPointerDown={() =>
                setSelectedDecorationId(
                  null
                )
              }

            >

              {/* CAPTURED PHOTO */}

              {photo && (

                <img

                  src={photo}

                  alt={
                    `Captured ${index + 1}`
                  }

                  className="captured-photo"

                />

              )}


              {/* LIVE CAMERA */}

              {!photo &&
                isActive &&
                stream && (

                  <video

                    ref={element => {

                      videoRefs.current[index] =
                        element;


                      if (
                        element &&
                        stream
                      ) {

                        element.srcObject =
                          stream;

                      }

                    }}

                    autoPlay

                    muted

                    playsInline

                    className="slot-video"

                  />

                )}


              {/* EMPTY FUTURE SLOT */}

              {!photo &&
                !isActive && (

                  <div className="empty-photo-slot">

                    <span>
                      {index + 1}
                    </span>

                    <small>
                      Next photo
                    </small>

                  </div>

                )}


              {/* COUNTDOWN */}

              {isActive &&
                isCounting && (

                  <div className="countdown-layer">

                    <Countdown
                      onFinish={() =>
                        takePhoto(
                          index
                        )
                      }
                    />

                  </div>

                )}


              {/* CAMERA STATUS */}

              {!photo &&
                isActive &&
                !isCounting && (

                  <div className="camera-status">

                    <span className="camera-status-dot" />

                    PHOTO {index + 1}

                  </div>

                )}

            </div>

          );

        }
      )}


      {/* =========================================
          DECORATIONS
      ========================================= */}

      <div
        className="decoration-layer"

        onPointerDown={event => {

          if (
            event.target ===
            event.currentTarget
          ) {

            setSelectedDecorationId(
              null
            );

          }

        }}
      >

        {decorations.map(
          item => {

            const isSelected =
              selectedDecorationId ===
              item.id;


            return (

              <div

                key={item.id}

                className={`
                  collage-decoration
                  decoration-${item.type}
                  ${
                    isSelected
                      ? "decoration-selected"
                      : ""
                  }
                `}

                style={{

                  left:
                    `${item.x}%`,

                  top:
                    `${item.y}%`,

                  fontSize:
                    `${item.size}px`,

                  color:
                    item.color ||
                    "#ffffff"

                }}

                onPointerDown={
                  event =>
                    startDragging(
                      event,
                      item.id
                    )
                }

              >

                {/* DECORATION CONTENT */}

                <span className="decoration-content">

                  {item.value}

                </span>


                {/* =================================
                    EDIT HANDLES
                ================================= */}

                {isSelected && (

                  <>

                    {/* DELETE - TOP LEFT */}

                    <button

                      type="button"

                      className="decoration-delete"

                      title="Delete"

                      onPointerDown={
                        event => {

                          event.preventDefault();

                          event.stopPropagation();

                        }
                      }

                      onClick={
                        event => {

                          event.preventDefault();

                          event.stopPropagation();


                          deleteDecoration(
                            item.id
                          );

                        }
                      }

                    >
                      ×
                    </button>


                    {/* RESIZE - BOTTOM RIGHT */}

                    <div

                      className="decoration-resizer"

                      title="Drag to resize"

                      onPointerDown={
                        event =>
                          startResizing(
                            event,
                            item.id
                          )
                      }

                    />

                  </>

                )}

              </div>

            );

          }
        )}

      </div>


      {/* =========================================
          HIDDEN CAPTURE CANVAS
      ========================================= */}

      <canvas
        ref={canvasRef}
        hidden
      />

    </div>

  );
}
