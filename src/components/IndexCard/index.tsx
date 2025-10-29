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
  return (
    <article className="col col--6" style={{ marginBottom: "2rem" }}>
      <a className={`card padding--lg ${styles.card__container}`} href={href}>
        <h2 className={`text--truncate ${styles.card__title}`}>
          {isFolder ? "🗃️" : "📄️"} {title}
        </h2>
        <p className={`text--truncate ${styles.card__description}`}>{description}</p>
      </a>
    </article>
  );
}

export function ListIndexCard({ children }: { children: React.ReactNode }) {
  return <section className="row">{children}</section>;
}
