---
layout: docLayout.html
title: Mezon Clan Webhooks Docs
order: 5
---

# Mezon Clan Webhook

Mezon provides a feature that allows users to send messages to DM through corresponding created webhooks.

## Creating a Clan Mezon Webhook

Unlike channel webhook, clan webhook will send DM directly to each person's inbox, who receives the message depends on the username provided on the URL.

Follow these steps to create a webhook for your clan.

1. Go to the clan you want to create a webhook for, click on clan banner to bring up a popup of actions that can be performed on that clan.

    ![mezon-webhook-005](https://mezon.ai/docs/images/mezon-webhook-005.png)

2. Click on the **`Clan Settings`** option and then go to the **`Integrations`** tab.

  - As a clan manager you can also manage both channel webhooks and clan webhooks here.

    ![mezon-webhook-006](https://mezon.ai/docs/images/mezon-webhook-006.png)

3. Click on **`Clan Webhooks`** and then **`New Clan Webhook`** to proceed with creating a new webhook.
    
    ![mezon-webhook-007](https://mezon.ai/docs/images/mezon-webhook-007.png)

  - You will have one user (here named Komu Knight) and can customize this bot's name and avatar.

  - Click on **`Copy Webhook URL`** to get the webhook's endpoint, use it with the **[`webhook payload`](#webhook-specification)** to send messages to the user in your clan.

  - There are **two ways to construct a complete Webhook URL** after copying the base URL using the **`Copy Webhook URL`** button:

    - Way 1: You need to combine the copied URL with a valid `Mezon Username` to generate the complete Webhook URL. The `Mezon Username` can be found in the user's **Account Settings**.

    ![mezon-webhook-008](https://mezon.ai/docs/images/mezon-webhook-008.png)

    - Way 2: Alternatively, use the copied URL and combine it with a valid `Mezon User ID` to form the complete Webhook URL. The `Mezon User ID` can be found in the user's **Account popup**.

    ![mezon-webhook-010](https://mezon.ai/docs/images/mezon-webhook-010.png)

  > [!NOTE]
  > If you feel the token on your URL is compromised or outdated, reset it and copy the new URL and make sure the user has joined your clan.
  
## Webhook Specification

### **Clan Endpoint**

The webhook is delivered via an HTTP POST request to a unique URL generated for each webhook integration combined with a unique username.

**URL Structure:**

```
https://webhook.mezon.ai/clanwebhooks/{token}/{username}
#or
https://webhook.mezon.ai/clanwebhooks/{token}/{userId}
```

**URL Parameters:**

| Parameter   | Type   | Description                                                                                                                                                                          |
| :---------- | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `token`     | string | A security token for authenticating the request. It appears to be a base64 encoded string or a JSON Web Token (JWT) containing information for verifying the request's authenticity. |
| `userId` / `username` | string | A unique identifier for the Mezon user.

### **Request Headers**

| Header         | Value              | Description                                        |
| -------------- | ------------------ | -------------------------------------------------- |
| `Content-Type` | `application/json` | Indicates that the request body is in JSON format. |

### **Request Body**

The body of the request contains a JSON object with details of the message that triggered the webhook.

#### **Root Object**

| Field        | Type   | Required | Description                                                      |
| ------------ | ------ | -------- | ---------------------------------------------------------------- |
| `content`    | JSON   | Yes      | An a JSON-encoded string containing the details of the message.                 |
| `attachments`| array of objects  | Yes      | An array containing object media files. |

-----

### **`content` JSON**

This JSON property encapsulates the content and metadata of the message.

| Field      | Type             | Required | Description                                                                                                                                                                                                                                                      |
| ---------- | ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `t`        | string           | Yes      | The raw text content of the message.                                                                                                                                                                                                                             |
| `mk`       | array of objects | No       | An array of objects describing markdown or special formatting applied to the message text. It's noteworthy that multiple `mk` arrays can be present. The possible values for `type` within this object could include `lk` (link) and `pre` (pre-formatted text). |


#### **`mk` Object (Formatting)**

| Field  | Type    | Required | Description                                                              |
| ------ | ------- | -------- | ------------------------------------------------------------------------ |
| `type` | string  | Yes      | The type of formatting applied (e.g., `"lk"`, `"pre"`).                  |
| `s`    | integer | Yes      | The starting character index of the formatted segment in the `t` string. |
| `e`    | integer | Yes      | The ending character index of the formatted segment in the `t` string.   |

### **`attachments` Array of object**

This each object in array encapsulates the field `url` and `filetype`.

| Field      | Type             | Required | Description                                                                                                                                                                                                                                                      |
| ---------- | ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`        | string           | Yes      | The direct web link to the attached file’s location, used to download or stream the media.                                                                                                                                                                                                                             |
| `filetype`       | array of objects | No       | A string representing the file’s MIME type (also known as "media type"), which specifies the format and nature of the file. For instance, `video/mp4` indicates that the attachment is an MP4 video file, whereas `image/png` means it's a PNG image. |

### **Clan Webhook example**

**Payload**

```json

{
  "content": "{\"t\":\"Welcome to Mezon Clan webhook!!! [pre] This is a block message. [lk] https://mezon.ai\",\"mk\":[{\"type\":\"pre\",\"s\":33,\"e\":64},{\"type\":\"lk\",\"s\":68,\"e\":85}]}",
  "attachments": [
    {
      "url": "https://cdn.mezon.ai/1779484504377790464/1840697559803236352/1783755414765047800/1754039772297_AQNxb7DO9AIpGkHCL9mrc6XpDdGDpwnJSHBENFRYhQN3qJL9UesDSzD7FXzDgRDC_MZ5o7shIamPxKQ36CleVkSD.mp4",
      "filetype": "video/mp4"
    },
    {
      "url": "https://cdn.mezon.vn/0/1843962578301095936/1829065039080853500/95_0thumbnail_dog1.jpg",
      "filetype": "image/png"
    }
  ]
}

```

**Result**

You can see the messages sent from webhooks in your **`Inbox`**.

![mezon-webhook-011](https://mezon.ai/docs/images/mezon-webhook-011.png)
