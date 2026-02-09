import React, { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

interface CardProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  shadow?: "lw" | "md" | "tl";
  hoverable?: boolean;
  href?: string;
}
const Card: React.FC<CardProps> = ({
  className,
  style,
  children,
  shadow,
  hoverable = false,
  href,
}) => {
  const cardShadow = shadow ? `item shadow--${shadow}` : "";
  const cardClasses = clsx(
    "card padding--sm",
    className,
    cardShadow,
    hoverable && "cardContainer_fWXF"
  );

  if (href) {
    return (
      <a
        href={href}
        className={cardClasses}
        style={{ textDecoration: "none", color: "inherit", ...style }}
      >
        {children}
      </a>
    );
  }

  return (
    <div
      className={cardClasses}
      style={style}
    >
      {children}
    </div>
  );
};
export default Card;