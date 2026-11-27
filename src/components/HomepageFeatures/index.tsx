import type { ReactNode } from "react";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import Translate from "@docusaurus/Translate";
import styles from "./styles.module.css";

type FeatureItem = {
  title: ReactNode;
  description: ReactNode;
  link: string;
  cta: ReactNode;
  icon: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: <Translate id="homepage.quickStartTitle">Quick Start</Translate>,
    description: (
      <Translate id="homepage.quickStartDesc">
        Install Mezon on your phone and computer, join your clan by link or QR code, and send your first message in minutes.
      </Translate>
    ),
    link: "/user/quick-start",
    cta: <Translate id="homepage.quickStartCta">Start now</Translate>,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: <Translate id="homepage.userDocumentationTitle">User Guide</Translate>,
    description: (
      <Translate id="homepage.userDocumentation">
        Step-by-step guides for messaging, voice and stream channels, clan management, Pro plans, bots, and Mezon Dong.
      </Translate>
    ),
    link: "/user/welcome",
    cta: <Translate id="homepage.readMore">Explore guide</Translate>,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    title: (
      <Translate id="homepage.developerDocumentationTitle">
        Developer Docs & SDKs
      </Translate>
    ),
    description: (
      <Translate id="homepage.developerDocumentation">
        Build bots, channel apps, voice SFU clients, and MMN integrations with the official JavaScript, .NET, Go, Rust, Kotlin, and Python SDKs.
      </Translate>
    ),
    link: "/developer/intro",
    cta: <Translate id="homepage.developerReadMore">Open developer docs</Translate>,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: (
      <Translate id="homepage.integrationsTitle">
        Webhooks, OAuth2 & Streaming
      </Translate>
    ),
    description: (
      <Translate id="homepage.integrationsDesc">
        Connect external services with Channel and Clan Webhooks, Sign in with Mezon (OAuth2/OIDC), embeddable chat widgets, and WHIP live streaming.
      </Translate>
    ),
    link: "/developer/webhooks/overview",
    cta: <Translate id="homepage.integrationsCta">View integrations</Translate>,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
  },
];

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.grid}>
          {FeatureList.map((item, idx) => (
            <Link key={idx} className={styles.card} to={item.link}>
              <div className={styles.iconBox}>{item.icon}</div>
              <Heading as="h2" className={styles.title}>
                {item.title}
              </Heading>
              <p className={styles.description}>{item.description}</p>
              <span className={styles.cta}>{item.cta} →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
