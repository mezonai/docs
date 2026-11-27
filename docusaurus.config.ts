import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import ConfigLocalized from "./docusaurus.config.localized.json";
import { redirects } from "./redirects";

const defaultLocale = "en";
const locales = ["en", "vi"];
const localeLabels: Record<string, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

const baseUrl = "/docs";
const localeStorageKey = "mezon_docs_lan";
const siteUrl = "https://mezon.ai";
const ogImage = "https://mezon.ai/assets/images/preview.png";

function getLocalizedConfigValue(key: keyof typeof ConfigLocalized) {
  const currentLocale = process.env.DOCUSAURUS_CURRENT_LOCALE ?? defaultLocale;
  const values = ConfigLocalized[key];
  if (!values) {
    throw new Error(`Localized config key=${key} not found`);
  }
  const value = values[currentLocale] ?? values[defaultLocale];
  if (!value) {
    throw new Error(
      `Localized value for config key=${key} not found for currentLocale=${currentLocale} or defaultLocale=${defaultLocale}`
    );
  }
  return value;
}

function buildSiteMetadata(): Preset.ThemeConfig["metadata"] {
  const keywords = getLocalizedConfigValue("keywords");
  // Keep only site-level metadata here so Docusaurus per-page canonical og:url,
  // og:title, og:description, og:locale, and twitter tags are never overridden.
  return [
    { name: "keywords", content: keywords },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Mezon" },
    { property: "og:image:alt", content: "Mezon" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "675" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image:alt", content: "Mezon" },
  ];
}

const config: Config = {
  title: getLocalizedConfigValue("title"),
  tagline: getLocalizedConfigValue("tagline"),
  favicon: "images/favicon.ico",

  future: {
    v4: true,
  },

  url: siteUrl,
  baseUrl,

  organizationName: "mezonai",
  projectName: "docs",

  customFields: {
    metaDescription: getLocalizedConfigValue("description"),
    keywords: getLocalizedConfigValue("keywords"),
  },

  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
      onBrokenMarkdownImages: "throw",
    },
  },

  themes: ["@docusaurus/theme-mermaid"],

  i18n: {
    defaultLocale,
    locales,
    localeConfigs: {
      en: { label: localeLabels.en, htmlLang: "en-US" },
      vi: { label: localeLabels.vi, htmlLang: "vi-VN" },
    },
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: ogImage,
    metadata: buildSiteMetadata(),
    colorMode: {
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    mermaid: {
      theme: {
        light: "neutral",
        dark: "dark",
      },
    },
    navbar: {
      title: "Mezon Docs",
      logo: {
        alt: "Mezon Logo",
        src: "images/mezon-logo-light.svg",
        srcDark: "images/mezon-logo-dark.svg",
      },
      items: [
        {
          to: "/user/quick-start",
          position: "left",
          label: "Quick Start",
        },
        {
          type: "docSidebar",
          sidebarId: "userDocsSidebar",
          position: "left",
          label: "User Guide",
        },
        {
          type: "docSidebar",
          sidebarId: "developerDocsSidebar",
          position: "left",
          label: "Developer Docs",
        },
        {
          type: "search",
          position: "right",
        },
        {
          type: "localeDropdown",
          position: "right",
        },
        {
          label: "Mezon",
          position: "right",
          items: [
            {
              href: "https://mezon.ai",
              label: "Home",
            },
            {
              href: "https://mezon.ai/developers",
              label: "Developers Portal",
            },
            {
              href: "https://top.mezon.ai",
              label: "Bots & Apps",
            },
            {
              href: "https://mezon.ai/clans",
              label: "Discover",
            },
            {
              href: "https://mezon.ai/blogs",
              label: "Blogs",
            },
          ],
        },
      ],
    },
    footer: {
      style: "dark",
      copyright: `Copyright © ${new Date().getFullYear()} Mezon. All rights reserved.`,
      links: [
        {
          title: "User Docs",
          items: [
            {
              label: "Quick Start",
              to: "/user/quick-start",
            },
            {
              label: "Welcome",
              to: "/user/welcome",
            },
            {
              label: "Account and Personalization",
              to: "/user/account-and-personalization",
            },
            {
              label: "Friends and Messaging",
              to: "/user/friends-and-messaging",
            },
            {
              label: "Clan",
              to: "/user/clan",
            },
            {
              label: "Bots and Apps",
              to: "/user/bots-and-apps",
            },
            {
              label: "Mezon Dong",
              to: "/user/mezon-dong",
            },
            {
              label: "Resources",
              to: "/user/resources",
            },
          ],
        },
        {
          title: "Developer Docs",
          items: [
            {
              label: "Introduction",
              to: "/developer/intro",
            },
            {
              label: "Getting Started",
              to: "/developer/getting-started/portal-overview",
            },
            {
              label: "SDK Ecosystem",
              to: "/developer/getting-started/sdk-ecosystem-matrix",
            },
            {
              label: "Webhooks",
              to: "/developer/webhooks/overview",
            },
            {
              label: "OAuth2",
              to: "/developer/oauth2/authorization-code-flow",
            },
            {
              label: "Voice SFU & Streaming",
              to: "/developer/media-voice-and-streaming/overview",
            },
          ],
        },
        {
          title: "Company",
          items: [
            {
              label: "About Us",
              href: "https://ncc.plus/#about",
            },
            {
              label: "Contact",
              href: "https://ncc.plus/#contact",
            },
            {
              label: "Privacy Policy",
              href: "https://mezon.ai/privacy",
            },
            {
              label: "Terms of Service",
              href: "https://mezon.ai/terms",
            },
          ],
        },
        {
          title: "Social Media",
          items: [
            {
              label: "Facebook",
              href: "https://www.facebook.com/mezonworld",
            },
            {
              label: "GitHub",
              href: "https://github.com/mezonai",
            },
          ],
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        "bash",
        "csharp",
        "go",
        "rust",
        "kotlin",
        "python",
        "json",
        "http",
        "diff",
      ],
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    require.resolve("./plugins/vietnameseSearch.ts"),
    [
      require.resolve("./plugins/localeStorage.ts"),
      {
        locales,
        defaultLocale,
        baseUrl,
        storageKey: localeStorageKey,
      },
    ],
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects,
      },
    ],
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: locales,
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: "/",
        removeDefaultStopWordFilter: false,
        removeDefaultStemmer: false,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        useAllContextsWithNoSearchContext: true,
        searchContextByPaths: [
          {
            label: { en: "User Guide", vi: "Hướng dẫn sử dụng" },
            path: "user",
          },
          {
            label: { en: "Developer Docs", vi: "Tài liệu nhà phát triển" },
            path: "developer",
          },
        ],
      },
    ],
  ],
};

export default config;
