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

  const [photos, setPhotos] =
    useState(
      TEMPLATE_MAP[template] ||
      TEMPLATE_MAP.sample
    );


  /*
    Current slot containing live camera.

    0 = first photo
    1 = second photo
    etc.

    null = session finished
  */
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


  /*
    Which text / emoji is currently
    selected for editing.
  */
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


  /*
    Stores video elements for each slot.

    videoRefs.current[0]
    videoRefs.current[1]
    etc.
  */
  const videoRefs =
    useRef([]);


  /*
    Prevent duplicate getUserMedia calls.
  */
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


      /*
        Camera starts inside first slot.
      */
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


    /*
      Switching template means decorations
      should disappear because positions from
      old layout may no longer make sense.
    */
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

      /*
        Important:
        Do not trigger SPACE capture while
        typing inside an input.
      */
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


      /*
        Already counting.
      */
      if (
        isCounting
      ) {
        return;
      }


      /*
        No active frame means session done.
      */
      if (
        currentIndex === null
      ) {
        return;
      }


      /*
        Camera must exist.
      */
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


    /*
      Same behavior as object-fit: cover.
    */
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
    ===================================== */

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
    ===================================== */

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
    ===================================== */

    const nextIndex =
      index + 1;


    if (
      nextIndex <
      photos.length
    ) {

      setCurrentIndex(
        nextIndex
      );


      /*
        Automatically begin next countdown.
      */
      setIsCounting(true);


    } else {

      /*
        Finished all photos.
      */
      setCurrentIndex(null);


      setIsCounting(false);


      stopCamera();

    }
  }


  /* =========================================
     RESIZE DECORATION
  ========================================= */

  function resizeDecoration(
    decorationId,
    amount
  ) {

    setDecorations(
      previous =>

        previous.map(item => {

          if (
            item.id !==
            decorationId
          ) {

            return item;

          }


          const minSize =
            item.type === "emoji"
              ? 20
              : 14;


          const maxSize =
            item.type === "emoji"
              ? 120
              : 100;


          const newSize =
            Math.max(

              minSize,

              Math.min(

                maxSize,

                item.size +
                amount

              )

            );


          return {

            ...item,

            size: newSize

          };

        })

    );
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
     DRAG DECORATION
  ========================================= */

  function startDragging(
    event,
    decorationId
  ) {

    event.preventDefault();


    /*
      Select decoration.
    */
    setSelectedDecorationId(
      decorationId
    );


    const frame =
      templateRef.current;


    if (
      !frame
    ) {
      return;
    }


    const frameRect =
      frame.getBoundingClientRect();


    function moveDecoration(
      moveEvent
    ) {

      let x =
        (
          (
            moveEvent.clientX -
            frameRect.left
          ) /
          frameRect.width
        ) * 100;


      let y =
        (
          (
            moveEvent.clientY -
            frameRect.top
          ) /
          frameRect.height
        ) * 100;


      /*
        Keep decoration inside frame.
      */

      x =
        Math.max(
          3,
          Math.min(
            97,
            x
          )
        );


      y =
        Math.max(
          3,
          Math.min(
            97,
            y
          )
        );


      setDecorations(
        previous =>

          previous.map(item =>

            item.id ===
            decorationId

              ? {
                  ...item,
                  x,
                  y
                }

              : item

          )

      );
    }


    function stopDragging() {

      window.removeEventListener(
        "pointermove",
        moveDecoration
      );


      window.removeEventListener(
        "pointerup",
        stopDragging
      );

    }


    window.addEventListener(
      "pointermove",
      moveDecoration
    );


    window.addEventListener(
      "pointerup",
      stopDragging
    );
  }


  /* =========================================
     DOWNLOAD
  ========================================= */

  const downloadImage =
    useCallback(
      async () => {

        /* ===================================
           VERIFY PHOTOS
        =================================== */

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
        =================================== */

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
        =================================== */

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


        /*
          White opaque background.
        */
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
        =================================== */

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
        =================================== */

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
        =================================== */

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
        =================================== */

        decorations.forEach(
          item => {

            /*
              x and y are percentages of
              the displayed polaroid.
            */

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
        =================================== */

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


    /*
      Important:
      pass a function TO the React setter.
    */
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

      /*
        Clicking blank frame space
        deselects decoration.
      */
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
      ===================================== */}

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
            >

              {/* =================================
                  CAPTURED PHOTO
              ================================= */}

              {photo && (

                <img

                  src={photo}

                  alt={
                    `Captured ${index + 1}`
                  }

                  className="captured-photo"

                />

              )}


              {/* =================================
                  LIVE CAMERA
              ================================= */}

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


              {/* =================================
                  EMPTY FUTURE SLOT
              ================================= */}

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


              {/* =================================
                  COUNTDOWN
              ================================= */}

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


              {/* =================================
                  CAMERA READY
              ================================= */}

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

          /*
            Clicking only empty decoration-layer
            space deselects current item.
          */
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

                /*
                  Clicking or dragging selects it.
                */
                onPointerDown={
                  event =>
                    startDragging(
                      event,
                      item.id
                    )
                }
              >

                {/* =================================
                    CONTENT
                ================================= */}

                <span className="decoration-content">

                  {item.value}

                </span>


                {/* =================================
                    EDIT CONTROLS
                ================================= */}

                {isSelected && (

                  <div
                    className="decoration-controls"

                    /*
                      Do NOT start dragging when
                      clicking control toolbar.
                    */
                    onPointerDown={
                      event => {

                        event.preventDefault();

                        event.stopPropagation();

                      }
                    }
                  >

                    {/* =============================
                        SMALLER
                    ============================= */}

                    <button

                      type="button"

                      title="Make smaller"

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


                          resizeDecoration(
                            item.id,
                            -4
                          );

                        }
                      }
                    >
                      −
                    </button>


                    {/* =============================
                        BIGGER
                    ============================= */}

                    <button

                      type="button"

                      title="Make bigger"

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


                          resizeDecoration(
                            item.id,
                            4
                          );

                        }
                      }
                    >
                      +
                    </button>


                    {/* =============================
                        DELETE
                    ============================= */}

                    <button

                      type="button"

                      className="delete-decoration"

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

                  </div>

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