import React, { ReactNode, CSSProperties } from "react";

interface ImageProps {
  className?: string;
  style?: CSSProperties;
  src?: string;
  width?: string | number;
  height?: string | number;
}

const Image: React.FC<ImageProps> = ({ className, style, src, width, height }) => {
  return (
    <div
      className={className}
      style={style}>
      <img
        src={src}
        alt=""
        width={width}
        height={height}
      />
    </div>
  );
};

export default Image;