# abort / skip / retry フロー契約正書

<!-- Task-06 Phase 5 成果物: abort/skip/retry フローの4ステップ契約 -->

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| 作成フェーズ | Phase 5（実装仕様）                                       |
| 依存成果物   | Phase 2 設計書, Phase 4 テスト設計書                      |
| 参照テストID | TC-FL-001（abort）, TC-FL-002（skip）, TC-FL-003（retry） |
| 検証方法     | scripts/validate-trust-governance-design.ts の項目 4      |

---

## フロー 1: abort フロー

### 概要

権限ダイアログで拒否した場合、またはタイムアウト・最大リトライ超過時に実行される。
スキル実行セッションを完全に停止し、セッション中の一時許可エントリを全て削除する。

### 4ステップ疑似コード

```typescript
async function onAbort(sessionId: string): Promise<void> {
  // Step 1: 全待機中リクエストをキャンセル
  // permissionResolver が保持している pending な Promise を全て reject する。
  // reject 理由は new Error("PermissionAborted") を使用する。
  await permissionResolver.cancelAll();

  // Step 2: セッション中の approve_once エントリを削除
  // expiryPolicy === "session" のエントリを electron-store から全て削除する。
  // approved（恒久許可）エントリは削除しない。
  permissionStore.revokeSessionEntries(sessionId);

  // Step 3: 実行ログに abort イベントを記録
  // timestamp は Date.now() を使用する（モック可能にするため注入可能にする）。
  executionLog.record({
    event: "aborted",
    reason: "permission_denied",
    timestamp: Date.now(),
  });

  // Step 4: Renderer に IPC イベントを送信
  // Renderer 側は skill:execution:aborted を受信して実行中 UI を停止する。
  // mainWindow が null の場合は Step 4 をスキップし、ログに記録する。
  mainWindow.webContents.send("skill:execution:aborted", { sessionId });
}
```

### 契約条件

| 条件種別 | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 事前条件 | sessionId は非空文字列であること                                       |
| 事後条件 | permissionResolver に pending なリクエストが0件になること              |
| 事後条件 | permissionStore に expiryPolicy:"session" のエントリが0件になること    |
| 事後条件 | executionLog に event:"aborted" のレコードが1件追記されること          |
| 事後条件 | Renderer が "skill:execution:aborted" イベントを受信すること           |
| 例外条件 | mainWindow が null の場合: Step 4 をスキップし、Steps 1-3 は実行する   |
| 冪等性   | 同一 sessionId で2回呼び出しても Step 2-4 は副作用なし（エントリなし） |

---

## フロー 2: skip フロー

### 概要

権限ダイアログで「スキップ」を選択した場合に実行される。
当該ツール呼び出しをスキップし、スキル実行の後続処理を続行する。

### SkillExecutor への返却形式

```typescript
// SkillExecutor が受け取る権限決定オブジェクト
const decision: PermissionDecision = {
  approved: false, // 承認しない
  skip: true, // スキップ（abort ではなく後続を続行）
};
```

### 動作仕様

- **当該ツール呼び出し**: 実行しない（Claude SDK の tool_call に対して空結果を返す）
- **後続処理**: 続行する（abort フローとの違い：セッションは終了しない）
- **承認履歴記録**: `decision: "denied"` を1件追記する（skip 専用フィールドは設けない）
- **Renderer への通知**: `skill:tool:skipped` イベントを送信する（UI で「スキップ済み」バッジを表示）

### 契約条件

| 条件種別 | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| 事前条件 | PermissionDialog が表示されており、ユーザーがスキップを選択 |
| 事後条件 | 承認履歴テーブルに decision:"denied" が1件追記される        |
| 事後条件 | スキル実行セッションは継続している                          |
| 事後条件 | Renderer が "skill:tool:skipped" イベントを受信する         |

---

## フロー 3: retry フロー

### 概要

権限ダイアログで選択をキャンセル（ESCキー・ダイアログ外クリック）した場合に実行される。
最大 `MAX_PERMISSION_RETRY_COUNT` 回まで PermissionDialog を再表示する。

### 定数

```typescript
/**
 * 権限ダイアログの最大再表示回数。
 * 変更禁止定数: 変更する場合は TC-FL-003 のテスト期待値も更新すること。
 */
export const MAX_PERMISSION_RETRY_COUNT = 3;
```

### リトライフロー詳細

```
1回目キャンセル → PermissionDialog を再表示（2回目）
2回目キャンセル → PermissionDialog を再表示（3回目）
3回目キャンセル → abort フロー（フロー 1）に自動移行
```

| 試行回数 | 動作                                       |
| -------- | ------------------------------------------ |
| 1回目    | PermissionDialog を再表示する              |
| 2回目    | PermissionDialog を再表示する              |
| 3回目    | abort フロー（フロー 1）を実行して終了する |

### 承認履歴への記録ルール

- **記録件数**: 初回の `decision: "denied"` のみ1件追記する
- **重複記録禁止**: 2回目・3回目のキャンセルは追記しない（同一イベントの重複記録を防ぐ）
- **abort 移行時**: abort フローの Step 3 で `event: "aborted"` が追記される（separate）

### 契約条件

| 条件種別 | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| 事前条件 | retryCount が 0 以上 MAX_PERMISSION_RETRY_COUNT 以下であること     |
| 事後条件 | retryCount < MAX_PERMISSION_RETRY_COUNT: PermissionDialog を再表示 |
| 事後条件 | retryCount === MAX_PERMISSION_RETRY_COUNT: abort フローを実行      |
| 事後条件 | 承認履歴テーブルへの追記は retryCount=0 の初回のみ                 |

---

## タイムアウト仕様

### 定数

```typescript
/**
 * PermissionDialog のタイムアウト時間（ミリ秒）。
 * 変更禁止定数: セキュリティ要件（ユーザーが離席した場合の自動拒否）として定義。
 * 変更する場合は Phase 3 設計レビューを再実施すること。
 */
export const DEFAULT_PERMISSION_TIMEOUT_MS = 300_000; // 5分（= 60 * 5 * 1000）
```

### タイムアウト後の動作

1. PermissionDialog を閉じる（ユーザーへの追加操作なし）
2. **abort フロー（フロー 1）を自動実行する**（retry フローには移行しない）
3. 実行ログに `reason: "timeout"` を記録する（abort フロー Step 3 の reason を上書き）

### タイムアウトカウンター

- PermissionDialog の表示開始時点からカウント開始
- retry でダイアログを再表示した場合: カウンターをリセットする（再表示ごとに5分）
- abort 後にカウンターを停止する

---

## フロー間の優先順位

```
abort > skip > retry
```

- abort が発生した場合は skip / retry の処理を中断する
- skip は abort に昇格しない（ユーザーが意図的に選択した場合）
- retry は abort に昇格する（MAX_PERMISSION_RETRY_COUNT 超過時のみ）
