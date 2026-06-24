import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import Link from "@docusaurus/Link";
import Translate from "@docusaurus/Translate";

type FeatureItem = {
  title: ReactNode;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
  link: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: <Translate id="homepage.userDocumentationTitle">User Guide</Translate>,
    Svg: require("@site/static/images/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        <Translate id="homepage.userDocumentation">Step-by-step guides to help you explore features, manage workspaces, and use Mezon most effectively.</Translate>
      </>
    ),
    link: "/user/welcome",
  },
  {
    title: <Translate id="homepage.developerDocumentationTitle">Developer Documentation</Translate>,
    Svg: require("@site/static/images/undraw_docusaurus_react.svg").default,
    description: (
      <>
        <Translate id="homepage.developerDocumentation">Documentation and examples for SDKs, Webhooks, and integrations to build and expand the platform.</Translate>
      </>
    ),
    link: "/developer/intro",
  },
];

function Feature({ title, Svg, description, link }: FeatureItem) {
  return (
    <div
      className={clsx("col col--4", styles.featureItem)}
    >
      <div>
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </div>
      <div className="text--center">
        <Link className="button button--primary button--lg" to={link}>
          <Translate id="homepage.readMore">Read More</Translate>
        </Link>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={clsx("row", styles.featuresList)}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
