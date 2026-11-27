---
sidebar_position: 3
sidebar_label: Các MMN SDK độc lập
description: Tích hợp trực tiếp với blockchain MMN, dịch vụ ZK prover và indexer bằng mmn-client-js, go-sdk và Mezon.Net.Mmn.
---

# Các MMN SDK độc lập

Khi bạn xây dựng backend thanh toán, công cụ tra cứu ví, hệ thống trả thưởng hoặc dịch vụ không cần kết nối socket chat Mezon, hãy dùng trực tiếp các SDK độc lập trong `mezonai/mmn-sdk` và `Mezon.Net.Mmn`.

## Ma trận SDK

| Ngôn ngữ | Gói | Giao thức | Thành phần chính | Khuyến nghị |
|---|---|---|---|---|
| **TypeScript / JS** | `mmn-client-js` (`1.0.16`, npm) | JSON-RPC & REST (`fetch`) | `MmnClient`, `IndexerClient`, `ZkClient`, `DongClient` | Khuyên dùng cho Node.js và trình duyệt |
| **Go** | `github.com/mezonai/mmn-sdk/go-sdk` (`v1.1.0`) | gRPC + Protobuf | `MmnClient`, ký `edwards25519`, `zkverify` (`consensys/gnark`) | Khuyên dùng cho backend Go và dịch vụ xác minh ZK |
| **.NET** | **`Mezon.Net.Mmn`** (`1.11.0`, NuGet) | gRPC + HTTP | `MmnClient`, `MmnNodeClient`, `ZkProveClient`, `CryptoHelper` | **Ưu tiên dùng thay cho `mmn-sdk/donet-sdk`** |

## TypeScript (`mmn-client-js`)

```bash
npm install mmn-client-js
```

`mmn-client-js` xuất ra bốn client chuyên biệt:

- **`MmnClient`** — Client JSON-RPC làm việc với node MMN (`generateEphemeralKeyPair`, `getAddressFromUserId`, `getCurrentNonce`, `scaleAmountToDecimals`, `sendTransaction`, `getAccountByAddress`).
- **`IndexerClient`** — Client REST truy vấn dữ liệu blockchain đã xác nhận (`getTransactionByHash`, `getTransactionByWallet`, `getTransactionsByWalletBeforeTimestamp`, `getWalletDetail`).
- **`ZkClient`** — Client REST sinh bằng chứng zkLogin (`getZkProofs` → `POST /prove`).
- **`DongClient`** — Client REST cho API lì xì QR Mezon Dong (`claimAmountRedEnvelopeQR`, `claimRedEnvelopeQR`).

```ts
import { IndexerClient, MmnClient, ZkClient } from "mmn-client-js";

const mmn = new MmnClient({ baseUrl: "https://dong.mezon.ai/mmn-api/" });
const zk = new ZkClient({ endpoint: "https://dong.mezon.ai/zk-api/" });

// Suy địa chỉ MMN xác định từ Mezon user ID
const address = mmn.getAddressFromUserId("MEZON_USER_ID");
const nonceInfo = await mmn.getCurrentNonce("MEZON_USER_ID", "pending");
console.log("Địa chỉ:", address, "Pending nonce:", nonceInfo.nonce);

// Truy vấn chi tiết ví và giao dịch đã xác nhận qua IndexerClient
const indexer = new IndexerClient({
  endpoint: "https://dong.mezon.ai/indexer-api",
  chainId: "1337",
});
const wallet = await indexer.getWalletDetail(address);
console.log("Thông tin ví:", wallet);
```

## Go (`mmn-sdk/go-sdk`)

```bash
go get github.com/mezonai/mmn-sdk/go-sdk@v1.1.0
```

Go SDK (`go 1.24+`) kết nối trực tiếp gRPC với node MMN (`HealthService`, `TxService`, `AccountService`), dùng `filippo.io/edwards25519` để ký, `uint256` cho số dư và đi kèm gói `zkverify` dùng `consensys/gnark` để xác minh bằng chứng ZK:

```go
package main

import (
	"context"
	"fmt"

	"github.com/mezonai/mmn-sdk/go-sdk/client"
)

func main() {
	c, err := client.NewClient(client.Config{
		Endpoint: "mmn-grpc.example.com:443",
		UseTLS:   true,
	})
	if err != nil {
		panic(err)
	}

	ctx := context.Background()
	acc, err := c.GetAccount(ctx, "MMN_BASE58_ADDRESS")
	if err != nil {
		panic(err)
	}
	fmt.Printf("Balance=%s Nonce=%d\n", acc.Balance.String(), acc.Nonce)
}
```

Các phương thức gRPC khả dụng gồm `CheckHealth`, `GetAccount`, `GetCurrentNonce`, `GetTxByHash`, `AddTx` và luồng theo dõi `SubscribeTransactionStatus`.

## .NET (`Mezon.Net.Mmn`)

:::tip Ưu tiên `Mezon.Net.Mmn` thay cho `mmn-sdk/donet-sdk`
Hãy sử dụng gói NuGet **`Mezon.Net.Mmn`** đang được duy trì tích cực (phát hành đồng bộ với `Mezon.Net.Sdk` `1.11.0`, hỗ trợ .NET 6–10) thay vì thư mục mã nguồn cũ `mmn-sdk/donet-sdk`. `Mezon.Net.Mmn` dùng chung giao thức gRPC/HTTP nhưng có các bản vá phụ thuộc, hỗ trợ `CancellationToken` và đồng bộ nonce an toàn luồng.
:::

```bash
dotnet add package Mezon.Net.Mmn --version 1.11.0
```

```csharp
using Mezon.Net.Mmn;
using Mezon.Net.Mmn.Models;
using Mezon.Net.Mmn.Utils;

using var mmn = new MmnClient(new MmnConfig
{
    Endpoint = "https://dong.mezon.ai/mmn-api/",
    ZkProveEndpoint = "https://dong.mezon.ai/zk-api/",
});

var address = CryptoHelper.GenerateAddress("MEZON_USER_ID");
var nonce = await mmn.NodeClient.GetCurrentNonceAsync(address, "pending");
Console.WriteLine($"Address={address} PendingNonce={nonce}");
```

## Liên quan

- [Tổng quan Thanh toán & MMN](./overview.md)
- [Chuyển token từ bot](./bot-token-transfers.mdx)
