import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import ConfigLocalized from './docusaurus.config.localized.json';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const defaultLocale = 'en';

// Single source of truth for supported languages. Add a new entry here (and its
// translations under i18n/<code>/) to support another language end-to-end.
const locales = ['en', 'vi'];
const localeLabels: Record<string, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

const baseUrl = '/docs';
const localeStorageKey = 'mezon_docs_lan';
const siteUrl = 'https://mezon.ai';
const ogImage = 'https://mezon.ai/assets/images/preview.png';

function getCurrentLocale() {
  return process.env.DOCUSAURUS_CURRENT_LOCALE ?? defaultLocale;
}

function getDocsCanonicalUrl() {
  const locale = getCurrentLocale();
  return locale === defaultLocale
    ? `${siteUrl}${baseUrl}/`
    : `${siteUrl}${baseUrl}/${locale}/`;
}

function getOgLocale(locale: string) {
  return locale === 'vi' ? 'vi_VN' : 'en_US';
}

function buildSiteMetadata(): Preset.ThemeConfig['metadata'] {
  const locale = getCurrentLocale();
  const title = getLocalizedConfigValue('title');
  const description = getLocalizedConfigValue('description');
  const keywords = getLocalizedConfigValue('keywords');
  const alternateLocale = locale === defaultLocale ? 'vi_VN' : 'en_US';

  return [
    {name: 'description', content: description},
    {name: 'keywords', content: keywords},
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: 'Mezon'},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:url', content: getDocsCanonicalUrl()},
    {property: 'og:image', content: ogImage},
    {property: 'og:image:alt', content: 'Mezon'},
    {property: 'og:image:width', content: '1200'},
    {property: 'og:image:height', content: '675'},
    {property: 'og:locale', content: getOgLocale(locale)},
    {property: 'og:locale:alternate', content: alternateLocale},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: ogImage},
    {name: 'twitter:image:alt', content: 'Mezon'},
  ];
}

function getLocalizedConfigValue(key: keyof typeof ConfigLocalized) {
  const currentLocale = process.env.DOCUSAURUS_CURRENT_LOCALE ?? defaultLocale;
  const values = ConfigLocalized[key];
  if (!values) {
    throw new Error(`Localized config key=${key} not found`);
  }
  const value = values[currentLocale] ?? values[defaultLocale];
  if (!value) {
    throw new Error(
      `Localized value for config key=${key} not found for both currentLocale=${currentLocale} or defaultLocale=${defaultLocale}`,
    );
  }
  return value;
}


const config: Config = {
  title: getLocalizedConfigValue('title'),
  tagline: getLocalizedConfigValue('tagline'),
  favicon: 'images/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://mezon.ai',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl,

  organizationName: 'mezonai',
  projectName: 'docs',

  customFields: {
    metaDescription: getLocalizedConfigValue('description'),
    keywords: getLocalizedConfigValue('keywords'),
  },

  onBrokenLinks: 'warn',

  // The default locale (English) is served at the root (/docs/...); every other
  // language is served under /docs/<code>/... The synchronous head script in the
  // mezon-locale-storage plugin picks the right one without a visible flash.
  i18n: {
    defaultLocale,
    locales,
    localeConfigs: {
      en: { label: localeLabels.en },
      vi: { label: localeLabels.vi },
    },
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
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
    navbar: {
      title: 'Mezon Docs',
      logo: {
        alt: 'Mezon Logo',
        src: 'images/mezon-logo-light.svg',
        srcDark: 'images/mezon-logo-dark.svg',
      },
      items: [
        {
          href: 'https://mezon.ai',
          position: 'left',
          label: 'Home',
        },
        {
          href: 'https://mezon.ai/developers',
          position: 'left',
          label: 'Developers',
        },
        {
          href: 'https://top.mezon.ai',
          position: 'left',
          label: 'Bots/Apps',
        },
        {
          href: 'https://mezon.ai/clans',
          position: 'left',
          label: 'Discover',
        },
        {
          href: 'https://mezon.ai/blogs',
          position: 'left',
          label: 'Blogs',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          label: 'Docs',
          position: 'right',
          items: [
            {
              label: 'User Guide',
              to: '/user/welcome',
            },
            {
              label: 'Developer Docs',
              to: '/developer/intro',
            },
          ],
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'User Docs',
          items: [
            {
              label: 'Welcome',
              to: '/user/welcome',
            },
            {
              label: 'Account and Personalization',
              to: '/user/account-and-personalization',
            },
            {
              label: 'Friends and Messaging',
              to: '/user/friends-and-messaging',
            },
            {
              label: 'Clan',
              to: '/user/clan',
            },
            {
              label: 'Bots and Apps',
              to: '/user/bots-and-apps',
            },
            {
              label: 'Mezon Dong',
              to: '/user/mezon-dong',
            },
            {
              label: 'Resources',
              to: '/user/resources',
            },
          ],
        },
        {
          title: 'Developer Docs',
          items: [
            {
              label: 'Introduction',
              to: '/developer/intro',
            },
            {
              label: 'Quick Start',
              to: '/developer/quick-start',
            },
            {
              label: 'Mezon SDK',
              to: '/developer/mezon-sdk',
            },
            {
              label: 'Webhooks',
              to: '/developer/webhooks',
            },
            {
              label: 'Topics',
              to: '/developer/mezon-topics',
            },
          ],
        },
        {
          title: 'Company',
          items: [
            {
              label: 'About Us',
              href: 'https://ncc.plus/#about',
            },
            {
              label: 'Contact',
              href: 'https://ncc.plus/#contact',
            },
            {
              label: 'Privacy Policy',
              href: 'https://mezon.ai/privacy',
            },
            {
              label: 'Terms of Service',
              href: 'https://mezon.ai/terms',
            },
          ],
        },
        {
          title: 'Social Media',
          items: [
            {
              label: 'Facebook',
              href: 'https://www.facebook.com/mezonworld',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/mezonai',
            },
          ],
        },
      ]
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['powershell', "csharp", "bash", "java", "javascript"],
    },
  } satisfies Preset.ThemeConfig,
  plugins: [
    [
      require.resolve('./plugins/localeStorage.ts'),
      {
        locales,
        defaultLocale,
        baseUrl,
        storageKey: localeStorageKey,
      },
    ],
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: locales,
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        docsRouteBasePath: '/',
        removeDefaultStopWordFilter: false,
        removeDefaultStemmer: false,
      },
    ],
  ],
};

export default config;
