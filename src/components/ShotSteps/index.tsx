import React, { ReactNode } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

interface ShotStepsProps {
  children: ReactNode;
  wide?: boolean;
  plain?: boolean;
}

export function ShotSteps({ children, wide = false, plain = false }: ShotStepsProps) {
  let n = 1;
  const List = plain ? "ul" : "ol";
  return (
    <List className={clsx(styles.row, wide && styles.wide)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<ShotProps>, { stepNumber: plain ? undefined : n++ })
          : child
      )}
    </List>
  );
}

interface ShotProps {
  src: string;
  alt: string;
  children?: ReactNode;
  stepNumber?: number;
}

export function Shot({ src, alt, children, stepNumber }: ShotProps) {
  return (
    <li className={styles.item}>
      <a className={styles.frame} href={src} target="_blank" rel="noopener noreferrer">
        <img src={src} alt={alt} />
      </a>
      <div className={styles.caption}>
        {stepNumber !== undefined && <span className={styles.number}>{stepNumber}</span>}
        <div className={styles.text}>{children}</div>
      </div>
    </li>
  );
}
