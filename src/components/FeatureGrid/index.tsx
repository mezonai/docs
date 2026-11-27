import React, { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

interface FeatureGridProps {
  children: ReactNode;
  columns?: 2 | 3;
}

export function FeatureGrid({ children, columns = 2 }: FeatureGridProps) {
  return (
    <div
      className={clsx(
        styles.grid,
        columns === 3 ? styles.cols3 : styles.cols2
      )}
    >
      {children}
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  to: string;
  badge?: string;
}

export function FeatureCard({
  title,
  description,
  to,
  badge,
}: FeatureCardProps) {
  return (
    <Link className={styles.card} to={to}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>
      <p className={styles.description}>{description}</p>
    </Link>
  );
}
