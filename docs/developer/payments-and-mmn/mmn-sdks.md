---
sidebar_position: 3
sidebar_label: MMN SDKs
description: Integrate directly with the MMN blockchain, ZK prover, and indexer using mmn-client-js, go-sdk, and Mezon.Net.Mmn.
---

# Standalone MMN SDKs

If you are building a payment backend, wallet explorer, reward service, or non-bot integration that talks directly to MMN without a Mezon chat socket, use the standalone SDKs in `mezonai/mmn-sdk` and `Mezon.Net.Mmn`.

## SDK matrix

| Language | Package | Transport | Key components | Recommendation |
|---|---|---|---|---|
| **TypeScript / JS** | `mmn-client-js` (`1.0.16`, npm) | JSON-RPC & REST (`fetch`) | `MmnClient`, `IndexerClient`, `ZkClient`, `DongClient` | Recommended for Node.js and browser integrations |
| **Go** | `github.com/mezonai/mmn-sdk/go-sdk` (`v1.1.0`) | gRPC + Protobuf | `MmnClient`, `edwards25519` signing, `zkverify` (`consensys/gnark`) | Recommended for Go backend services & verifiers |
| **.NET** | **`Mezon.Net.Mmn`** (`1.11.0`, NuGet) | gRPC + HTTP | `MmnClient`, `MmnNodeClient`, `ZkProveClient`, `CryptoHelper` | **Preferred over `mmn-sdk/donet-sdk`** |

## TypeScript (`mmn-client-js`)

```bash
npm install mmn-client-js
```

`mmn-client-js` exports four focused clients:

- **`MmnClient`** — JSON-RPC client for MMN nodes (`generateEphemeralKeyPair`, `getAddressFromUserId`, `getCurrentNonce`, `scaleAmountToDecimals`, `sendTransaction`, `getAccountByAddress`).
- **`IndexerClient`** — REST client for querying confirmed blockchain data (`getTransactionByHash`, `getTransactionByWallet`, `getTransactionsByWalletBeforeTimestamp`, `getWalletDetail`).
- **`ZkClient`** — REST client for generating zkLogin proofs (`getZkProofs` → `POST /prove`).
- **`DongClient`** — REST client for Mezon Dong Red Envelope QR claim APIs (`claimAmountRedEnvelopeQR`, `claimRedEnvelopeQR`).

```ts
import { IndexerClient, MmnClient, ZkClient } from "mmn-client-js";

const mmn = new MmnClient({ baseUrl: "https://dong.mezon.ai/mmn-api/" });
const zk = new ZkClient({ endpoint: "https://dong.mezon.ai/zk-api/" });

// Derive a deterministic MMN address from a Mezon user ID
const address = mmn.getAddressFromUserId("MEZON_USER_ID");
const nonceInfo = await mmn.getCurrentNonce("MEZON_USER_ID", "pending");
console.log("Address:", address, "Pending nonce:", nonceInfo.nonce);

// Query confirmed wallet details & transactions via IndexerClient
const indexer = new IndexerClient({
  endpoint: "https://dong.mezon.ai/indexer-api",
  chainId: "1337",
});
const wallet = await indexer.getWalletDetail(address);
console.log("Wallet detail:", wallet);
```

## Go (`mmn-sdk/go-sdk`)

```bash
go get github.com/mezonai/mmn-sdk/go-sdk@v1.1.0
```

The Go SDK (`go 1.24+`) speaks gRPC directly to MMN nodes (`HealthService`, `TxService`, `AccountService`), uses `filippo.io/edwards25519` for signing, `uint256` for balances, and ships `zkverify` built on `consensys/gnark` for verifying ZK proofs in Go services:

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

Available gRPC methods include `CheckHealth`, `GetAccount`, `GetCurrentNonce`, `GetTxByHash`, `AddTx`, and streaming `SubscribeTransactionStatus`.

## .NET (`Mezon.Net.Mmn`)

:::tip Prefer `Mezon.Net.Mmn` over `mmn-sdk/donet-sdk`
Use the maintained **`Mezon.Net.Mmn`** NuGet package (shipped alongside `Mezon.Net.Sdk` `1.11.0`, targeting .NET 6–10) rather than the older `mmn-sdk/donet-sdk` source folder. `Mezon.Net.Mmn` shares identical gRPC/HTTP contracts while keeping dependencies, cancellation support, and thread-safe nonce handling up to date.
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

## Related

- [Payments & MMN overview](./overview.md)
- [Bot token transfers](./bot-token-transfers.mdx)
