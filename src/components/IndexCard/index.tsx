import React from "react";
import Link from "@docusaurus/Link";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import styles from "./styles.module.css";

export function IndexCard({
  href,
  title,
  description,
  isFolder = false,
}: {
  href: string;
  title: string;
  description?: string;
  isFolder?: boolean;
}) {
  const { metadata } = useDoc();
  const to = href.startsWith(".")
    ? new URL(href, `https://x${metadata.permalink.replace(/\/$/, "")}`).pathname
    : href;
  return (
    <article className="col col--6" style={{ marginBottom: "1.25rem" }}>
      <Link className={`card padding--lg ${styles.card__container}`} to={to}>
        <h2 className={styles.card__title}>
          <span aria-hidden="true">{isFolder ? "📁" : "📄"}</span> {title}
        </h2>
        {description && <p className={styles.card__description}>{description}</p>}
      </Link>
    </article>
  );
}

export function ListIndexCard({ children }: { children: React.ReactNode }) {
  return <section className="row">{children}</section>;
}
