# Mezon Webhook

Mezon provides a feature that allows users to send messages to channels through corresponding created webhooks.

## Creating a Mezon Webhook

First, to work with webhooks, you need to make sure you are a member of a clan and have access to a channel.

Creating a webhook is a pretty straightforward process.

1. Go to the channel you want to create a webhook for, right-click to bring up a popup of actions that can be performed on that channel.

    ![mezon-webhook-001](/images/mezon-webhook-001.png)

2. Click on the **`Edit Channel`** option and then go to the **`Integrations`** tab.

    ![mezon-webhook-002](/images/mezon-webhook-002.png)

3. Click on **`New Webhook`** to proceed with creating a new webhook.
    
    ![mezon-webhook-003](/images/mezon-webhook-003.png)

  - You will have one user (here named Spidey bot) and can customize this bot's name and avatar.

  - Click on **`Copy Webhook URL`** to get the webhook's url, use it with the **[`webhook payload`](#webhook-payload)** to send messages to the channel.

  - The webhook URL has the following format: `https://webhook.mezon.ai/webhooks/1840666462029615104/[TOKEN]`

## Webhook Payload