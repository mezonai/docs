import React from "react";
import ReactMarkdown from "react-markdown";

export function Steps({ children }) {
  // Tự động đánh số step
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
      <div
        style={{ display: "flex",  marginBottom: "1rem" }}
      >
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
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p style={{ fontSize: "1.2rem", margin: 0 }}>{children}</p>
            ),
          }}
        >
          {title}
        </ReactMarkdown>
      </div>
      <div>{children}</div>
    </div>
  );
}
