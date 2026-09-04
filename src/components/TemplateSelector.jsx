import "./TemplateSelector.css";

export default function TemplateSelector({
  setTemplate,
  activeTemplate
}) {

  const templates = [
    {
      id: "sample",
      name: "Classic",
      slots: 2
    },

    {
      id: "triple",
      name: "Triple",
      slots: 3
    },

    {
      id: "quad",
      name: "Four",
      slots: 4
    }
  ];


  return (
    <div className="templates">

      {templates.map(item => (

        <button
          type="button"
          key={item.id}
          className={
            `template-thumb ${
              activeTemplate === item.id
                ? "active"
                : ""
            }`
          }
          onClick={() =>
            setTemplate(item.id)
          }
        >

          <div
            className={
              `mini-template mini-template-${item.slots}`
            }
          >

            {Array.from({
              length: item.slots
            }).map((_, index) => (

              <span
                key={index}
                className="mini-slot"
              />

            ))}

          </div>


          <span className="template-name">
            {item.name}
          </span>

        </button>

      ))}

    </div>
  );
}