import "./TemplateSelector.css";

export default function TemplateSelector({ setTemplate }) {
  return (
    <div className="templates">
      <div
        className="template-thumb"
        onClick={() => setTemplate("sample")}
      >
        Sample
      </div>
    </div>
  );
}
