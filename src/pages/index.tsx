import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import Translate from "@docusaurus/Translate";
import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroBadge}>
          <Translate id="homepage.badge">Official Documentation · EN & VI</Translate>
        </div>
        <Heading as="h1" className={clsx("hero__title", styles.heroTitle)}>
          {siteConfig.title}
        </Heading>
        <p className={clsx("hero__subtitle", styles.heroSubtitle)}>
          {siteConfig.tagline}
        </p>
        <div className={styles.buttons}>
          <Link
            className={clsx("button button--lg", styles.primaryCta)}
            to="/user/quick-start"
          >
            <Translate id="homepage.getStarted">Quick Start</Translate>
          </Link>
          <Link
            className={clsx("button button--lg", styles.secondaryCta)}
            to="/developer/intro"
          >
            <Translate id="homepage.developerCta">Developer Docs</Translate>
          </Link>
        </div>
        <div className={styles.quickLinks}>
          <Link className={styles.chip} to="/user/welcome">
            <Translate id="homepage.chip.userGuide">User Guide</Translate>
          </Link>
          <Link className={styles.chip} to="/user/features-at-a-glance">
            <Translate id="homepage.chip.features">Features at a Glance</Translate>
          </Link>
          <Link className={styles.chip} to="/user/account-and-personalization/pro-plan">
            <Translate id="homepage.chip.proPlan">User & Clan Pro</Translate>
          </Link>
          <Link className={styles.chip} to="/developer/getting-started/sdk-ecosystem-matrix">
            <Translate id="homepage.chip.sdks">SDKs & Bots</Translate>
          </Link>
          <Link className={styles.chip} to="/developer/webhooks/overview">
            <Translate id="homepage.chip.webhooks">Webhooks</Translate>
          </Link>
          <Link className={styles.chip} to="/developer/oauth2/authorization-code-flow">
            <Translate id="homepage.chip.oauth2">OAuth2</Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const metaDescription =
    (siteConfig.customFields as { metaDescription?: string })?.metaDescription ??
    siteConfig.tagline;

  return (
    <Layout title={siteConfig.title} description={metaDescription}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
