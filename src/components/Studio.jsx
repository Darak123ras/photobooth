
import "./Studio.css";
import { useState } from "react";
import TemplateSelector from "./TemplateSelector";
import SampleTemplate from "./SampleTemplate";

export default function Studio() {
  const [downloadFn, setDownloadFn] = useState(null);

  const [template, setTemplate] = useState("sample");
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="studio">

      <div className="tools">
        <button>Add Text</button>
        <button>Add Image</button>
        <button>Add Emoji</button>
      </div>

      <div className="preview">
        {template === "sample" && (
          <SampleTemplate
            resetSignal={resetKey}
            onDownloadReady={setDownloadFn}
          />

        )}
      </div>

      <TemplateSelector setTemplate={setTemplate} />

      <div className="top-right">
        <button onClick={() => setResetKey(k => k + 1)}>
          Reset
        </button>
        <button onClick={() => downloadFn && downloadFn()}>
          Download
        </button>

      </div>

    </div>
  );
}
