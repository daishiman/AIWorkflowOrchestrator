# TC-ST-009〜010: 承認履歴上限境界値・フィルタ境界値テスト仕様

## メタ情報

| 項目               | 内容                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| テストカテゴリ     | 承認履歴上限境界値・フィルタ境界値                                   |
| 対象コンポーネント | PermissionHistoryStore、承認履歴管理ロジック、フィルタリングロジック |
| Phase              | Phase 6 テスト拡充                                                   |
| 関連タスク         | TASK-SKILL-LIFECYCLE-06                                              |
| 作成日             | 2026-03-16                                                           |

---

## 定数定義

| 定数名                           | 値     | 説明                   |
| -------------------------------- | ------ | ---------------------- |
| `PERMISSION_HISTORY_MAX_ENTRIES` | `1000` | 承認履歴の最大保持件数 |

---

## PermissionHistoryEntry フィールド定義

| フィールド名   | 型                                          | 説明                                                         |
| -------------- | ------------------------------------------- | ------------------------------------------------------------ |
| `toolName`     | `string`                                    | ツール名（例: `Bash`, `Write`, `WebFetch`）                  |
| `skillName`    | `string`                                    | スキル名（どのスキルから呼び出されたか）                     |
| `action`       | `"allowed" \| "denied" \| "revoked"`        | 承認・拒否・失効の判断結果                                   |
| `allowedAt`    | `number`（Unix timestamp ms）               | 許可または拒否が記録された日時                               |
| `revokedAt`    | `number \| undefined`                       | 失効日時（失効操作が行われた場合のみ）                       |
| `expiryPolicy` | `string`                                    | 有効期限ポリシー（例: `"session"`, `"permanent"`, `"once"`） |
| `riskLevel`    | `"critical" \| "high" \| "medium" \| "low"` | ツールのリスクレベル                                         |

---

## TC-ST-009: 承認履歴上限の3点境界値テスト

### 目的

`PERMISSION_HISTORY_MAX_ENTRIES = 1000` の境界値において、エントリ追加時の上限管理が正確に機能することを検証する。3点境界値テストとして「上限-1」「上限」「0件（下限）」の各状態をカバーする。

---

### TC-ST-009a: 999件の状態でエントリ追加（上限-1 の状態）

**Given**

- PermissionHistoryStore に `999` 件のエントリが保持されている
- `PERMISSION_HISTORY_MAX_ENTRIES = 1000` が設定されている

**When**

- 新しい承認履歴エントリを1件追加する

**Then**

- PermissionHistoryStore に `1000` 件のエントリが保持されること（999 + 1 = 1000）
- 既存の999件がすべて保持されること（削除が発生しないこと）
- 最古エントリが削除されていないこと
- 追加した新エントリが正しく格納されていること

---

### TC-ST-009b: 1000件の状態でエントリ追加（上限 = `PERMISSION_HISTORY_MAX_ENTRIES` の状態）

**Given**

- PermissionHistoryStore に `1000` 件のエントリが保持されている（上限に達している）
- エントリは追加順に保持されており、インデックス `0` が最古のエントリである

**When**

- 新しい承認履歴エントリを1件追加する

**Then**

- PermissionHistoryStore に `1000` 件のエントリが保持されること（上限を超えないこと）
- インデックス `0` の最古エントリが削除されること（FIFO: First In First Out）
- 追加した新エントリがインデックス `999` に格納されていること（末尾追加）
- 最終的に `1001` 件に増加しないこと

---

### TC-ST-009c: 0件の状態でエントリ削除（下限 = 空配列の状態）

**Given**

- PermissionHistoryStore にエントリが `0` 件（空配列の状態）である

**When**

- エントリの削除操作を実行する（例: 特定の `toolName` を持つエントリの削除、または `clear` 操作）

**Then**

- エラーがスローされないこと（`Error` が `throw` されないこと）
- `null` や `undefined` が返らず、空配列 `[]` が返ること
- PermissionHistoryStore の状態が `[]`（空配列）のまま維持されること
- 削除後も後続の追加操作が正常に機能すること

---

## TC-ST-010: フィルタ条件の組み合わせ境界値テスト

### 目的

承認履歴のフィルタリングロジックが、各フィルタ条件（ツール名、判断結果、複合条件、期間条件）の境界値で正確に機能することを検証する。特に0件ヒット・特定フィールド存在確認・AND 条件・境界等号処理を重点的に検証する。

---

### TC-ST-010a: ツール名フィルタで一致0件の場合

**Given**

- PermissionHistoryStore に複数件のエントリが保持されている（ツール名: `Bash`, `Write`, `WebFetch` など）
- フィルタ条件として存在しないツール名（例: `NonExistentTool`）が指定される

**When**

- ツール名フィルタ（`toolName: "NonExistentTool"`）で履歴を検索する

**Then**

- 返却値が空配列 `[]` であること
- `null` や `undefined` が返らないこと
- フィルタ関数がエラーをスローしないこと
- PermissionHistoryStore 内のデータが変更されていないこと（読み取り専用操作の確認）

---

### TC-ST-010b: 判断結果フィルタ（`revoked`）で `revokedAt` フィールドを持つエントリのみ返る

**Given**

- PermissionHistoryStore に以下の混在状態のエントリが保持されている
  - `action: "allowed"`, `revokedAt: undefined` のエントリ（複数件）
  - `action: "denied"`, `revokedAt: undefined` のエントリ（複数件）
  - `action: "revoked"`, `revokedAt: 1741000000000`（Unix timestamp）のエントリ（複数件）

**When**

- 判断結果フィルタ（`action: "revoked"`）で履歴を検索する

**Then**

- 返却された全エントリの `action` が `"revoked"` であること
- 返却された全エントリが `revokedAt` フィールドを持ち、かつ `undefined` でないこと（`number` 型であること）
- `action: "allowed"` および `action: "denied"` のエントリが含まれないこと
- 返却件数が PermissionHistoryStore 内の `action: "revoked"` エントリ数と一致すること

---

### TC-ST-010c: ツール名 + 判断結果の複合フィルタ（AND 条件）

**Given**

- PermissionHistoryStore に以下の4種類のエントリが保持されている
  - `toolName: "Bash"`, `action: "allowed"` のエントリ（件数 A）
  - `toolName: "Bash"`, `action: "denied"` のエントリ（件数 B）
  - `toolName: "Write"`, `action: "allowed"` のエントリ（件数 C）
  - `toolName: "Write"`, `action: "denied"` のエントリ（件数 D）

**When**

- 複合フィルタ（`toolName: "Bash"` AND `action: "allowed"`）で履歴を検索する

**Then**

- 返却された全エントリの `toolName` が `"Bash"` であること
- 返却された全エントリの `action` が `"allowed"` であること
- 返却件数が件数 A と一致すること（件数 B, C, D は含まれないこと）
- `toolName: "Write"` のエントリが含まれないこと（ツール名フィルタの確認）
- `action: "denied"` のエントリが含まれないこと（判断結果フィルタの確認）
- OR 条件ではなく AND 条件で処理されること（`toolName` または `action` のどちらか一方のみ一致するエントリが含まれないこと）

---

### TC-ST-010d: 期間フィルタ（`allowedAt` の境界値）での等号処理

**Given**

- PermissionHistoryStore に以下のタイムスタンプを持つエントリが保持されている
  - `allowedAt: 1740999999999`（期間開始時刻 - 1ms = 期間外）
  - `allowedAt: 1741000000000`（期間開始時刻ちょうど = 期間内境界）
  - `allowedAt: 1741000100000`（期間内）
  - `allowedAt: 1741000200000`（期間終了時刻ちょうど = 期間内境界）
  - `allowedAt: 1741000200001`（期間終了時刻 + 1ms = 期間外）
- 期間フィルタ条件: `from: 1741000000000` 〜 `to: 1741000200000`

**When**

- 期間フィルタ（`from: 1741000000000`, `to: 1741000200000`）で履歴を検索する

**Then**

- `allowedAt: 1741000000000`（開始時刻ちょうど）のエントリが返却されること（`>=` の等号確認）
- `allowedAt: 1741000100000`（期間内）のエントリが返却されること
- `allowedAt: 1741000200000`（終了時刻ちょうど）のエントリが返却されること（`<=` の等号確認）
- `allowedAt: 1740999999999`（開始時刻 - 1ms）のエントリが返却されないこと
- `allowedAt: 1741000200001`（終了時刻 + 1ms）のエントリが返却されないこと
- 返却件数が `3` 件であること（開始境界 + 期間内 + 終了境界）

---

## 検証観点サマリー

| テストID   | 検証観点                                  | 境界の種類                 |
| ---------- | ----------------------------------------- | -------------------------- |
| TC-ST-009a | 999件状態でのエントリ追加（削除なし）     | 上限 - 1（999件）境界      |
| TC-ST-009b | 1000件状態でのエントリ追加（最古削除）    | 上限ちょうど（1000件）境界 |
| TC-ST-009c | 0件状態でのエントリ削除（エラーなし）     | 下限（0件）境界            |
| TC-ST-010a | ツール名フィルタ 0件ヒット                | ゼロヒット境界             |
| TC-ST-010b | `revoked` フィルタで `revokedAt` 存在確認 | フィールド存在境界         |
| TC-ST-010c | ツール名 + 判断結果の AND 複合フィルタ    | 複合条件（AND）境界        |
| TC-ST-010d | 期間フィルタの等号（`>=` と `<=`）処理    | 時刻境界の等号             |

---

## 実装上の注意事項

### テスト間の状態リセット（P9 準拠）

PermissionHistoryStore はモジュールスコープで状態を保持する可能性があるため、各テストケースの `beforeEach` でストアをリセットすること。

```typescript
// 各テストの beforeEach での状態リセット例（概念コード）
beforeEach(() => {
  store.clearHistory(); // PermissionHistoryStore をリセット
});
```

### 上限制御のデータ構造

TC-ST-009b で最古エントリの削除が正しく機能することを確認するために、エントリには一意識別子（`id` または `allowedAt` タイムスタンプ）を付与し、削除後に期待するエントリが残っていることをアサートする。

### 期間フィルタの等号（TC-ST-010d）

フィルタ条件の `>=` と `<=` の等号処理は、JavaScript の浮動小数点精度問題が影響しない整数 Unix timestamp ms を使用して検証すること。`Date.now()` ではなく固定値を使用してテストの再現性を確保する。
