import React, { useState, CSSProperties } from "react";
import clsx from "clsx";
import Lightbox from "@site/src/components/Lightbox";
import styles from "./styles.module.css";

interface ImageProps {
  className?: string;
  style?: CSSProperties;
  src?: string;
  alt?: string;
  caption?: string;
  width?: string | number;
  height?: string | number;
  zoomable?: boolean;
}

const Image: React.FC<ImageProps> = ({
  className,
  style,
  src,
  alt = "",
  caption,
  width,
  height,
  zoomable = true,
}) => {
  const [open, setOpen] = useState(false);

  if (!src) return null;

  return (
    <figure className={clsx(styles.wrapper, className)} style={style}>
      {zoomable ? (
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setOpen(true)}
          aria-label={alt ? `Zoom image: ${alt}` : "Zoom image"}
        >
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            className={styles.img}
          />
        </button>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          className={styles.img}
        />
      )}
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
      {open && (
        <Lightbox
          items={[{ src, alt, caption }]}
          index={0}
          onClose={() => setOpen(false)}
          onChange={() => {}}
        />
      )}
    </figure>
  );
};

export default Image;
