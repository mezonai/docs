import React, { ReactNode, useMemo, useState } from "react";
import clsx from "clsx";
import Lightbox, { LightboxItem } from "@site/src/components/Lightbox";
import styles from "./styles.module.css";

interface ShotStepsProps {
  children: ReactNode;
  wide?: boolean;
  plain?: boolean;
}

interface ShotProps {
  src: string;
  alt: string;
  children?: ReactNode;
  stepNumber?: number;
  onOpen?: () => void;
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return "";
}

export function ShotSteps({
  children,
  wide = false,
  plain = false,
}: ShotStepsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const items = useMemo<LightboxItem[]>(() => {
    const out: LightboxItem[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<ShotProps>(child) && child.props.src) {
        const cap = extractText(child.props.children).trim();
        out.push({
          src: child.props.src,
          alt: child.props.alt || "",
          caption: cap || child.props.alt || "",
        });
      }
    });
    return out;
  }, [children]);

  let stepIdx = 0;
  const List = plain ? "ul" : "ol";

  return (
    <>
      <List className={clsx(styles.row, wide && styles.wide)}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement<ShotProps>(child)) return child;
          const idx = stepIdx++;
          return React.cloneElement(child, {
            stepNumber: plain ? undefined : idx + 1,
            onOpen: () => setActiveIndex(idx),
          });
        })}
      </List>
      {activeIndex !== null && items.length > 0 && (
        <Lightbox
          items={items}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onChange={setActiveIndex}
        />
      )}
    </>
  );
}

export function Shot({ src, alt, children, stepNumber, onOpen }: ShotProps) {
  const [standaloneOpen, setStandaloneOpen] = useState(false);
  const handleClick = onOpen ?? (() => setStandaloneOpen(true));

  return (
    <li className={styles.item}>
      <button
        type="button"
        className={styles.frame}
        onClick={handleClick}
        aria-label={alt ? `Zoom screenshot: ${alt}` : "Zoom screenshot"}
      >
        <img src={src} alt={alt} loading="lazy" />
      </button>
      <div className={styles.caption}>
        {stepNumber !== undefined && (
          <span className={styles.number}>{stepNumber}</span>
        )}
        <div className={styles.text}>{children}</div>
      </div>
      {standaloneOpen && (
        <Lightbox
          items={[{ src, alt, caption: extractText(children).trim() || alt }]}
          index={0}
          onClose={() => setStandaloneOpen(false)}
          onChange={() => {}}
        />
      )}
    </li>
  );
}
