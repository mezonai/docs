import Link from '@docusaurus/Link';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

export function IndexCard({
  href,
  title,
  description,
  isFolder = false,
}: {
  href: string;
  title: string;
  description?: string;
  isFolder: boolean;
}) {
  const { metadata } = useDoc();
  // The server redirects index pages to a trailing slash, so resolve "./x" against the permalink, not the browser URL.
  const to = href.startsWith('.') ? new URL(href, `https://x${metadata.permalink.replace(/\/$/, '')}`).pathname : href;
  return (
    <article className="col col--6" style={{ marginBottom: "2rem" }}>
      <Link className={`card padding--lg ${styles.card__container}`} to={to}>
        <h2 className={`text--truncate ${styles.card__title}`}>
          {isFolder ? "🗃️" : "📄️"} {title}
        </h2>
        <p className={`text--truncate ${styles.card__description}`}>{description}</p>
      </Link>
    </article>
  );
}

export function ListIndexCard({ children }: { children: React.ReactNode }) {
  return <section className="row">{children}</section>;
}
