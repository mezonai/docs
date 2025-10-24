import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import Link from "@docusaurus/Link";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
  link: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: "User Documentation",
    Svg: require("@site/static/images/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        Guides and tutorials to help you get started, manage your account, and
        make the most of all features.
      </>
    ),
    link: "/user/welcome",
  },
  {
    title: "Developer Documentation",
    Svg: require("@site/static/images/undraw_docusaurus_react.svg").default,
    description: (
      <>
        References and examples for SDKs, Webhooks, and integrations to build
        and extend the platform.
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
          Read More
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
