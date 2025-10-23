import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Mezon Docs',
  tagline: 'Mezon Docs',
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
          type: 'localeDropdown',
          position: 'right',
        },
        {
          label: "Docs",
          position: "right",
          items: [
            {
              label: "User Docs",
              to: "/user/welcome",
            },
            {
              label: "Developer Docs",
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
              label: 'Clans',
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
              label: 'Intro',
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
              label: 'About',
              href: 'https://mezon.ai',
            },
            {
              label: 'Contact',
              href: 'https://mezon.ai',
            },
            {
              label: 'Privacy Policy',
              href: 'https://mezon.ai',
            },
            {
              label: 'Terms of Service',
              href: 'https://mezon.ai',
            },
          ],
        },
        {
          title: 'More',
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
      ],
      logo: {
        alt: 'Mezon Logo',
        width: 100,
        height: 100,
        src: 'images/logo-mezon-light.png',
      },
      copyright: `Copyright © ${new Date().getFullYear()} Mezon, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['powershell', "csharp", "bash", "java", "javascript"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
