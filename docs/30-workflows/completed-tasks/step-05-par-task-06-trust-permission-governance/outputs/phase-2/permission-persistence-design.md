# Phase 2 成果物: 承認永続化・失効・取り消し設計書（Lane-B: 永続化担当）

## 1. メタ情報

| 項目           | 値                                                                                |
| -------------- | --------------------------------------------------------------------------------- |
| タスク ID      | TASK-SKILL-LIFECYCLE-06                                                           |
| Phase          | 2: 設計                                                                           |
| Lane           | Lane-B: 永続化                                                                    |
| 担当サブタスク | ST-4（AllowedToolEntryV2 拡張・失効ポリシー定義）、ST-5（取り消し UI フロー設計） |
| 依存成果物     | Phase 1: OUT-2（権限状態フロー定義書）、OUT-3（承認履歴・取り消し方針定義書）     |
| ブロック対象   | Phase 3（設計レビュー）、Phase 4（テスト作成）                                    |
| 作成日         | 2026-03-16                                                                        |
| 対応 AC        | AC-2（承認履歴と取り消し方針）                                                    |
| 仕様書分類     | 設計仕様書（実装なし）                                                            |

---

## 2. AllowedToolEntry 拡張型定義

### 2.1 既存型（変更なし）

```typescript
interface AllowedToolEntry {
  toolName: string;
  allowedAt: number; // Unix timestamp (ms)
}
```

### 2.2 拡張型（後方互換維持）

```typescript
interface AllowedToolEntryV2 extends AllowedToolEntry {
  expiresAt?: number; // Unix timestamp (ms)。undefined = 無期限
  skillName?: string; // スキル名。undefined = 全スキルに適用
  expiryPolicy?: "session" | "time_24h" | "time_7d" | "permanent";
}
```

### 2.3 フィールド仕様

| フィールド     | 型                                                    | 必須/任意 | デフォルト値                    | 説明                                                                            |
| -------------- | ----------------------------------------------------- | --------- | ------------------------------- | ------------------------------------------------------------------------------- |
| `toolName`     | `string`                                              | 必須      | -                               | ALLOWED_TOOLS_WHITELIST の11ツールのいずれかに一致する値                        |
| `allowedAt`    | `number`                                              | 必須      | -                               | 許可が付与された時刻（Unix timestamp、ミリ秒精度）                              |
| `expiresAt`    | `number \| undefined`                                 | 任意      | `undefined`（無期限）           | 許可が失効する時刻。`undefined` の場合は明示的取り消しまで有効                  |
| `skillName`    | `string \| undefined`                                 | 任意      | `undefined`（全スキルに適用）   | 許可のスコープとなるスキル名。`undefined` の場合はスキルを問わず許可            |
| `expiryPolicy` | `"session" \| "time_24h" \| "time_7d" \| "permanent"` | 任意      | `undefined`（`permanent` 扱い） | 失効ポリシーの種別。V1 エントリは `expiryPolicy` が存在しないため永続扱いとなる |

---

## 3. 失効ポリシー4種の定義

| ポリシー名  | 値             | `expiresAt` の算出方法                | 失効タイミング                           | 適用条件                                        | electron-store 書き込み |
| ----------- | -------------- | ------------------------------------- | ---------------------------------------- | ----------------------------------------------- | ----------------------- |
| `session`   | `approve_once` | 算出しない（in-memory のみ）          | アプリ終了時（プロセス終了でメモリ消失） | PermissionDialog で「今回のみ許可」を選択した時 | しない                  |
| `time_24h`  | `approve_temp` | `allowedAt + 86_400_000`（24時間）    | `allowedAt` から 86,400,000ms 経過後     | 設定画面で「24時間有効」を選択した時            | する                    |
| `time_7d`   | `approve_week` | `allowedAt + 604_800_000`（7日間）    | `allowedAt` から 604,800,000ms 経過後    | 設定画面で「1週間有効」を選択した時             | する                    |
| `permanent` | `approve_all`  | `undefined`（expiresAt を設定しない） | 明示的に取り消すまで有効                 | PermissionDialog で「常に許可」を選択した時     | する                    |

### 3.1 ポリシー適用時の `expiresAt` 算出ロジック

```typescript
function computeExpiresAt(
  policy: AllowedToolEntryV2["expiryPolicy"],
  allowedAt: number,
): number | undefined {
  switch (policy) {
    case "session":
      return undefined; // electron-store に書き込まないため不要
    case "time_24h":
      return allowedAt + 86_400_000;
    case "time_7d":
      return allowedAt + 604_800_000;
    case "permanent":
      return undefined; // 無期限
    default:
      return undefined; // V1 エントリとの後方互換
  }
}
```

### 3.2 ポリシーとリスクレベルの組み合わせ制約

| リスクレベル | `session` | `time_24h` | `time_7d` | `permanent` |
| ------------ | --------- | ---------- | --------- | ----------- |
| Critical     | 不可      | 不可       | 不可      | 不可        |
| High         | 可        | 可         | 不可      | 不可        |
| Medium       | 可        | 可         | 可        | 可          |
| Low          | 可        | 可         | 可        | 可          |

- Critical リスクのツールは全ポリシーで恒久許可が禁止される（Phase 1 OUT-2 セクション10 準拠）
- High リスクのツールは `time_7d` と `permanent` が禁止される（最大24時間の有期許可のみ）

---

## 4. PermissionStore 失効チェックフロー

### 4.1 擬似コード

```
isToolAllowed(toolName: string, skillName?: string): boolean

  1. electron-store から toolName をキーとして AllowedToolEntryV2 を取得する
  2. entry が存在しない場合:
     → false を返す
  3. entry.expiresAt が undefined の場合:
     → ステップ 5 に進む（無期限）
  4. entry.expiresAt < Date.now() の場合:
     → electron-store から entry を削除する
     → permissionHistorySlice に { decision: "denied", triggerContext: "auto" } を記録する
     → false を返す
  5. entry.skillName が定義されている AND skillName が定義されている AND entry.skillName !== skillName の場合:
     → false を返す
  6. 上記いずれにも該当しない場合:
     → true を返す
```

### 4.2 失効チェックの実行タイミング

| タイミング                    | 呼び出し元    | 説明                                                   |
| ----------------------------- | ------------- | ------------------------------------------------------ |
| preflight チェック            | SkillExecutor | スキル実行前に全ツールの許可状態を一括チェックする     |
| 実行時チェック                | SkillExecutor | ツール呼び出し直前に個別チェックする                   |
| Permission History Panel 表示 | Renderer      | 履歴パネル表示時に失効済みエントリをフィルタリングする |

### 4.3 失効チェックの計算量

| 操作                      | 計算量 | 説明                                                     |
| ------------------------- | ------ | -------------------------------------------------------- |
| `isToolAllowed(tool)`     | O(1)   | electron-store のキーベース検索                          |
| `isToolAllowed(tool, sk)` | O(1)   | 上記 + skillName 比較（定数時間）                        |
| 失効エントリ削除          | O(1)   | electron-store のキーベース削除                          |
| 全エントリの失効スキャン  | O(n)   | n = 許可済みツール数。起動時の一括スキャンでのみ実行する |

### 4.4 起動時一括失効スキャン

アプリ起動時に以下の手順で失効済みエントリを一括削除する。

```
onAppReady():
  1. electron-store から全 AllowedToolEntryV2 を取得する
  2. 各 entry について:
     entry.expiresAt が定義されている AND entry.expiresAt < Date.now() の場合:
       → electron-store から entry を削除する
       → 削除カウンターをインクリメントする
  3. 削除件数が 1 以上の場合、ログに「{N} 件の失効済み権限を削除しました」を記録する
```

---

## 5. 取り消し UI フロー設計（Permission History Panel 拡張）

### 5.1 ワイヤーフレーム（テキスト表現）

```
+-- Permission History Panel（既存） -----------------------------------------+
| フィルタ: [ツール名 v] [判断結果 v] [期間 v] [リスクレベル v]               |
+-----------------------------------------------------------------------------+
| Bash  chmod 777 /tmp/x  [approved]  High  2026-03-16 14:23                  |
|                         有効期限: 2026-03-17 14:23（残り23時間）             |
|                                                        [取り消す x]         |
|                                                                             |
| Read  ~/.env             [approved]  Medium  2026-03-16 13:45               |
|                         有効期限: 無期限                                     |
|                                                        [取り消す x]         |
|                                                                             |
| Bash  curl example.com   [revoked]  High  2026-03-16 12:00                  |
|                         取り消し日時: 2026-03-16 15:30                       |
|                                                        [取り消し済み]       |
|                                                                             |
| Write  /tmp/out.txt      [denied]  Medium  2026-03-16 11:30                 |
|                                                                             |
| ...                                                                         |
|                                                   [全て取り消す]            |
+-----------------------------------------------------------------------------+
```

### 5.2 取り消しボタンの表示条件

| エントリの `decision` 状態 | 「取り消す x」ボタン | 表示テキスト     | 理由                                                       |
| -------------------------- | -------------------- | ---------------- | ---------------------------------------------------------- |
| `approved`                 | 表示する（活性）     | 「取り消す x」   | 恒久許可の明示的撤回が可能                                 |
| `denied`                   | 表示しない           | -                | 拒否状態の取り消しは再許可操作で行う（Phase 1 OUT-3 準拠） |
| `approved_once`            | 表示しない           | -                | セッション終了で自動失効するため手動取り消し不要           |
| `revoked`                  | 表示する（非活性）   | 「取り消し済み」 | 既に取り消し済みであることを視覚的に表示                   |

### 5.3 取り消しボタンクリック時のフロー（3ステップ）

```
ステップ 1: IPC 呼び出し
  Renderer → Main Process
  チャンネル: permission:revokeTool
  引数: { toolName: string }（P42準拠3段バリデーション適用）

ステップ 2: 履歴エントリ更新
  Main Process:
    PermissionStore.revokeTool(toolName) を実行する
    permissionHistorySlice の該当エントリに revokedAt フィールドを追加する:
      revokedAt: Date.now() // Unix timestamp (ms)
    新規履歴エントリを追加する:
      { decision: "denied", triggerContext: "manual", toolName, timestamp: Date.now() }

ステップ 3: UI 更新
  Renderer:
    該当エントリのバッジを approved（緑） → revoked（灰色）に変更する
    「取り消す x」ボタンを「取り消し済み」（非活性）に変更する
```

### 5.4 PermissionDecisionExtended 型定義

```typescript
// 既存型（変更なし）
type PermissionDecision = "approved" | "denied" | "approved_once";

// 拡張型（UI 表示専用。PermissionStore の内部状態には使用しない）
type PermissionDecisionExtended = PermissionDecision | "revoked";
```

### 5.5 取り消しバッジの色定義

| `decision` 値   | バッジ背景色トークン           | バッジテキスト色トークン | 表示テキスト |
| --------------- | ------------------------------ | ------------------------ | ------------ |
| `approved`      | `--status-success`（緑系）     | `--text-inverse`         | approved     |
| `denied`        | `--status-destructive`（赤系） | `--text-inverse`         | denied       |
| `approved_once` | `--status-caution`（黄系）     | `--text-primary`         | once         |
| `revoked`       | `--bg-tertiary`（灰系）        | `--text-secondary`       | revoked      |

---

## 6. 後方互換性設計

### 6.1 V1 → V2 マイグレーション

V1 フォーマット（`expiresAt`、`skillName`、`expiryPolicy` が存在しない）のエントリを V2 として読み込む際の変換ルールを定義する。

| V1 フィールド  | V2 フィールド  | 変換ルール                                           |
| -------------- | -------------- | ---------------------------------------------------- |
| `toolName`     | `toolName`     | そのまま引き継ぐ                                     |
| `allowedAt`    | `allowedAt`    | そのまま引き継ぐ                                     |
| （存在しない） | `expiresAt`    | `undefined` を補完する（無期限として扱う）           |
| （存在しない） | `skillName`    | `undefined` を補完する（全スキルに適用として扱う）   |
| （存在しない） | `expiryPolicy` | `undefined` を補完する（`permanent` 相当として扱う） |

### 6.2 マイグレーション判定条件（テスト可能な条件式）

```
マイグレーション判定:
  entry を electron-store から読み込んだ時:
    typeof entry.toolName === "string" AND typeof entry.allowedAt === "number" の場合:
      → 有効な AllowedToolEntry（V1 または V2）として受け入れる
    entry に expiresAt プロパティが存在しない場合:
      → entry.expiresAt = undefined を補完する
    entry に skillName プロパティが存在しない場合:
      → entry.skillName = undefined を補完する
    entry に expiryPolicy プロパティが存在しない場合:
      → entry.expiryPolicy = undefined を補完する
```

### 6.3 PermissionStoreSchema バージョン管理

```typescript
interface PermissionStoreSchema {
  version: number; // 1 → 2 に更新
  allowedTools: AllowedToolEntryV2[];
}
```

| バージョン | スキーマ変更内容                                                            |
| ---------- | --------------------------------------------------------------------------- |
| 1          | `AllowedToolEntry[]`（`toolName` + `allowedAt` のみ）                       |
| 2          | `AllowedToolEntryV2[]`（`expiresAt` + `skillName` + `expiryPolicy` を追加） |

### 6.4 マイグレーション実行手順

```
onAppReady() 内で実行:
  1. electron-store から version を読み取る
  2. version === 1 の場合:
     a. 全 AllowedToolEntry を読み込む
     b. 各エントリに undefined フィールドを補完する（セクション 6.2 の変換ルール）
     c. 変換後のエントリを AllowedToolEntryV2[] として書き戻す
     d. version を 2 に更新する
     e. ログに「PermissionStore スキーマを v1 → v2 にマイグレーションしました（{N} 件）」を記録する
  3. version === 2 の場合:
     → マイグレーション不要。起動時失効スキャン（セクション 4.4）に進む
```

### 6.5 ダウングレード時の安全性

V2 フィールド（`expiresAt`、`skillName`、`expiryPolicy`）は全て optional であるため、V1 互換のコードが V2 データを読み込んだ場合:

- `expiresAt` は無視される → 無期限許可として動作する（安全側に倒れる）
- `skillName` は無視される → 全スキルに適用される（安全側に倒れる）
- `expiryPolicy` は無視される → 動作に影響しない
- `toolName` と `allowedAt` はそのまま参照可能 → V1 互換の動作が維持される

---

## 7. セッション管理との連携

### 7.1 session ポリシーのエントリ管理

`session` ポリシー（`approve_once`）のエントリは electron-store に書き込まない。in-memory の `Map<string, Set<string>>` で管理する。

```typescript
// Main Process 内のセッションメモリ
const sessionPermissions: Map<string, Set<string>> = new Map();
// key: sessionId
// value: Set<toolName>（そのセッション中に approve_once されたツール名の集合）
```

### 7.2 SessionManager.destroySession() 時の処理

```
destroySession(sessionId: string):
  1. sessionPermissions.get(sessionId) で該当セッションのツール集合を取得する
  2. 集合が存在する場合:
     a. 集合内の全ツール名をログに記録する（「セッション {sessionId} の一時許可 {N} 件を削除しました」）
     b. sessionPermissions.delete(sessionId) で一括削除する
  3. 集合が存在しない場合:
     → 何もしない（ログ記録のみ: 「セッション {sessionId} に一時許可は存在しませんでした」）
```

### 7.3 session エントリと electron-store エントリの分離

| 操作                       | session エントリ（in-memory）                             | electron-store エントリ                    |
| -------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| `approve_once` 選択時      | `sessionPermissions` に追加                               | 書き込まない                               |
| `isToolAllowed` チェック時 | `sessionPermissions` を先にチェック → ヒットすれば `true` | ヒットしなければ electron-store をチェック |
| アプリ終了時               | メモリ消失（自動クリーンアップ）                          | 永続化済みデータは維持される               |
| `clearAll()` 実行時        | 影響なし（in-memory は独立）                              | 全エントリ削除                             |

### 7.4 isToolAllowed の統合チェック順序

```
isToolAllowed(toolName: string, skillName?: string, sessionId?: string): boolean

  1. sessionId が定義されている場合:
     sessionPermissions.get(sessionId)?.has(toolName) === true なら true を返す
  2. electron-store のチェック（セクション 4.1 のフロー）を実行する
  3. 両方とも false の場合、false を返す
```

---

## 8. 既存 PermissionStore（86テスト、Line 96%+）との差分

### 8.1 変更対象メソッド

| メソッド名            | 既存の挙動                                  | V2 での変更内容                                                                    |
| --------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `allowTool(tool)`     | `AllowedToolEntry` を electron-store に追加 | `AllowedToolEntryV2` を追加。`expiresAt` と `expiryPolicy` を引数で受け取る        |
| `isToolAllowed(tool)` | electron-store に toolName が存在するか判定 | 存在チェックに加えて `expiresAt` の失効判定と `skillName` のスコープ判定を追加する |
| `revokeTool(tool)`    | electron-store から toolName を削除         | 変更なし（既存ロジックのまま）                                                     |
| `clearAll()`          | 全エントリを削除して件数を返す              | 変更なし（既存ロジックのまま）                                                     |

### 8.2 新規追加メソッド

| メソッド名                  | 引数               | 戻り値                            | 説明                                         |
| --------------------------- | ------------------ | --------------------------------- | -------------------------------------------- |
| `purgeExpired()`            | なし               | `number`                          | 失効済みエントリを一括削除し、削除件数を返す |
| `getEntryDetails(toolName)` | `toolName: string` | `AllowedToolEntryV2 \| undefined` | 指定ツールのエントリ詳細を返す               |
| `getAllEntriesWithExpiry()` | なし               | `AllowedToolEntryV2[]`            | 全エントリを失効情報付きで返す               |

### 8.3 既存テストへの影響

| 影響範囲                   | 既存テスト数 | 修正必要性                                                                                |
| -------------------------- | ------------ | ----------------------------------------------------------------------------------------- |
| `allowTool` テスト         | 12件         | 引数拡張に伴いモックの更新が必要（optional 引数のため既存テストはそのまま通過する見込み） |
| `isToolAllowed` テスト     | 18件         | 失効判定の追加テストが必要。既存テストは `expiresAt === undefined` のケースとして通過する |
| `revokeTool` テスト        | 8件          | 変更不要                                                                                  |
| `clearAll` テスト          | 6件          | 変更不要                                                                                  |
| その他（バリデーション等） | 42件         | 変更不要                                                                                  |

---

## 9. 検証可能性（テスト可能な条件式）

### 9.1 失効ポリシーの検証

| テストケース ID | 条件                                                                        | 期待結果                                      |
| --------------- | --------------------------------------------------------------------------- | --------------------------------------------- |
| EXP-01          | `expiryPolicy === "time_24h"` のエントリ、`allowedAt + 86_400_001ms` 経過後 | `isToolAllowed` が `false` を返す             |
| EXP-02          | `expiryPolicy === "time_24h"` のエントリ、`allowedAt + 86_399_999ms` 経過時 | `isToolAllowed` が `true` を返す              |
| EXP-03          | `expiryPolicy === "time_7d"` のエントリ、`allowedAt + 604_800_001ms` 経過後 | `isToolAllowed` が `false` を返す             |
| EXP-04          | `expiryPolicy === "permanent"` のエントリ、任意の時間経過後                 | `isToolAllowed` が `true` を返す              |
| EXP-05          | `expiryPolicy === "session"` のエントリ、セッション継続中                   | `isToolAllowed` が `true` を返す（in-memory） |
| EXP-06          | `expiryPolicy === "session"` のエントリ、`destroySession` 後                | `isToolAllowed` が `false` を返す             |

### 9.2 skillName スコープの検証

| テストケース ID | 条件                                                                  | 期待結果                        |
| --------------- | --------------------------------------------------------------------- | ------------------------------- |
| SKN-01          | `entry.skillName === "skill-a"` かつ `isToolAllowed(tool, "skill-a")` | `true` を返す                   |
| SKN-02          | `entry.skillName === "skill-a"` かつ `isToolAllowed(tool, "skill-b")` | `false` を返す                  |
| SKN-03          | `entry.skillName === undefined` かつ `isToolAllowed(tool, "skill-a")` | `true` を返す（全スキルに適用） |
| SKN-04          | `entry.skillName === undefined` かつ `isToolAllowed(tool)`            | `true` を返す                   |

### 9.3 後方互換性の検証

| テストケース ID | 条件                                                  | 期待結果                                      |
| --------------- | ----------------------------------------------------- | --------------------------------------------- |
| MIG-01          | V1 エントリ（`expiresAt` 未定義）を V2 として読み込む | `isToolAllowed` が `true` を返す（無期限）    |
| MIG-02          | V1 エントリに `expiryPolicy` が存在しない             | `undefined` が補完される                      |
| MIG-03          | `version === 1` の状態でアプリ起動                    | マイグレーション実行後 `version === 2` になる |
| MIG-04          | V2 データを V1 互換コードで読み込む                   | `toolName` と `allowedAt` が正常に参照可能    |

### 9.4 取り消しフローの検証

| テストケース ID | 条件                                            | 期待結果                                        |
| --------------- | ----------------------------------------------- | ----------------------------------------------- |
| REV-01          | `approved` エントリの「取り消す x」をクリック   | `PermissionStore.revokeTool` が呼び出される     |
| REV-02          | 取り消し後のバッジ表示                          | `revoked`（灰色）に変化する                     |
| REV-03          | 取り消し後の `isToolAllowed`                    | `false` を返す                                  |
| REV-04          | `denied` エントリに「取り消す x」ボタン         | ボタンが表示されない                            |
| REV-05          | 取り消し後に `revokedAt` フィールドが追加される | `typeof entry.revokedAt === "number"` が `true` |

### 9.5 境界値テスト

| テストケース ID | 条件                                                    | 期待結果                             |
| --------------- | ------------------------------------------------------- | ------------------------------------ |
| BND-01          | `expiresAt === Date.now()`（ちょうど失効時刻）          | `false` を返す（失効済みとして扱う） |
| BND-02          | `expiresAt === Date.now() + 1`（失効1ms前）             | `true` を返す                        |
| BND-03          | `purgeExpired()` 実行時に失効エントリが0件              | 戻り値 `0`、エラーなし               |
| BND-04          | `allowedAt === 0`（エポック起点）で `time_24h` ポリシー | `expiresAt === 86_400_000`           |
