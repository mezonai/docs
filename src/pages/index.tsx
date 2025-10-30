import type { ReactNode } from "react";
import { useEffect } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";

import styles from "./index.module.css";
import Translate from "@docusaurus/Translate";
import { useHistory, useLocation } from "@docusaurus/router";
import { normalizePath } from "../utils/utils";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/user/welcome"
          >
            <Translate id="homepage.getStarted">Bắt đầu</Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const browserLang = navigator.language?.split("-")[0];
    const normalizedPath = normalizePath(location.pathname);
    if (
      (normalizedPath === "/docs/en" && browserLang === "en") ||
      (normalizedPath === "/docs" && browserLang === "vi")
    )
      return;

    const supported = ["vi", "en"];
    const defaultLocale = "vi";

    const target =
      supported.includes(browserLang) && browserLang !== defaultLocale
        ? `/${browserLang}`
        : "/";

    if (target !== normalizedPath) {
      window.location.replace(`/docs${target}`);
    }
  }, [history, location]);

  return (
    <Layout title={`${siteConfig.title}`} description={`${siteConfig.tagline}`}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
