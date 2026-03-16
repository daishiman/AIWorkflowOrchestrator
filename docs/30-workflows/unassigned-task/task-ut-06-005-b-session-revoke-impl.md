# revokeSessionEntries セッション別本格実装 - タスク指示書

## メタ情報

```yaml
issue_number: 1292
```

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | UT-06-005-B                               |
| タスク名     | revokeSessionEntries セッション別本格実装 |
| 分類         | 実装                                      |
| 対象機能     | PermissionStore Session Management        |
| 優先度       | 中                                        |
| 見積もり規模 | 小規模                                    |
| ステータス   | 未実施                                    |
| 発見元       | UT-06-005 Phase 12 未タスク検出（GAP-04） |
| 発見日       | 2026-03-17                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-06-005（Permission拒否時のabort/skip/retry/timeoutフォールバック実装）において、abort 時のクリーンアップ処理として `revokeSessionEntries` メソッドを `PermissionStore` に追加した。しかし現在の実装はスタブ（全エントリクリア）であり、セッション識別子を用いた選択的な取り消しが行われていない。

また、`AllowedToolEntry`（`packages/shared/src/types/permission-store.ts`）に `sessionId` フィールドが存在しないため、そもそもセッション別フィルタリングの基盤が整備されていない状態である。

### 1.2 問題点・課題

1. 現在の `revokeSessionEntries` は全エントリをクリアするため、abort されたセッション以外の「許可済みエントリ」も誤って削除される
2. `AllowedToolEntry` に `sessionId` フィールドがないため、セッション別のフィルタリングができない
3. セッション識別子の生成・管理ポリシー（どの単位でセッションを区切るか、ID の形式等）が未定義

### 1.3 放置した場合の影響

- 1つのセッションで abort が発生すると、他のセッションで「常に許可」「常に拒否」として登録したエントリが全て失われる
- ユーザーが再度 Permission を求められる UX 劣化が発生する
- 並列スキル実行時に Permission ストアが予期しない状態になるリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

`revokeSessionEntries` をスタブから本格実装に置き換え、abort 発生時に該当セッションのエントリのみを選択的に取り消す機能を実現する。

### 2.2 最終ゴール

- `AllowedToolEntry` に `sessionId` フィールドが追加されていること
- `revokeSessionEntries(sessionId)` が指定セッションのエントリのみを削除すること
- 他のセッションのエントリが影響を受けないこと
- 既存テストが全件パスすること

### 2.3 スコープ

#### 含むもの

- `packages/shared/src/types/permission-store.ts` の `AllowedToolEntry` に `sessionId` フィールドを追加
- `apps/desktop/src/main/permissions/PermissionStore.ts` の `revokeSessionEntries` をセッション別フィルタリング実装に置き換え
- セッション識別子の生成・管理ポリシーの定義
- 既存テストへの `sessionId` 追加対応
- 新規テストケース（セッション別フィルタリング検証）の追加

#### 含まないもの

- PermissionStore の永続化（electron-store）の変更（型追加のみ）
- UI コンポーネントの変更
- `SkillExecutor.ts` でのセッション ID 発行ロジック（最小実装では `crypto.randomUUID()` を使用）

### 2.4 成果物

- `packages/shared/src/types/permission-store.ts`（`AllowedToolEntry` に `sessionId: string` 追加）
- `apps/desktop/src/main/permissions/PermissionStore.ts`（`revokeSessionEntries` 本格実装）
- `apps/desktop/src/main/permissions/__tests__/PermissionStore.session.test.ts`（新規テスト）

---

## 3. どう実装するか（How）

### 3.1 実装方針

#### Step 1: 影響範囲の事前調査

実装前に `AllowedToolEntry` の使用箇所を全調査すること（P21/P35 対策）：

```bash
# AllowedToolEntry の使用箇所を調査
grep -rn "AllowedToolEntry" apps/desktop/src/ packages/shared/src/ --include="*.ts"

# テストファイルでの使用箇所を調査（モック修正が必要な箇所）
grep -rn "AllowedToolEntry" apps/desktop/src/ packages/ --include="*.test.ts"
```

#### Step 2: 型定義の更新（P32 準拠 - 2ファイル同時更新）

`AllowedToolEntry` に `sessionId` を追加する。P32 準拠で `packages/shared` と `apps/desktop/src/preload/types.ts` を同時更新すること：

```typescript
// packages/shared/src/types/permission-store.ts
export interface AllowedToolEntry {
  toolName: string;
  pattern: "always_allow" | "always_deny";
  sessionId: string; // 追加: セッション識別子
  createdAt: number;
}
```

セッション識別子のポリシー：

- 形式: UUID v4（`crypto.randomUUID()` で生成）
- 単位: スキル実行1回につき1つの sessionId を発行
- 発行場所: `SkillExecutor` のスキル実行開始時

#### Step 3: PermissionStore の本格実装

```typescript
// apps/desktop/src/main/permissions/PermissionStore.ts
revokeSessionEntries(sessionId: string): void {
  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    // P42 準拠: 3段バリデーション
    throw new Error("sessionId must be a non-empty string");
  }

  // 指定セッションのエントリのみを削除（他セッションのエントリは保持）
  this.entries = this.entries.filter(
    (entry) => entry.sessionId !== sessionId,
  );
}
```

#### Step 4: 既存テストへの sessionId 追加

P21/P35 の教訓に従い、`AllowedToolEntry` を使用している全テストに `sessionId` を追加する：

```typescript
// 変更前
const entry: AllowedToolEntry = {
  toolName: "Bash",
  pattern: "always_allow",
  createdAt: Date.now(),
};

// 変更後
const entry: AllowedToolEntry = {
  toolName: "Bash",
  pattern: "always_allow",
  sessionId: "test-session-id-001",
  createdAt: Date.now(),
};
```

### 3.2 苦戦箇所・注意点（前回の教訓）

**P21/P35（DI 追加時のテストモック大規模修正）**:
`AllowedToolEntry` に `sessionId` を追加すると、このインターフェースを使用している全てのテストファイルのモックオブジェクトに `sessionId` を追加する必要がある。事前に影響範囲を `grep` で調査し、漏れがないようにすること。

**P32（型定義の二箇所同時更新）**:
`packages/shared/src/types/permission-store.ts` を変更した場合、`apps/desktop/src/preload/types.ts` にも同様の変更が必要かを確認すること。変更後は必ず `pnpm --filter @repo/desktop typecheck` で型整合性を検証すること。

**P42（文字列引数の .trim() バリデーション漏れ）**:
`revokeSessionEntries(sessionId: string)` の引数バリデーションは、型チェック → 空文字列 → トリム空文字列の3段バリデーションを適用すること：

```typescript
if (
  typeof sessionId !== "string" ||
  sessionId === "" ||
  sessionId.trim() === ""
) {
  throw new Error("sessionId must be a non-empty string");
}
```

**sessionId 発行タイミングの設計**:
`SkillExecutor` のスキル実行開始時（どのメソッドが起点か）を先に確認してから、sessionId 発行ロジックの追加位置を決定すること。

### 3.3 テスト方針

テストファイル: `apps/desktop/src/main/permissions/__tests__/PermissionStore.session.test.ts`

| TC-ID    | テスト内容                                                          | 期待結果                                            |
| -------- | ------------------------------------------------------------------- | --------------------------------------------------- |
| TC-B-001 | revokeSessionEntries で指定セッションのエントリが削除される         | 指定 sessionId のエントリのみが削除されること       |
| TC-B-002 | revokeSessionEntries で他セッションのエントリが保持される           | 他の sessionId のエントリが削除されないこと         |
| TC-B-003 | 存在しない sessionId を指定した場合に何も起きない                   | エントリが変更されないこと（エラーにならないこと）  |
| TC-B-004 | 空文字列の sessionId を指定した場合にバリデーションエラーになる     | P42 準拠のバリデーションエラーがスローされること    |
| TC-B-005 | スペースのみの sessionId を指定した場合にバリデーションエラーになる | `.trim() === ""` チェックでエラーがスローされること |
| TC-B-006 | 複数エントリが混在する場合でも指定セッションのみが削除される        | 正確なフィルタリングが行われること                  |

テスト実行方法：

```bash
# P40 準拠: apps/desktop 配下で実行
pnpm --filter @repo/desktop exec vitest run src/main/permissions/__tests__/
```

---

## 4. 関連情報

### 4.1 関連タスク

| タスクID    | 関係性                                         |
| ----------- | ---------------------------------------------- |
| UT-06-005   | 前提（revokeSessionEntries スタブ実装元）      |
| UT-06-005-A | 並列対象（PreToolUse Hook フォールバック統合） |
| TASK-3-2    | 関連（PermissionResolver 実装）                |

### 4.2 関連仕様書

| 仕様書                                                                                                              | 内容                                |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`                        | Permission フォールバックフロー詳細 |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | PermissionStore ライフサイクル設計  |
| `packages/shared/src/types/permission-store.ts`                                                                     | AllowedToolEntry 型定義             |
| `apps/desktop/src/main/permissions/PermissionStore.ts`                                                              | PermissionStore 実装                |

### 4.3 関連 Pitfall

| Pitfall ID | 内容                                          |
| ---------- | --------------------------------------------- |
| P21        | 既存テストへの DI 追加時の大規模修正          |
| P32        | 型定義の二箇所同時更新必須                    |
| P35        | DI 追加時のテストモック大規模修正（P21 派生） |
| P42        | 文字列引数の `.trim()` バリデーション漏れ     |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `AllowedToolEntry` に `sessionId: string` フィールドが追加されていること
- [ ] `revokeSessionEntries(sessionId)` が指定セッションのエントリのみを削除すること
- [ ] 他のセッションのエントリが `revokeSessionEntries` の影響を受けないこと
- [ ] P42 準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が実装されていること

### 品質要件

- [ ] 新規テスト `PermissionStore.session.test.ts` が全件パスすること
- [ ] 既存テスト（`AllowedToolEntry` を使用するテスト全件）が `sessionId` 追加後もパスすること
- [ ] `pnpm --filter @repo/desktop typecheck` が通ること
- [ ] `pnpm --filter @repo/shared typecheck` が通ること
- [ ] `pnpm --filter @repo/desktop lint` が通ること

### ドキュメント要件

- [ ] Phase 12 完了時に `interfaces-agent-sdk-executor-details.md` に実装完了を記録すること
- [ ] Phase 12 完了時に LOGS.md（2ファイル）を更新すること
