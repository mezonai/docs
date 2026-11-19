import React, { ReactNode, CSSProperties } from "react";

interface ImageProps {
  className?: string;
  style?: CSSProperties;
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}

const Image: React.FC<ImageProps> = ({ className, style, src, alt = "", width, height }) => {
  return (
    <div
      className={className}
      style={style}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
      />
    </div>
  );
};

export default Image;