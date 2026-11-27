import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import styles from "./styles.module.css";

export interface LightboxItem {
  src: string;
  alt: string;
  caption?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onChange: (nextIndex: number) => void;
}

export default function Lightbox({
  items,
  index,
  onClose,
  onChange,
}: LightboxProps) {
  const total = items.length;
  const current = items[index];

  const handlePrev = useCallback(() => {
    if (total > 1) onChange((index - 1 + total) % total);
  }, [index, total, onChange]);

  const handleNext = useCallback(() => {
    if (total > 1) onChange((index + 1) % total);
  }, [index, total, onChange]);

  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, handlePrev, handleNext]);

  if (!ExecutionEnvironment.canUseDOM || !current) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={current.alt || "Image preview"}
      onClick={onClose}
    >
      <div className={styles.toolbar} onClick={(e) => e.stopPropagation()}>
        {total > 1 && (
          <span className={styles.counter}>
            {index + 1} / {total}
          </span>
        )}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close image preview"
        >
          ×
        </button>
      </div>

      {total > 1 && (
        <button
          type="button"
          className={`${styles.navBtn} ${styles.prevBtn}`}
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Previous image"
        >
          ‹
        </button>
      )}

      <figure className={styles.stage} onClick={(e) => e.stopPropagation()}>
        <img src={current.src} alt={current.alt} className={styles.img} />
        {(current.caption || current.alt) && (
          <figcaption className={styles.caption}>
            {current.caption || current.alt}
          </figcaption>
        )}
      </figure>

      {total > 1 && (
        <button
          type="button"
          className={`${styles.navBtn} ${styles.nextBtn}`}
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next image"
        >
          ›
        </button>
      )}
    </div>,
    document.body
  );
}
