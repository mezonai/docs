import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import ConfigLocalized from './docusaurus.config.localized.json';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const defaultLocale = 'vi';

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
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi','en'],
    localeConfigs: {
      vi: {
        label: 'Tiếng Việt',
      },
      en: {
        label: 'English',
      },
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
    // Replace with your project's social card
    image: 'images/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Mezon Docs',
      logo: {
        alt: 'Mezon Logo',
        src: 'images/logo-mezon-light.png',
      },
      items: [
        {
          href: 'https://mezon.ai',
          position: 'left',
          label: 'Trang chủ',
        },
        {
          href: 'https://mezon.ai/developers',
          position: 'left',
          label: 'Nhà phát triển',
        },
        {
          href: 'https://top.mezon.ai',
          position: 'left',
          label: 'Bots/Apps',
        },
        {
          href: 'https://mezon.ai/clans',
          position: 'left',
          label: 'Khám phá',
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
          label: "Tài liệu",
          position: "right",
          items: [
            {
              label: "Dành cho người dùng",
              to: "/user/welcome",
            },
            {
              label: "Dành cho nhà phát triển",
              to: "/developer/intro",
            },
          ],
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Tài liệu người dùng',
          items: [
            {
              label: 'Chào mừng',
              to: '/user/welcome',
            },
            {
              label: 'Tài khoản và cá nhân hóa',
              to: '/user/account-and-personalization',
            },
            {
              label: 'Bạn bè và Tin nhắn trực tiếp',
              to: '/user/friends-and-messaging',
            },
            {
              label: 'Clan',
              to: '/user/clan',
            },
            {
              label: 'Bots và Apps',
              to: '/user/bots-and-apps',
            },
            {
              label: 'Mezon Đồng',
              to: '/user/mezon-dong',
            },
            {
              label: 'Tài nguyên',
              to: '/user/resources',
            },
          ],
        },
        {
          title: 'Tài liệu nhà phát triển',
          items: [
            {
              label: 'Giới thiệu',
              to: '/developer/intro',
            },
            {
              label: 'Bắt đầu nhanh',
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
              label: 'Chủ đề',
              to: '/developer/mezon-topics',
            },
          ],
        },
        {
          title: 'Công ty',
          items: [
            {
              label: 'Giới thiệu',
              href: 'https://ncc.plus/#about',
            },
            {
              label: 'Liên hệ',
              href: 'https://ncc.plus/#contact',
            },
            {
              label: 'Chính sách bảo mật',
              href: 'https://mezon.ai',
            },
            {
              label: 'Điều khoản dịch vụ',
              href: 'https://mezon.ai',
            },
          ],
        },
        {
          title: 'Mạng xã hội',
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
    // require.resolve("./plugins/redirectDeveloperLocale.ts"),
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['vi', 'en'],
        indexDocs: true,
        indexPages: true,
        docsRouteBasePath: ['docs'],
        removeDefaultStopWordFilter: false,
        removeDefaultStemmer: false,
      },
    ],
  ],
};

export default config;
