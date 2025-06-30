---
title: Mezon Webhooks Docs
---

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

  - Click on **`Copy Webhook URL`** to get the webhook's endpoint, use it with the **[`webhook payload`](#webhook-specification)** to send messages to the channel.

## Webhook Specification

### **Endpoint**

The webhook is delivered via an HTTP POST request to a unique URL generated for each webhook integration.

**URL Structure:**

```
https://webhook.mezon.ai/webhooks/{channelId}/{token}
```

**URL Parameters:**

| Parameter   | Type   | Description                                                                                                                                                                          |
| :---------- | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `webhookId` | string | A unique identifier for the webhook configuration.                                                                                                                                   |
| `token`     | string | A security token for authenticating the request. It appears to be a base64 encoded string or a JSON Web Token (JWT) containing information for verifying the request's authenticity. |

### **Request Headers**

| Header         | Value              | Description                                        |
| -------------- | ------------------ | -------------------------------------------------- |
| `Content-Type` | `application/json` | Indicates that the request body is in JSON format. |

### **Request Body**

The body of the request contains a JSON object with details of the message that triggered the webhook.

#### **Root Object**

| Field     | Type   | Required | Description                                                      |
| --------- | ------ | -------- | ---------------------------------------------------------------- |
| `type`    | string | Yes      | The type of the webhook event. For this example, it is `"hook"`. |
| `message` | object | Yes      | An object containing the details of the message.                 |

-----

### **`message` Object**

This object encapsulates the content and metadata of the message.

| Field      | Type             | Required | Description                                                                                                                                                                                                                                                      |
| ---------- | ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `t`        | string           | Yes      | The raw text content of the message.                                                                                                                                                                                                                             |
| `mk`       | array of objects | No       | An array of objects describing markdown or special formatting applied to the message text. It's noteworthy that multiple `mk` arrays can be present. The possible values for `type` within this object could include `lk` (link) and `pre` (pre-formatted text). |
| `mentions` | array of objects | No       | An array of objects, each representing a user mentioned in the message.                                                                                                                                                                                          |
| `images`   | array of objects | No       | An array of objects, each representing an image attached to the message.                                                                                                                                                                                         |

#### **`mk` Object (Formatting)**

| Field  | Type    | Required | Description                                                              |
| ------ | ------- | -------- | ------------------------------------------------------------------------ |
| `type` | string  | Yes      | The type of formatting applied (e.g., `"lk"`, `"pre"`).                  |
| `s`    | integer | Yes      | The starting character index of the formatted segment in the `t` string. |
| `e`    | integer | Yes      | The ending character index of the formatted segment in the `t` string.   |

#### **`mentions` Object**

| Field      | Type    | Required | Description                                                    |
| ---------- | ------- | -------- | -------------------------------------------------------------- |
| `username` | string  | Yes      | The username of the mentioned user.                            |
| `user_id`  | string  | Yes      | The unique identifier of the mentioned user.                   |
| `s`        | integer | Yes      | The starting character index of the mention in the `t` string. |
| `e`        | integer | Yes      | The ending character index of the mention in the `t` string.   |

#### **`images` Object**

| Field | Type    | Required | Description                                        |
| ----- | ------- | -------- | -------------------------------------------------- |
| `fn`  | string  | Yes      | The filename of the image.                         |
| `sz`  | integer | Yes      | The size of the image in bytes.                    |
| `url` | string  | Yes      | The public URL to access the image.                |
| `ft`  | string  | Yes      | The MIME type of the image (e.g., `"image/jpeg"`). |
| `w`   | integer | Yes      | The width of the image in pixels.                  |
| `h`   | integer | Yes      | The height of the image in pixels.                 |

### **Example Payload**

**Payload**

```json
{
    "type": "hook",
    "message": {
        "t": "[pre] Webhook message example: [lk] https://mezon.ai \n [mention] mezon.webhook@ncc.asia",
        "mk": [
            {
                "type": "pre",
                "s": 0,
                "e": 30
            },
            {
                "type": "lk",
                "s": 36,
                "e": 54
            }
        ],
        "mentions": [
            {
                "user_id":"1783755414765047808",
                "s": 65,
                "e": 88
            }
        ],
        "images": [
            {
                "fn":"thumbnail_dog1.jpg",
                "sz":5620,
                "url":"https://cdn.mezon.vn/0/1843962578301095936/1829065039080853500/95_0thumbnail_dog1.jpg",
                "ft":"image/jpeg",
                "w":275,
                "h":183
            }
        ]
    }
}
```

**Result**

![mezon-webhook-004](/images/mezon-webhook-004.png)
