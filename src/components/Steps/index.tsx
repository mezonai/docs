import React from "react";

// Lightweight inline renderer for step titles. Supports the only Markdown used
// in titles across the docs: **bold** and backslash escapes (e.g. \_). This
// avoids pulling in the heavy react-markdown dependency just for titles.
function renderInline(text: string): React.ReactNode {
  const unescape = (s: string) => s.replace(/\\([\\_*`~])/g, "$1");
  const segments = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return segments.map((segment, index) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(segment);
    if (bold) {
      return <strong key={index}>{unescape(bold[1])}</strong>;
    }
    return <React.Fragment key={index}>{unescape(segment)}</React.Fragment>;
  });
}

export function Steps({ children }) {
  return (
    <div className="space-y-8">
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, { stepNumber: index + 1 })
      )}
    </div>
  );
}

export function Step({ title, stepNumber, children }) {
  return (
    <div
      style={{
        borderLeft: "4px solid var(--ifm-color-primary)",
        paddingLeft: "1rem",
        marginBottom: "1rem",
      }}
    >
      <div style={{ display: "flex", marginBottom: "1rem" }}>
        <span
          style={{
            background: "var(--ifm-color-primary)",
            color: "#fff",
            borderRadius: "50%",
            display: "inline-block",
            width: "1.5rem",
            height: "1.5rem",
            textAlign: "center",
            lineHeight: "1.5rem",
            marginTop: "0.25rem",
            marginRight: "0.5rem",
            flexShrink: 0,
          }}
        >
          {stepNumber}
        </span>
        <p style={{ fontSize: "1.2rem", margin: 0 }}>{renderInline(title)}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}
