import type { Options as RedirectsOptions } from "@docusaurus/plugin-client-redirects";

/**
 * Locale-agnostic client redirects. Docusaurus builds each locale with its own
 * baseUrl (/docs/ and /docs/vi/) and runs plugin-client-redirects per locale,
 * so each entry automatically generates redirects for both English and Vietnamese.
 *
 * Do NOT prefix entries with /docs or /vi.
 * Every #anchor target uses an explicit English {#anchor-id} heading ID
 * in both English and Vietnamese markdown files.
 */
export const redirects: NonNullable<RedirectsOptions["redirects"]> = [
  // User docs — Account and personalization
  {
    from: "/user/account-and-personalization/download-and-settings",
    to: "/user/account-and-personalization/download-and-install",
  },
  {
    from: "/user/account-and-personalization/personalization-settings",
    to: "/user/account-and-personalization/profile-and-settings",
  },

  // User docs — Friends and messaging
  {
    from: "/user/friends-and-messaging/communication-and-connection",
    to: "/user/friends-and-messaging",
  },

  // User docs — Clans (flattened from 6 levels to 2 levels)
  {
    from: "/user/clan/create-your-own-clan",
    to: "/user/clan/create-a-clan",
  },
  {
    from: "/user/clan/create-your-own-clan/create-a-clan",
    to: "/user/clan/create-a-clan",
  },
  {
    from: "/user/clan/create-your-own-clan/invite-friends-to-your-clan",
    to: "/user/clan/invite-people",
  },
  {
    from: "/user/clan/create-your-own-clan/transferring-clan-ownership",
    to: "/user/clan/manage/transfer-ownership",
  },
  {
    from: [
      "/user/clan/mezon-experience-clans",
      "/user/clan/mezon-experience-clans/student-clan-mezon-campus-hub",
      "/user/clan/mezon-experience-clans/gamer-clan-mezon-gaming-guild",
      "/user/clan/mezon-experience-clans/business-clan-mezon-workspace-pro",
    ],
    to: "/user/clan/join-and-explore-clans#sample-clans",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan",
    to: "/user/clan/manage",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/creating-and-managing-events",
    to: "/user/clan/manage/events",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/managing-notifications-in-a-clan",
    to: "/user/clan/manage/notifications",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/member-management",
    to: "/user/clan/manage/members-and-moderation",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/overview-settings",
    to: "/user/clan/manage/settings",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/overview-settings/overview",
    to: "/user/clan/manage/settings#overview",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/overview-settings/roles-and-permissions-management",
    to: "/user/clan/manage/roles-and-permissions",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/overview-settings/emoji-image-and-voice-stickers",
    to: "/user/clan/manage/emoji-stickers-and-sounds",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/overview-settings/category-order",
    to: "/user/clan/channels/categories#category-order",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/overview-settings/integrations",
    to: "/user/clan/manage/settings#integrations",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/overview-settings/audit-log",
    to: "/user/clan/manage/members-and-moderation#audit-log",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/overview-settings/new-member-guide",
    to: "/user/clan/manage/onboarding",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/overview-settings/enable-community",
    to: "/user/clan/manage/community",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/overview-settings/delete-clan",
    to: "/user/clan/manage/settings#delete-a-clan",
  },
  {
    from: [
      "/user/clan/create-your-own-clan/manage-clan/clan-structure",
      "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels",
    ],
    to: "/user/clan/channels",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/clan-category",
    to: "/user/clan/channels/categories",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/voice-channel",
    to: "/user/clan/channels/voice-channel",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/stream-channel",
    to: "/user/clan/channels/stream-channel",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/text-channel",
    to: "/user/clan/channels/text-channel",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/text-channel/canvas",
    to: "/user/clan/channels/canvas",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/text-channel/files",
    to: "/user/clan/channels/files-and-gallery",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/text-channel/gallery",
    to: "/user/clan/channels/files-and-gallery#gallery",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/text-channel/inbox",
    to: "/user/clan/channels/inbox",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/text-channel/members",
    to: "/user/clan/channels/text-channel#members",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/text-channel/notification-settings",
    to: "/user/clan/manage/notifications#channel-notifications",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/text-channel/pinned-messages",
    to: "/user/clan/channels/pinned-messages",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/text-channel/search",
    to: "/user/clan/channels/search",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/text-channel/threads",
    to: "/user/friends-and-messaging/threads-and-topics#threads",
  },
  {
    from: "/user/clan/create-your-own-clan/manage-clan/clan-structure/channels/text-channel/topic",
    to: "/user/friends-and-messaging/threads-and-topics#topics",
  },

  // User docs — Bots and apps
  {
    from: "/user/bots-and-apps/what-is-a-bot",
    to: "/user/bots-and-apps/overview#bots",
  },
  {
    from: "/user/bots-and-apps/what-is-an-app",
    to: "/user/bots-and-apps/overview#apps",
  },
  {
    from: "/user/bots-and-apps/for-developers",
    to: "/user/bots-and-apps/overview#for-developers",
  },
  {
    from: "/user/bots-and-apps/explore-and-install-bots-apps",
    to: "/user/bots-and-apps/find-and-add",
  },
  {
    from: "/user/bots-and-apps/safety-guidelines-for-bots-apps",
    to: "/user/bots-and-apps/find-and-add#stay-safe",
  },
  {
    from: "/user/bots-and-apps/manage-bots-and-apps",
    to: "/user/bots-and-apps/manage",
  },
  {
    from: "/user/bots-and-apps/troubleshooting-bots-apps",
    to: "/user/bots-and-apps/manage#troubleshooting",
  },

  // User docs — Resources
  {
    from: "/user/resources/mezon-ecosystem",
    to: "/user/resources/mezon-websites",
  },

  // Developer docs — Legacy routes mapped to redesigned 11-section architecture
  {
    from: ["/developer/quick-start", "/developer/quick-start/overview"],
    to: "/developer/getting-started/portal-overview",
  },
  {
    from: "/developer/quick-start/creating-mezon-bot",
    to: "/developer/getting-started/create-a-bot",
  },
  {
    from: "/developer/quick-start/creating-mezon-app",
    to: "/developer/getting-started/create-a-channel-app",
  },
  {
    from: "/developer/mezon-sdk",
    to: "/developer/getting-started/sdk-ecosystem-matrix",
  },
  {
    from: [
      "/developer/mezon-sdk/integration-bot-sdk",
      "/developer/mezon-sdk/integration-bot-sdk/overview",
    ],
    to: "/developer/bot-sdks/javascript/overview",
  },
  {
    from: "/developer/mezon-sdk/integration-bot-sdk/getting-started",
    to: "/developer/bot-sdks/javascript/quickstart",
  },
  {
    from: "/developer/mezon-sdk/integration-bot-sdk/core-concepts",
    to: "/developer/bot-sdks/javascript/client-and-caches",
  },
  {
    from: "/developer/mezon-sdk/integration-bot-sdk/usage-and-examples",
    to: "/developer/bot-sdks/javascript/guides-and-recipes",
  },
  {
    from: "/developer/mezon-sdk/integration-bot-sdk/api-references",
    to: "/developer/bot-sdks/javascript/api-reference",
  },
  {
    from: [
      "/developer/mezon-sdk/channel-app-sdk",
      "/developer/mezon-sdk/channel-app-sdk/overview",
    ],
    to: "/developer/channel-apps-and-widgets/channel-apps/overview",
  },
  {
    from: "/developer/mezon-sdk/channel-app-sdk/channel-app-auth-flow",
    to: "/developer/channel-apps-and-widgets/channel-apps/verifying-launch-data",
  },
  {
    from: "/developer/mezon-sdk/channel-app-sdk/usage-and-examples",
    to: "/developer/channel-apps-and-widgets/channel-apps/tutorial-express",
  },
  {
    from: "/developer/mezon-sdk/dotnet-sdk",
    to: "/developer/bot-sdks/dotnet/overview",
  },
  {
    from: "/developer/mezon-sdk/bot-api-access",
    to: "/developer/core-concepts/permissions-and-api-access",
  },
  {
    from: "/developer/mezon-topics",
    to: "/developer/intro",
  },
  {
    from: "/developer/mezon-topics/oauth2",
    to: "/developer/oauth2/authorization-code-flow",
  },
  {
    from: "/developer/mezon-topics/streaming-channel",
    to: "/developer/media-voice-and-streaming/stream-channels/publishing-with-whip",
  },
  {
    from: "/developer/mezon-topics/interactive-message",
    to: "/developer/interactive-features/interactive-messages",
  },
];
