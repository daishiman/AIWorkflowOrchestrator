# 実装ガイド - AI Runtime AuthMode Foundation

## メタ情報

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| タスクID | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| Phase    | 12 - ドキュメント                            |
| 作成日   | 2026-03-13                                   |

## Part 1: 中学生レベル概念説明

### なぜ必要か

この機能が必要な理由は、AI の使い方が 2 種類あるのに、画面上で同じものとして見えてしまうと混乱するからです。  
たとえば学校で「先生に頼んでやってもらう作業」と「自分で手を動かす作業」を同じボタンにすると、誰が何をしたのか分からなくなります。

- アプリが自動で AI に依頼する操作（Integrated API Runtime）
- ユーザーが terminal で手動実行する操作（Claude Code Terminal Surface）

この 2 つを分けることで、責任の場所と失敗時の案内が明確になります。

### 何をするか

設定画面の 3 領域を一貫したルールでそろえます。

1. 認証方式カード
2. Claude Agent SDK APIキー入力
3. APIキー設定一覧

それぞれで表示がバラバラにならないよう、`ready` / `blocked` / `unavailable` の語彙で統一します。

## Part 2: 開発者向け実装詳細

### 型定義（TypeScript）

```typescript
export type AIAccessCapability =
  | "integratedRuntime"
  | "terminalSurface"
  | "both"
  | "none";

export interface AIAccessCapabilityResult {
  capability: AIAccessCapability;
  integratedRuntime: { available: boolean; reason?: string };
  terminalSurface: { available: boolean; reason?: string };
  guidance?: { title: string; actionLabel?: string; targetPath?: string };
}

export interface CredentialProvider {
  getCredential(providerId: string): Promise<string | null>;
  hasCredential(providerId: string): Promise<boolean>;
}
```

### APIシグネチャ

```typescript
// Main authority
resolveCapability(surfaceId: string): Promise<AIAccessCapabilityResult>;
resolveRuntime(input: { providerId?: string; modelId?: string }): Promise<{
  providerId: string;
  modelId: string;
  cacheKey: string;
}>;

// Preload -> Renderer
window.electronAPI.authMode.status(): Promise<{
  success: boolean;
  data?: { mode: "subscription" | "api-key"; isValid: boolean };
  error?: { code: string; message: string };
}>;
```

### 使用例

```ts
const capability = await resolveCapability("settings");
if (!capability.integratedRuntime.available) {
  return {
    status: "blocked",
    guidance: capability.guidance,
  };
}

const runtime = await resolveRuntime({ providerId: "anthropic" });
const credential = await credentialProvider.getCredential(runtime.providerId);
if (!credential) {
  throw new Error("AUTH_KEY_MISSING");
}
```

### エラーハンドリング

- `AUTH_KEY_MISSING`: APIキー不足。設定画面導線を返す。
- `CAPABILITY_BLOCKED`: その画面では自動実行しない。terminal handoff を返す。
- `PROVIDER_UNAVAILABLE`: provider 解決失敗。代替導線付き guidance を返す。
- すべて fail-fast。silent fallback（自動 terminal 切替）は禁止。

### エッジケース

- `subscription` から `api-key` に切替直後で key 未保存の状態
- provider 行は `登録済み` だが上位 capability が `blocked` の不整合状態
- terminal がインストール済みでも PATH 不整合で実行不可の状態
- 設定画面の 3 領域（認証方式 / SDK APIキー / 一覧）の表示遅延による瞬間不整合

### 設定項目と定数一覧

| 項目                 | 既定値 / 値                                               |
| -------------------- | --------------------------------------------------------- |
| `AIAccessCapability` | `integratedRuntime` / `terminalSurface` / `both` / `none` |
| UI状態語彙           | `ready` / `blocked` / `unavailable`                       |
| Fail-fast 方針       | silent fallback 禁止、必ず guidance 返却                  |
| terminal 境界        | auto send / auto retry / hidden prompt injection 禁止     |

### 後続タスクへの引き継ぎ

- Task02,03,04,05,06,07,08,09,10 は Task01 の `design-summary` と settings review board を必須参照にする。
- Task06 は設定画面 3 領域の整合を UI 契約として固定する。
