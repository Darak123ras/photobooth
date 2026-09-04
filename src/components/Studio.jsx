import "./Studio.css";

import { useState } from "react";

import TemplateSelector from "./TemplateSelector";
import SampleTemplate from "./SampleTemplate";

export default function Studio({ onBack }) {
  const [decorations, setDecorations] = useState([]);

  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [textValue, setTextValue] = useState("");
  const [textSize, setTextSize] = useState(32);

  const [downloadFn, setDownloadFn] = useState(null);

  const [template, setTemplate] = useState("sample");

  const [resetKey, setResetKey] = useState(0);


 function resetSession() {
    setResetKey(key => key + 1);

    setDecorations([]);

    setShowTextEditor(false);
    setShowEmojiPicker(false);

    setTextValue("");
  }

  function addText() {
    const value = textValue.trim();

    if (!value) {
      return;
    }

    const newText = {
      id: crypto.randomUUID(),

      type: "text",

      value,

      size: Number(textSize),

      color: "#ffffff",

      x: 50,

      y: 82
    };

    setDecorations(previous => [
      ...previous,
      newText
    ]);

    setTextValue("");

    setShowTextEditor(false);
  }


  function addEmoji(emoji) {
    const newEmoji = {
      id: crypto.randomUUID(),

      type: "emoji",

      value: emoji,

      size: 48,

      x: 50,

      y: 50
    };

    setDecorations(previous => [
      ...previous,
      newEmoji
    ]);

    setShowEmojiPicker(false);
}


  return (
    <div className="studio">

      {/* =========================
          HEADER
      ========================== */}

      <header className="studio-header">

        <button
          className="studio-brand"
          onClick={onBack}
        >
          <span className="brand-camera">
            📸
          </span>

          <span className="brand-text">
            mini booth
          </span>
        </button>


        <div className="capture-hint">
          <span className="capture-dot" />

          <span>
            Press
          </span>

          <kbd>
            SPACE
          </kbd>

          <span>
            to start
          </span>
        </div>


        <div className="header-actions">

          <button
            className="secondary-action"
            onClick={resetSession}
          >
            ↻ Reset
          </button>


          <button
            className="download-action"
            disabled={!downloadFn}
            onClick={() => {
              if (downloadFn) {
                downloadFn();
              }
            }}
          >
            ↓ Download
          </button>

        </div>

      </header>


      {/* =========================
          LEFT TOOLBAR
      ========================== */}

      <aside className="tools-panel">

        <div className="panel-heading">

          <div className="panel-heading-icon">
            ✨
          </div>

          <div>
            <h3>
              Decorate
            </h3>

            <p>
              Make it cute
            </p>
          </div>

        </div>


        <div className="tools">

          {/* =========================
              ADD TEXT
          ========================== */}

          <button
            className={`tool-btn ${
              showTextEditor ? "tool-active" : ""
            }`}
            type="button"
            onClick={() => {
              setShowTextEditor(value => !value);
              setShowEmojiPicker(false);
            }}
          >
            <span className="tool-icon text-icon">
              T
            </span>

            <span className="tool-label">
              Add Text
            </span>

            <span className="tool-arrow">
              ›
            </span>
          </button>


          {showTextEditor && (

            <div className="text-editor">

              <label>
                Your text
              </label>

              <input
                type="text"
                placeholder="best day ever ♡"
                value={textValue}
                maxLength={40}
                onChange={event =>
                  setTextValue(event.target.value)
                }
              />


              <div className="text-editor-row">

                <label>
                  Size
                </label>

                <input
                  type="range"
                  min="20"
                  max="60"
                  value={textSize}
                  onChange={event =>
                    setTextSize(event.target.value)
                  }
                />

                <span>
                  {textSize}px
                </span>

              </div>


              <button
                className="add-decoration-btn"
                type="button"
                disabled={!textValue.trim()}
                onClick={addText}
              >
                Add to photo
              </button>

            </div>

          )}


          {/* =========================
              ADD IMAGE
          ========================== */}

          <button
            className="tool-btn"
            type="button"
          >
            <span className="tool-icon">
              🖼️
            </span>

            <span className="tool-label">
              Add Image
            </span>

            <span className="tool-arrow">
              ›
            </span>
          </button>


          {/* =========================
              ADD EMOJI
          ========================== */}

          <button
            className={`tool-btn ${
              showEmojiPicker ? "tool-active" : ""
            }`}
            type="button"
            onClick={() => {
              setShowEmojiPicker(value => !value);
              setShowTextEditor(false);
            }}
          >
            <span className="tool-icon">
              🎀
            </span>

            <span className="tool-label">
              Add Emoji
            </span>

            <span className="tool-arrow">
              ›
            </span>
          </button>


          {showEmojiPicker && (

            <div className="emoji-picker">

              <p>
                Pick an emoji
              </p>

              <div className="emoji-grid">

                {[
                  "🎀",
                  "💗",
                  "💕",
                  "✨",
                  "🌸",
                  "🌷",
                  "🦋",
                  "⭐",
                  "☁️",
                  "🌙",
                  "🍓",
                  "🍒",
                  "🐰",
                  "🐻",
                  "🧸",
                  "💫",
                  "🌈",
                  "👑"
                ].map(emoji => (

                  <button
                    key={emoji}
                    type="button"
                    onClick={() =>
                      addEmoji(emoji)
                    }
                  >
                    {emoji}
                  </button>

                ))}

              </div>

            </div>

          )}

        </div>


        <div className="tools-note">

          <span>
            ♡
          </span>

          <p>
            Finish taking your photos,
            then decorate your collage.
          </p>

        </div>

      </aside>


      {/* =========================
          MAIN WORKSPACE
      ========================== */}

      <main className="studio-workspace">

        <div className="workspace-label">

          <span>
            your photobooth
          </span>

          <div className="workspace-line" />

        </div>


        <div className="preview-area">

          <span className="decor-sparkle decor-one">
            ✦
          </span>

          <span className="decor-sparkle decor-two">
            ♡
          </span>

          <span className="decor-sparkle decor-three">
            ✿
          </span>


          <SampleTemplate
            key={resetKey}
            resetSignal={resetKey}
            onDownloadReady={setDownloadFn}
            template={template}

            decorations={decorations}
            setDecorations={setDecorations}
          />

        </div>


        {/* TEMPLATE PICKER */}

        <div className="template-section">

          <div className="template-section-title">

            <span>
              Layout
            </span>

            <small>
              choose your frame
            </small>

          </div>


          <TemplateSelector
            setTemplate={setTemplate}
            activeTemplate={template}
          />

        </div>

      </main>


      {/* =========================
          RIGHT INFO CARD
      ========================== */}

      <aside className="session-panel">

        <div className="session-top">

          <div className="session-icon">
            📷
          </div>

          <h3>
            Photo Session
          </h3>

          <p>
            The camera moves through
            each frame automatically.
          </p>

        </div>


        <div className="session-steps">

          <div className="session-step active">

            <span>
              1
            </span>

            <div>
              <strong>
                Pick layout
              </strong>

              <small>
                2, 3 or 4 photos
              </small>
            </div>

          </div>


          <div className="session-step">

            <span>
              2
            </span>

            <div>
              <strong>
                Press SPACE
              </strong>

              <small>
                Start the countdown
              </small>
            </div>

          </div>


          <div className="session-step">

            <span>
              3
            </span>

            <div>
              <strong>
                Strike a pose
              </strong>

              <small>
                We'll take the rest
              </small>
            </div>

          </div>

        </div>


        <div className="session-tip">
          <span>
            💡
          </span>

          <p>
            You only need to press
            SPACE once.
          </p>
        </div>

      </aside>

    </div>
  );
}