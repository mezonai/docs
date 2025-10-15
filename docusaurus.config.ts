import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Mezon Developer Docs',
  tagline: 'Mezon Developer Docs',
  favicon: 'images/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
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
      title: 'Mezon Developer Docs',
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
          to: '/docs/user/welcome',
          label: 'User Docs',
          position: 'right',
          sidebarId: 'userDocsSidebar',
        },
        {
          href: '/docs/developer/intro',
          target: '_blank',
          label: 'Developer Docs',
          position: 'right',
          sidebarId: 'developerDocsSidebar',
        }
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Intro',
              to: '/docs/intro',
            },
            {
              label: 'Quick Start',
              to: 'docs/category/quick-start',
            },
            {
              label: 'Mezon SDK',
              to: 'docs/category/mezon-sdk',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'X',
              href: 'https://x.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [

            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['powershell', "csharp", "bash", "java", "javascript"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
