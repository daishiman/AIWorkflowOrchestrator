# Phase 2 成果物: 拒否時 fallback/retry/abort フロー・クリーンアップ契約設計書（Lane-B: 永続化担当）

## 1. メタ情報

| 項目           | 値                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------- |
| タスク ID      | TASK-SKILL-LIFECYCLE-06                                                                   |
| Phase          | 2: 設計                                                                                   |
| Lane           | Lane-B: 永続化                                                                            |
| 担当サブタスク | ST-7（拒否時 fallback/retry/abort フロー設計）                                            |
| 依存成果物     | Phase 1: OUT-2（権限状態フロー定義書）、Phase 2: permission-persistence-design.md（ST-4） |
| ブロック対象   | Phase 3（設計レビュー）、Phase 4（テスト作成）                                            |
| 作成日         | 2026-03-16                                                                                |
| 対応 AC        | AC-2（承認履歴と取り消し方針）                                                            |
| 仕様書分類     | 設計仕様書（実装なし）                                                                    |

---

## 2. 状態遷移図（テキスト表現）

```
[PermissionDialog 表示]
    |
    +-- [許可] --> SkillExecutor 処理続行
    |
    +-- [拒否] --> [拒否後オプション画面]
    |                   |
    |                   +-- [スキルを中断する]           --> abort フロー (1)
    |                   |
    |                   +-- [この操作をスキップして続行] --> skip フロー (2)
    |                   |
    |                   +-- [別の方法で実行する]         --> retry フロー (3)
    |
    +-- [タイムアウト（300秒）] --> abort フロー (1)（自動）
```

### 2.1 遷移条件の網羅性

| 入力                         | 出力フロー     | 条件                                                 |
| ---------------------------- | -------------- | ---------------------------------------------------- |
| ユーザーが「許可」を選択     | 処理続行       | `respondToSkillPermission(true, rememberChoice)`     |
| ユーザーが「拒否」を選択     | オプション画面 | `respondToSkillPermission(false, false)`             |
| 300,000ms 経過               | abort (1)      | `DEFAULT_TIMEOUT_MS` 超過                            |
| AbortSignal が abort         | abort (1)      | `signal.aborted === true`                            |
| オプション画面で「中断」     | abort (1)      | ユーザー選択                                         |
| オプション画面で「スキップ」 | skip (2)       | `requiredTools` に含まれないツールの場合のみ選択可能 |
| オプション画面で「再試行」   | retry (3)      | リトライ回数が3回未満の場合のみ選択可能              |

---

## 3. 3フロー詳細定義

### 3.1 フロー定義表

| フロー ID | フロー名 | SkillExecutor への指示                                            | UI 表示                                            | permissionHistorySlice 記録               |
| --------- | -------- | ----------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------- |
| (1)       | abort    | `PermissionResolver.cancelAll()` を呼び出し、実行中止エラーを返す | 「スキルを中断しました」トーストを表示（5秒間）    | `decision: "denied"` を記録               |
| (2)       | skip     | `{ approved: false, skip: true }` を SkillExecutor に返す         | 「この操作をスキップしました」インラインメッセージ | `decision: "denied"` を記録               |
| (3)       | retry    | PermissionDialog を再表示する（最大3回まで）                      | 「再度確認してください」バナーを表示               | `decision: "denied"` を初回拒否時のみ記録 |

### 3.2 各フローの SkillPermissionResponse 型対応

```typescript
// 既存型（変更なし）
interface SkillPermissionResponse {
  requestId: string;
  allow: boolean;
  rememberChoice: boolean;
}

// 拡張型（skip フロー対応）
interface SkillPermissionResponseExtended extends SkillPermissionResponse {
  skip?: boolean; // true = 該当ツール呼び出しをスキップして次のステップに進む
}
```

---

## 4. abort 時クリーンアップ契約（4ステップ）

### 4.1 擬似コード

```typescript
async function onAbort(sessionId: string): Promise<void> {
  // ステップ 1: PermissionResolver.cancelAll() で全待機中リクエストをキャンセルする
  //   - 全 pending リクエストの Promise を reject する
  //   - reject 理由: "CANCELLED_ALL"
  //   - 実行後: PermissionResolver.pendingCount === 0
  const cancelledCount = permissionResolver.cancelAll();

  // ステップ 2: セッション中の一時的な approve_once エントリを PermissionStore から削除する
  //   - sessionPermissions.get(sessionId) で該当セッションのツール集合を取得する
  //   - sessionPermissions.delete(sessionId) で一括削除する
  //   - electron-store のエントリは影響を受けない（approve_once は in-memory のみ）
  const sessionEntries = sessionPermissions.get(sessionId);
  const deletedOnceCount = sessionEntries?.size ?? 0;
  sessionPermissions.delete(sessionId);

  // ステップ 3: 実行ログに abort イベントを記録する
  //   - タイムスタンプ: Date.now()
  //   - 理由: "user_abort" | "timeout" | "signal_abort"
  //   - キャンセルしたリクエスト数: cancelledCount
  //   - 削除した approve_once 数: deletedOnceCount
  executionLog.append({
    event: "skill:execution:aborted",
    sessionId,
    timestamp: Date.now(),
    cancelledPermissionRequests: cancelledCount,
    deletedSessionPermissions: deletedOnceCount,
  });

  // ステップ 4: Renderer に skill:execution:aborted IPC イベントを送信する
  //   - Renderer はこのイベントを受けてトースト通知を表示する
  //   - トーストメッセージ: 「スキルを中断しました」
  //   - トースト表示時間: 5000ms
  mainWindow.webContents.send("skill:execution:aborted", {
    sessionId,
    reason: abortReason,
    timestamp: Date.now(),
  });
}
```

### 4.2 各ステップの事前条件・事後条件

| ステップ | 事前条件                                | 事後条件                                                     | 失敗時の挙動                                   |
| -------- | --------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| 1        | `permissionResolver.pendingCount >= 0`  | `permissionResolver.pendingCount === 0`                      | ログにエラーを記録し、ステップ2に進む          |
| 2        | `sessionId` が有効な文字列              | `sessionPermissions.has(sessionId) === false`                | ログにエラーを記録し、ステップ3に進む          |
| 3        | 実行ログが書き込み可能な状態            | abort イベントがログに記録されている                         | stderr にエラーを出力し、ステップ4に進む       |
| 4        | `mainWindow` が有効（destroyed でない） | Renderer が `skill:execution:aborted` イベントを受信している | ログにエラーを記録し、クリーンアップを完了する |

### 4.3 クリーンアップの原則

- 4ステップは順序依存である（ステップ1で全 pending をキャンセルしてからステップ2でセッションを削除する）
- いずれかのステップが失敗しても、後続ステップは継続する（フェイルセキュア原則）
- 全ステップ完了後に `onAbort` の Promise を resolve する
- `onAbort` 自体が例外を throw することはない（内部で全例外を catch してログに記録する）

---

## 5. retry フローの制約

### 5.1 リトライパラメータ

| パラメータ                 | 値                          | 変更可否 | 説明                                                       |
| -------------------------- | --------------------------- | -------- | ---------------------------------------------------------- |
| 最大リトライ回数           | 3                           | 不可     | 同一ツール x 同一セッション内での最大再表示回数            |
| リトライ間のクールダウン   | 0ms                         | -        | クールダウンなし。拒否後オプション画面から即座に再表示する |
| リトライカウンタースコープ | 同一ツール x 同一セッション | -        | セッションが異なれば独立にカウントする                     |

### 5.2 リトライカウンター管理

```typescript
// Main Process 内のリトライカウンター
const retryCounters: Map<string, number> = new Map();
// key: `${sessionId}:${toolName}`
// value: 現在のリトライ回数（0-indexed）

function getRetryKey(sessionId: string, toolName: string): string {
  return `${sessionId}:${toolName}`;
}

function canRetry(sessionId: string, toolName: string): boolean {
  const key = getRetryKey(sessionId, toolName);
  const count = retryCounters.get(key) ?? 0;
  return count < 3;
}

function incrementRetry(sessionId: string, toolName: string): void {
  const key = getRetryKey(sessionId, toolName);
  const count = retryCounters.get(key) ?? 0;
  retryCounters.set(key, count + 1);
}
```

### 5.3 リトライフロー詳細

```
retry フロー (3):

  1. incrementRetry(sessionId, toolName) でカウンターをインクリメントする
  2. canRetry(sessionId, toolName) で再試行可能性を判定する
  3. canRetry === true の場合:
     a. PermissionDialog を再表示する
     b. ダイアログのヘッダーに「再確認（{retryCount}/3）」を追加表示する
     c. ユーザーの応答を待機する（タイムアウト: DEFAULT_TIMEOUT_MS = 300,000ms）
     d. ユーザーが許可した場合: 処理続行
     e. ユーザーが拒否した場合: 拒否後オプション画面に戻る
  4. canRetry === false の場合（3回目の拒否後）:
     a. 拒否後オプション画面の「別の方法で実行する」ボタンを非活性にする
     b. ユーザーに「再試行回数の上限（3回）に達しました」メッセージを表示する
     c. ユーザーは abort (1) または skip (2) のいずれかを選択する
```

### 5.4 リトライカウンターのライフサイクル

| イベント                      | リトライカウンターへの影響                            |
| ----------------------------- | ----------------------------------------------------- |
| セッション作成                | カウンターは空（新規セッション）                      |
| PermissionDialog で許可       | カウンターをリセットしない（再度拒否→retry 時は累積） |
| PermissionDialog で拒否→retry | カウンターをインクリメント                            |
| セッション破棄                | 該当 sessionId のカウンターを全削除                   |
| abort                         | 該当 sessionId のカウンターを全削除                   |

### 5.5 permissionHistorySlice への記録タイミング

| リトライ回数             | 履歴記録                                                      |
| ------------------------ | ------------------------------------------------------------- |
| 初回拒否                 | `{ decision: "denied", triggerContext: "manual" }` を記録する |
| 2回目拒否                | 記録しない（初回の denied エントリが有効）                    |
| 3回目拒否                | 記録しない（初回の denied エントリが有効）                    |
| 3回目拒否後の auto-abort | `{ decision: "denied", triggerContext: "auto" }` を記録する   |

---

## 6. skip フローの制約

### 6.1 skip 可能条件

```
skip が可能な条件:
  ツール呼び出しがスキルの主要機能でない場合:
    → スキル定義の requiredTools 配列に toolName が含まれない場合

skip が不可能な条件:
  ツール呼び出しがスキルの主要機能である場合:
    → スキル定義の requiredTools 配列に toolName が含まれる場合
```

### 6.2 skip 可否判定ロジック

```typescript
function isSkipAllowed(
  skillDefinition: SkillDefinition,
  toolName: string,
): boolean {
  // requiredTools が未定義の場合、全ツールが必須と見なす（フェイルセキュア）
  if (!Array.isArray(skillDefinition.requiredTools)) {
    return false;
  }
  // requiredTools に含まれないツールのみ skip 可能
  return !skillDefinition.requiredTools.includes(toolName);
}
```

### 6.3 skip 不可能な場合の UI 表示

```
+-- 拒否後オプション画面（skip 不可の場合） --+
|                                              |
|   このツール（{toolName}）はスキルの         |
|   必須機能です。スキップはできません。        |
|                                              |
|   [スキルを中断する]                         |
|   [別の方法で実行する]  ← retry 可能な場合  |
|                                              |
+----------------------------------------------+
```

- 「この操作をスキップして続行」ボタンは非表示にする（disabled ではなく非表示）
- ユーザーの選択肢は abort (1) または retry (3) の2択になる

### 6.4 skip 後のスキル実行フロー

```
skip フロー (2) 選択後:
  1. SkillExecutor に { approved: false, skip: true } を返す
  2. SkillExecutor は該当ツール呼び出しの戻り値として以下を返す:
     {
       success: false,
       error: "PERMISSION_SKIPPED",
       message: "ユーザーが権限要求をスキップしました"
     }
  3. スキルの次のステップに進む
  4. スキル側が error === "PERMISSION_SKIPPED" を処理する:
     a. スキルが代替処理を持つ場合: 代替処理を実行する
     b. スキルが代替処理を持たない場合: スキップされたツールの結果なしで続行する
```

---

## 7. タイムアウトフロー

### 7.1 タイムアウト定数

| 定数名               | 値       | 単位 | 変更可否                                         |
| -------------------- | -------- | ---- | ------------------------------------------------ |
| `DEFAULT_TIMEOUT_MS` | `300000` | ms   | 変更禁止（Phase 2 設計方針・設計禁止事項に記載） |

### 7.2 タイムアウト発生時のフロー

```
タイムアウト発生（300,000ms 経過）:
  1. PermissionResolver.waitForResponse の Promise が reject される
     reject 理由: "TIMEOUT"
  2. abort フロー (1) に自動移行する
  3. UI にトースト通知を表示する:
     メッセージ: 「権限確認がタイムアウトしました。スキルを中断します。」
     表示時間: 5000ms
     トースト種別: warning（橙系）
  4. permissionHistorySlice に記録する:
     { decision: "denied", triggerContext: "auto" }
  5. onAbort(sessionId) を実行する（セクション 4 の4ステップクリーンアップ）
```

### 7.3 タイムアウトの計測開始点

| 状況                         | 計測開始点                                            |
| ---------------------------- | ----------------------------------------------------- |
| 初回の PermissionDialog 表示 | `PermissionResolver.waitForResponse` 呼び出し時       |
| retry フロー中の再表示       | 初回の `waitForResponse` 呼び出し時（リセットしない） |

- タイムアウトは初回の `waitForResponse` 呼び出しからの累積時間で判定する
- retry フロー中にタイムアウトに達した場合、retry を中断して abort フロー (1) に移行する

---

## 8. PermissionResolver エラーメッセージとの対応

### 8.1 エラー種別と処理フローの対応表

| エラー種別     | reject 理由       | 発生条件                                                 | 処理フロー       | permissionHistorySlice 記録                      |
| -------------- | ----------------- | -------------------------------------------------------- | ---------------- | ------------------------------------------------ |
| タイムアウト   | `"TIMEOUT"`       | `DEFAULT_TIMEOUT_MS`（300,000ms）が経過した              | abort フロー (1) | `{ decision: "denied", triggerContext: "auto" }` |
| AbortSignal    | `"ABORTED"`       | `AbortSignal.abort()` が外部から呼び出された             | abort フロー (1) | `{ decision: "denied", triggerContext: "auto" }` |
| 個別キャンセル | `"CANCELLED"`     | `PermissionResolver.cancelRequest(requestId)` が呼ばれた | abort フロー (1) | `{ decision: "denied", triggerContext: "auto" }` |
| 一括キャンセル | `"CANCELLED_ALL"` | `PermissionResolver.cancelAll()` が呼ばれた              | abort フロー (1) | `{ decision: "denied", triggerContext: "auto" }` |

### 8.2 エラー種別の判定ロジック

```typescript
function handlePermissionError(
  error: PermissionResolverError,
  sessionId: string,
): void {
  switch (error.reason) {
    case "TIMEOUT":
    case "ABORTED":
    case "CANCELLED":
    case "CANCELLED_ALL":
      // 全て abort フロー (1) に統一する
      onAbort(sessionId);
      break;
    default:
      // 未知のエラー理由はログに記録し、abort フロー (1) に移行する（フェイルセキュア）
      logger.error(`Unknown permission error reason: ${error.reason}`);
      onAbort(sessionId);
      break;
  }
}
```

### 8.3 UI 表示メッセージの対応

| reject 理由       | トーストメッセージ                                       | トースト種別 |
| ----------------- | -------------------------------------------------------- | ------------ |
| `"TIMEOUT"`       | 「権限確認がタイムアウトしました。スキルを中断します。」 | warning      |
| `"ABORTED"`       | 「スキルを中断しました」                                 | info         |
| `"CANCELLED"`     | 「スキルを中断しました」                                 | info         |
| `"CANCELLED_ALL"` | 「スキルを中断しました」                                 | info         |

---

## 9. 検証可能性（テスト可能な条件式）

### 9.1 abort フローの検証

| テストケース ID | 条件                                       | 期待結果                                                 |
| --------------- | ------------------------------------------ | -------------------------------------------------------- |
| ABT-01          | ユーザーが拒否後「スキルを中断する」を選択 | `PermissionResolver.cancelAll()` が呼び出される          |
| ABT-02          | `onAbort` 実行後                           | `PermissionResolver.pendingCount === 0`                  |
| ABT-03          | `onAbort` 実行後                           | `sessionPermissions.has(sessionId) === false`            |
| ABT-04          | `onAbort` 実行後                           | 実行ログに abort イベントが記録されている                |
| ABT-05          | `onAbort` 実行後                           | Renderer が `skill:execution:aborted` IPC を受信している |
| ABT-06          | `onAbort` のステップ1が失敗した場合        | ステップ2以降が継続実行される                            |

### 9.2 retry フローの検証

| テストケース ID | 条件                                      | 期待結果                                                       |
| --------------- | ----------------------------------------- | -------------------------------------------------------------- |
| RTR-01          | 初回拒否後に「別の方法で実行する」を選択  | PermissionDialog が再表示される                                |
| RTR-02          | 2回目拒否後に「別の方法で実行する」を選択 | PermissionDialog が再表示される（ヘッダーに「再確認（2/3）」） |
| RTR-03          | 3回目拒否後                               | 「別の方法で実行する」ボタンが非活性になる                     |
| RTR-04          | 3回目拒否後にユーザーが abort を選択      | abort フロー (1) が実行される                                  |
| RTR-05          | retry 中にタイムアウト（300,000ms）       | abort フロー (1) に自動移行する                                |
| RTR-06          | セッション破棄時                          | 該当 sessionId のリトライカウンターが全削除される              |
| RTR-07          | 初回拒否時の permissionHistorySlice       | `decision: "denied"` が1件記録される                           |
| RTR-08          | 2回目拒否時の permissionHistorySlice      | 追加記録なし（初回の denied が有効）                           |

### 9.3 skip フローの検証

| テストケース ID | 条件                                                           | 期待結果                                                          |
| --------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| SKP-01          | `requiredTools` に含まれないツールで「スキップして続行」を選択 | SkillExecutor に `{ approved: false, skip: true }` が返される     |
| SKP-02          | `requiredTools` に含まれるツールの拒否後オプション画面         | 「この操作をスキップして続行」ボタンが非表示                      |
| SKP-03          | `requiredTools` が未定義のスキルの拒否後オプション画面         | 「この操作をスキップして続行」ボタンが非表示（フェイルセキュア）  |
| SKP-04          | skip 後のスキル実行                                            | 該当ツール呼び出しの戻り値が `error: "PERMISSION_SKIPPED"` を含む |
| SKP-05          | skip 後のスキル次ステップ                                      | 次のステップが正常に実行される                                    |

### 9.4 タイムアウトフローの検証

| テストケース ID | 条件                   | 期待結果                                                             |
| --------------- | ---------------------- | -------------------------------------------------------------------- |
| TMO-01          | 300,000ms 経過後       | `waitForResponse` の Promise が `reason: "TIMEOUT"` で reject される |
| TMO-02          | タイムアウト後         | abort フロー (1) の4ステップクリーンアップが実行される               |
| TMO-03          | タイムアウト後の UI    | 「権限確認がタイムアウトしました...」トーストが表示される            |
| TMO-04          | retry 中のタイムアウト | 初回 `waitForResponse` からの累積時間で判定される                    |

### 9.5 エラーハンドリングの検証

| テストケース ID | 条件                            | 期待結果                                                             |
| --------------- | ------------------------------- | -------------------------------------------------------------------- |
| ERR-01          | reject 理由が `"TIMEOUT"`       | `onAbort` が呼び出される                                             |
| ERR-02          | reject 理由が `"ABORTED"`       | `onAbort` が呼び出される                                             |
| ERR-03          | reject 理由が `"CANCELLED"`     | `onAbort` が呼び出される                                             |
| ERR-04          | reject 理由が `"CANCELLED_ALL"` | `onAbort` が呼び出される                                             |
| ERR-05          | reject 理由が未知の文字列       | ログにエラーが記録され、`onAbort` が呼び出される（フェイルセキュア） |

### 9.6 境界値テスト

| テストケース ID | 条件                                                               | 期待結果                                 |
| --------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| BND-01          | リトライ回数が0回の時に `canRetry` を判定                          | `true` を返す                            |
| BND-02          | リトライ回数が2回の時に `canRetry` を判定                          | `true` を返す                            |
| BND-03          | リトライ回数が3回の時に `canRetry` を判定                          | `false` を返す                           |
| BND-04          | `pendingCount === 0` の状態で `cancelAll()` を実行                 | エラーなし、キャンセル数 0               |
| BND-05          | `sessionPermissions` に該当 sessionId が存在しない状態で `onAbort` | エラーなし、ステップ2は no-op で完了する |
