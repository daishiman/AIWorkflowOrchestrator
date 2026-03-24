# UT-06-002: PermissionStore V2 実装ガイド

## Part 1: 概念的な説明（中学生レベル）

### PermissionStore って何？

PermissionStore は「セキュリティガードの記憶ノート」のようなものです。

アプリの中にある AI エージェントがファイルを読んだり、コマンドを実行したりするとき、「このツールを使っていいですか？」とユーザーに聞きます。ユーザーが「OK、次からは聞かないで」と答えると、その許可がノートに書き込まれます。

### V1 と V2 の違い

**V1（旧版）** は単純なノートでした:

- 「Read ツール: OK」
- 「Write ツール: OK」

これだけ。一度 OK すれば永遠に OK。

**V2（新版）** は賢いノートになりました:

- 「Read ツール: OK（今日だけ）」 → 24時間後に自動で消える
- 「Bash ツール: OK（このセッションだけ）」 → アプリを閉じたら消える
- 「Glob ツール: OK（ずっと）」 → 消すまで残る
- 「Write ツール: OK（スキルAのときだけ）」 → 別のスキルからは使えない

### 4つの「有効期限」

| 有効期限  | 日常での例え                         |
| --------- | ------------------------------------ |
| session   | 映画館の座席指定（その上映だけ有効） |
| time_24h  | ワンデーパス（24時間有効）           |
| time_7d   | ウィークリーパス（7日間有効）        |
| permanent | 年間パス（取り消すまでずっと有効）   |

---

## Part 2: 技術的詳細

### 変更されたファイル

| ファイル                                                  | 変更種別                   |
| --------------------------------------------------------- | -------------------------- |
| `packages/shared/src/types/permission-store.ts`           | V2 型定義追加              |
| `packages/shared/src/types/index.ts`                      | エクスポート追加           |
| `packages/shared/index.ts`                                | ルートエクスポート追加     |
| `apps/desktop/src/main/services/skill/PermissionStore.ts` | V2 メソッド追加            |
| `apps/desktop/src/main/ipc/permission-store-handlers.ts`  | clear-session ハンドラ追加 |
| `apps/desktop/src/preload/channels.ts`                    | チャンネル定数追加         |

### 型定義

```typescript
// ExpiryPolicy: 4つの失効ポリシー
type ExpiryPolicy = "session" | "time_24h" | "time_7d" | "permanent";

// AllowedToolEntryV2: V1 を拡張
interface AllowedToolEntryV2 extends AllowedToolEntry {
  expiresAt?: number; // Unix ms, undefined = 無期限
  skillName?: string; // undefined = 全スキル対象
  expiryPolicy?: ExpiryPolicy; // undefined = permanent
}
```

### isToolAllowed 6分岐フロー

```
isToolAllowed(toolName, skillName?)
  |
  +-- (1) entry なし → false
  |
  +-- (2) expiresAt undefined → skillName チェックへ
  |
  +-- (3) expiresAt < now → 削除 & false (lazy eviction)
  |
  +-- (4) expiresAt >= now → skillName チェックへ
  |
  +-- (5) entry.skillName !== skillName → false
  |
  +-- (6) 全条件クリア → true
```

### calcExpiresAt

```typescript
function calcExpiresAt(
  policy: ExpiryPolicy,
  allowedAt: number,
): number | undefined {
  switch (policy) {
    case "session":
      return undefined;
    case "time_24h":
      return allowedAt + 86_400_000;
    case "time_7d":
      return allowedAt + 604_800_000;
    case "permanent":
      return undefined;
  }
}
```

### IPC チャンネル

| チャンネル                 | 方向          | 用途                       |
| -------------------------- | ------------- | -------------------------- |
| `permission:clear-session` | Renderer→Main | セッションエントリのクリア |

P42 準拠 3段バリデーション適用: 型チェック → 空文字列 → trim 空文字列

### V1→V2 マイグレーション

V1 エントリ（expiresAt/skillName/expiryPolicy 未定義）は自動的に「permanent・全スキル対象」として扱われます。マイグレーションはアプリ起動時の `initializeCache()` で実行されます。

### 使用例

```typescript
// V2 エントリの追加
permissionStore.allowToolV2({
  toolName: "Read",
  allowedAt: new Date().toISOString(),
  expiryPolicy: "time_24h",
  skillName: "my-skill",
});

// 許可チェック（スキルスコープ付き）
permissionStore.isToolAllowed("Read", "my-skill"); // true
permissionStore.isToolAllowed("Read", "other-skill"); // false

// セッションエントリの一括削除
const removed = permissionStore.revokeSessionEntries("session-123");
```
