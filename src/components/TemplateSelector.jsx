import "./TemplateSelector.css";

export default function TemplateSelector({ setTemplate, activeTemplate }) {
  return (
    <div className="templates">

      <div
        className={`template-thumb ${activeTemplate === "sample" ? "active" : ""}`}
        onClick={() => setTemplate("sample")}
      >
        Sample
      </div>

      <div
        className={`template-thumb ${activeTemplate === "triple" ? "active" : ""}`}
        onClick={() => setTemplate("triple")}
      >
        Triple
      </div>

      <div
        className={`template-thumb ${activeTemplate === "quad" ? "active" : ""}`}
        onClick={() => setTemplate("quad")}
      >
        Quad
      </div>

    </div>
  );
}
