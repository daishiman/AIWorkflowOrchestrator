# implementation-guide: disclosure DI 接続（UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001）

## Part 1（初学者向け）

### なぜ必要か

画面に出す「今どの AI を使っているか」の説明が、前はいつも同じ固定値でした。
そのままだと、実際の設定を切り替えても説明だけ古いまま残ります。

### 何をするか

実際の認証モードを見て、表示するサービス名を切り替えるようにしました。
その結果、subscription と api-key で画面に出す説明が実態に合います。

### たとえば

たとえば、交通系 IC カードの利用明細が、使った路線ごとに正しい会社名を出すのに近いです。
いつも同じ会社名しか出ない明細だと、どこで使ったか分からなくなります。

### 今回作ったもの

| 項目                         | 役割                            |
| ---------------------------- | ------------------------------- |
| `buildDisclosureInfo()`      | authMode から表示名を組み立てる |
| `authModeServiceForRuntime`  | runtime 側の現在値を渡す        |
| `disclosureHandlers.test.ts` | 期待値と安全性を確認する        |

## Part 2（開発者向け）

### 型定義

```ts
export interface DisclosureInfo {
  aiServiceName: string;
  modelName: string;
  externalDestinations: string[];
}

export interface IAuthModeService {
  getMode(): "subscription" | "api-key";
}
```

### 使用例

```ts
const DISCLOSURE_MODEL_NAME = "claude-sonnet-4-6";

function buildDisclosureInfo(
  authModeService: IAuthModeService,
): DisclosureInfo {
  const mode = authModeService.getMode();
  const aiServiceName =
    mode === "subscription"
      ? "Claude Code CLI"
      : mode === "api-key"
        ? "Anthropic API"
        : "unknown";

  return {
    aiServiceName,
    modelName: DISCLOSURE_MODEL_NAME,
    externalDestinations: [],
  };
}
```

### API シグネチャ

```ts
function buildDisclosureInfo(authModeService: IAuthModeService): DisclosureInfo;
```

### エラーハンドリング

- `getDisclosureInfo()` 例外時は `DISCLOSURE_ERROR`
- sender 不一致時は `UNAUTHORIZED`
- secret 系フィールドはレスポンスへ含めない

### エッジケース

| ケース        | 動作               |
| ------------- | ------------------ |
| authMode 不明 | `unknown`          |
| handler 例外  | `DISCLOSURE_ERROR` |
| 不正 sender   | `UNAUTHORIZED`     |

### 設定項目と定数一覧

| 名称                    | 値                  |
| ----------------------- | ------------------- |
| `DISCLOSURE_MODEL_NAME` | `claude-sonnet-4-6` |

### テスト構成

- 12 tests PASS
- Line 97.29%
- Branch 85.71%
- Function 100%
