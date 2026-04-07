# 実装ガイド: UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001

## Part 1: 概念説明（中学生レベル）

### なぜこの変更が必要だったのか

アプリの各部分（メイン画面・バックグラウンド処理・設定管理）が互いに連絡を取るために「内線番号」を使っています。たとえば「スキルの作成が進んでいます」という連絡には `skill-creator:progress` という番号を使います。

これまでは、その内線番号がアプリの特定の部屋（`preload`）にだけ書かれたメモに書いてありました。もし別の部屋でも同じ番号を使いたくなったとき、番号を2ヶ所に書く必要があり、書き間違いのリスクがありました。

今回の変更では、この番号を全員が参照できる「共通の電話帳」（`packages/shared/src/ipc/channels.ts`）に移しました。これで番号は1ヶ所だけに書かれており、どこからでも同じ番号を参照できるようになりました。

### 今回作ったもの

- **共通電話帳への登録**: `SKILL_CREATOR_RUNTIME_CHANNELS` という名前のグループに3つの内線番号を登録
- **参照先の統一**: `preload` は自分でメモを持つのをやめ、共通電話帳を見るように変更
- **確認テスト**: 「共通電話帳と各部屋の番号が一致しているか」を自動で確認するテスト追加

---

## Part 2: 技術詳細

### SKILL_CREATOR_RUNTIME_CHANNELS の TypeScript 定義

```typescript
// packages/shared/src/ipc/channels.ts
/**
 * スキルクリエイター runtime 系のIPCチャネル
 * preload の直書きを廃止し、shared を正本とする。
 * @see apps/desktop/src/preload/channels.ts
 */
export const SKILL_CREATOR_RUNTIME_CHANNELS = {
  SKILL_CREATOR_PROGRESS: "skill-creator:progress",
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed",
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed",
} as const;
```

### 使用例

#### shared 側での定義方法

```typescript
// IPC_CHANNELS への統合
export const IPC_CHANNELS = {
  // ... 他のチャンネル ...
  ...SKILL_CREATOR_RUNTIME_CHANNELS,
  // ...
} as const;
```

#### preload 側での import・使用方法

```typescript
// apps/desktop/src/preload/channels.ts
// Skill Creator runtime 系チャンネルは shared 正本を参照（直書き禁止）
import {
  SKILL_CREATOR_RUNTIME_CHANNELS,
  // ... 他の import ...
} from "@repo/shared/src/ipc/channels";

// IPC_CHANNELS へのスプレッド
export const IPC_CHANNELS = {
  // ...
  ...SKILL_CREATOR_RUNTIME_CHANNELS,
  // ...
} as const;

// ALLOWED_ON_CHANNELS での参照（変更不要）
export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // ...
  IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
  IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
  IPC_CHANNELS.SKILL_CREATOR_ADAPTER_STATUS_CHANGED,
  // ...
];
```

#### cross-layer parity テストの書き方

```typescript
// apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts
describe("skill creator runtime channel parity", () => {
  it("shared の runtime channel 正本と preload の IPC_CHANNELS が一致する", async () => {
    const { IPC_CHANNELS } = await import("../../../../preload/channels");
    expect(IPC_CHANNELS.SKILL_CREATOR_PROGRESS).toBe(
      SHARED_IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
    );
    // ... 他 2 チャンネルも同様
  });
});
```

### チャンネル定数一覧

| 定数名                                 | 文字列値                                 | 用途                         |
| -------------------------------------- | ---------------------------------------- | ---------------------------- |
| `SKILL_CREATOR_PROGRESS`               | `"skill-creator:progress"`               | 実行進捗通知（push）         |
| `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` | `"skill-creator:workflow-state-changed"` | ワークフロー状態変更（push） |
| `SKILL_CREATOR_ADAPTER_STATUS_CHANGED` | `"skill-creator:adapter-status-changed"` | アダプタ状態変更（push）     |

### エラーハンドリング方針

- **import パス誤り**: `@repo/shared/src/ipc/channels` のみが正。`@repo/shared` root や相対パスは使用禁止
- **循環依存**: shared は desktop に依存しない設計。逆方向の import は禁止
- **重複定義**: preload への直書きは禁止。shared 側の1箇所のみで定義する

### エッジケース

| ケース         | 対応方針                                                |
| -------------- | ------------------------------------------------------- |
| channel 未定義 | TypeScript 型エラーとして検出される                     |
| 重複定義       | `as const` と TypeScript 型チェックで防止               |
| typo           | `SCREAMING_SNAKE_CASE` 定数使用により実行時エラーを防止 |
