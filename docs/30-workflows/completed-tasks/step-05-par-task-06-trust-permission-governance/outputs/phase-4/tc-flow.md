# TC-F: 統合フローテスト仕様書

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06                       |
| Phase      | 4: テスト作成                                 |
| カテゴリ   | TC-F（統合フローテスト）                      |
| テスト数   | 4件（TC-F-001〜TC-F-004）                     |
| 依存成果物 | `outputs/phase-2/abort-fallback-design.md`    |
|            | `outputs/phase-2/accountability-ui-design.md` |
| 作成日     | 2026-03-16                                    |

---

## TC-F-001: abortフロー4ステップ検証

### 目的

`onAbort(sessionId)` が4ステップ（cancelAll → セッション削除 → ログ記録 → IPC送信）を順序どおり実行することを検証する。

### 前提条件

- `PermissionResolver` に `pendingCount >= 1` の待機リクエストが存在する
- `sessionPermissions` に該当 `sessionId` のエントリが存在する
- `mainWindow` が有効である（`destroyed === false`）

### テストケース

#### TC-F-001-a: ステップ1 - cancelAllの実行

- **事前状態**: `permissionResolver.pendingCount === 2`
- **操作**: `onAbort(sessionId)` を呼び出す
- **条件式**: `permissionResolver.cancelAll()` が呼び出されたこと（`vi.fn()` で検証）
- **事後条件**: `permissionResolver.pendingCount === 0`

#### TC-F-001-b: ステップ2 - sessionエントリの削除確認

- **事前状態**: `sessionPermissions.get(sessionId)?.size === 3`
- **操作**: `onAbort(sessionId)` を呼び出す
- **事後条件**: `sessionPermissions.has(sessionId) === false`

#### TC-F-001-c: ステップ3 - 実行ログへのabortイベント記録確認

- **操作**: `onAbort(sessionId)` を呼び出す
- **条件式**: `executionLog.append` が以下のオブジェクトで呼び出されたこと
  - `event === "skill:execution:aborted"`
  - `typeof timestamp === "number"`
  - `typeof cancelledPermissionRequests === "number"`
  - `typeof deletedSessionPermissions === "number"`
  - `sessionId` が入力値と一致する

#### TC-F-001-d: ステップ4 - "skill:execution:aborted" IPC送信確認

- **操作**: `onAbort(sessionId)` を呼び出す
- **条件式**: `mainWindow.webContents.send` が `"skill:execution:aborted"` チャンネルで呼び出されたこと
- **条件式**: 送信ペイロードに `sessionId`、`reason`、`timestamp` が含まれること

#### TC-F-001-e: ステップ1失敗時の継続実行

- **事前状態**: `permissionResolver.cancelAll()` が例外をthrowする
- **操作**: `onAbort(sessionId)` を呼び出す
- **条件式**: ステップ2（セッション権限の削除）が実行されること
- **条件式**: ステップ3（ログ記録）が実行されること
- **条件式**: ステップ4（IPC送信）が実行されること
- **条件式**: `onAbort` のPromiseがrejectされないこと（内部でcatchされる）

#### TC-F-001-f: mainWindowがdestroyedの場合

- **事前状態**: `mainWindow.isDestroyed() === true`
- **操作**: `onAbort(sessionId)` を呼び出す
- **条件式**: ステップ1〜3は正常に実行される
- **条件式**: ステップ4はスキップされ、エラーがログに記録される
- **条件式**: `onAbort` のPromiseがrejectされないこと

### 合格基準

全6サブケース（a〜f）が条件式を満たす。特にTC-F-001-c で `event === "skill:execution:aborted"` が `timestamp` 付きで記録されること、TC-F-001-d で `"skill:execution:aborted"` IPC送信が確認されることが必須。

---

## TC-F-002: skipフロー検証

### 目的

skipフローが `{ approved: false, skip: true }` をSkillExecutorに返し、スキルが次ステップに進み、permissionHistoryに `decision:"denied"` が1件記録されることを検証する。

### 前提条件

- スキル定義に `requiredTools` 配列が存在する

### テストケース

#### TC-F-002-a: skip可能なツールでのskip実行

- **事前状態**: `skillDefinition.requiredTools` に `"OptionalTool"` が含まれていない
- **操作**: PermissionDialog で拒否 → 拒否後オプション画面で「この操作をスキップして続行」を選択
- **条件式**: SkillExecutorに返されるレスポンスが `{ approved: false, skip: true }` を含む
- **条件式**: SkillExecutorが該当ツール呼び出しの戻り値として以下を返す
  - `success === false`
  - `error === "PERMISSION_SKIPPED"`

#### TC-F-002-b: skip後のスキル次ステップ実行（スキル実行完了）

- **事前状態**: TC-F-002-a のskipが完了した状態
- **条件式**: スキルの次のステップが正常に実行される
- **条件式**: スキル全体が完了ステータスで終了する（skipによりスキル全体が中断されない）

#### TC-F-002-c: permissionHistoryにdecision:"denied"1件記録

- **操作**: skipフローを実行する
- **条件式**: permissionHistorySliceに `{ decision: "denied", triggerContext: "manual" }` が記録されている
- **条件式**: skip自体は独立したイベントとして記録されない（拒否の一環として扱う）
- **条件式**: `getPermissionHistory().filter(e => e.decision === "denied").length === 1`

#### TC-F-002-d: requiredToolsに含まれるツールでskip不可

- **事前状態**: `skillDefinition.requiredTools.includes("Bash") === true`
- **操作**: `isSkipAllowed(skillDefinition, "Bash")` を呼び出す
- **条件式**: `isSkipAllowed(skillDefinition, "Bash") === false`
- **UI条件式**: 「この操作をスキップして続行」ボタンがDOMに存在しない（disabledではなく非表示）

### 合格基準

全4サブケース（a〜d）が条件式を満たす。

---

## TC-F-003: retryフロー最大3回制限検証

### 目的

retryフローが最大3回まで許可され、3回目拒否後にabortに自動移行し、permissionHistoryへの `decision:"denied"` 記録が初回拒否のみ1件であることを検証する。

### テストケース

#### TC-F-003-a: 1回目拒否後のダイアログ再表示

- **操作**: PermissionDialogで拒否 → 「別の方法で実行する」を選択
- **条件式**: `canRetry(sessionId, toolName) === true`（リトライ回数0 < 3）
- **条件式**: PermissionDialogが再表示される
- **条件式**: ダイアログヘッダーに「再確認（1/3）」が表示される

#### TC-F-003-b: 2回目のダイアログ再表示

- **操作**: 再表示されたPermissionDialogで拒否 → 「別の方法で実行する」を選択
- **条件式**: `canRetry(sessionId, toolName) === true`（リトライ回数1 < 3）
- **条件式**: PermissionDialogが再表示される
- **条件式**: ダイアログヘッダーに「再確認（2/3）」が表示される

#### TC-F-003-c: 3回目拒否後のabort自動移行（retry不可）

- **操作**: 再表示されたPermissionDialogで3回目の拒否を行う
- **条件式**: `canRetry(sessionId, toolName) === false`（リトライ回数3 >= 3）
- **条件式**: 「別の方法で実行する」ボタンが非活性（disabled）になる
- **条件式**: 「再試行回数の上限（3回）に達しました」メッセージが表示される
- **条件式**: abortフローが自動実行される（`onAbort(sessionId)` が呼び出される）

#### TC-F-003-d: permissionHistoryへの記録（初回拒否のみ1件）

- **初回拒否時**: `permissionHistorySlice` に `{ decision: "denied", triggerContext: "manual" }` が1件記録される
- **2回目拒否時**: 追加記録なし。`getPermissionHistory().filter(e => e.decision === "denied").length === 1`
- **3回目拒否時**: 追加記録なし。件数は1件のまま
- **3回目拒否後のauto-abort時**: `{ decision: "denied", triggerContext: "auto" }` が追加記録される。合計2件

### 合格基準

全4サブケース（a〜d）が条件式を満たす。

---

## TC-F-004: タイムアウト(300秒)自動abort検証

### 目的

`DEFAULT_TIMEOUT_MS`（300000ms）経過でabortが自動実行されること、および値が300000ms固定であることを検証する。

### 前提条件

- `DEFAULT_TIMEOUT_MS === 300000`（変更禁止定数）
- Vitestの `vi.useFakeTimers()` を使用する
- P13準拠: `advanceTimersByTime` で1ステップずつ進める（`runAllTimers` は使用しない）

### テストケース

#### TC-F-004-a: DEFAULT_TIMEOUT_MSが300000ms固定であることの検証

- **条件式**: `DEFAULT_TIMEOUT_MS === 300000`
- **検証方法**: 定数定義ファイルで値が `300000` であることを直接確認する
- **条件式**: `300000 / 1000 === 300`（300秒 = 5分 の算術確認）

#### TC-F-004-b: 300秒経過でのauto-abort実行

- **操作**: `permissionResolver.waitForResponse(requestId)` を呼び出し、`vi.advanceTimersByTime(300000)` でタイムアウトさせる
- **条件式**: Promiseが `"TIMEOUT"` でrejectされる
- **条件式**: `onAbort(sessionId)` が呼び出される
- **条件式**: abortフローの4ステップが実行される

#### TC-F-004-c: タイムアウト直前（299999ms）は継続

- **操作**: `vi.advanceTimersByTime(299999)` で299999ms経過
- **条件式**: `waitForResponse` のPromiseがまだpending状態である（rejectされていない）

#### TC-F-004-d: タイムアウト後のpermissionHistorySlice記録

- **操作**: TC-F-004-b のTIMEOUT発生後
- **条件式**: `{ decision: "denied", triggerContext: "auto" }` が記録される

### 合格基準

全4サブケース（a〜d）が条件式を満たす。特にTC-F-004-aで `DEFAULT_TIMEOUT_MS === 300000` が確認されること、TC-F-004-bで300秒経過時に自動abortが実行されることが必須。
