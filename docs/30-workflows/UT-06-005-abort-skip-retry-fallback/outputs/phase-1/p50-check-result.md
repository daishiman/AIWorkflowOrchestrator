# P50チェック結果: 既実装状態の調査

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 1                                   |
| 機能名 | UT-06-005-abort-skip-retry-fallback |
| 調査日 | 2026-03-16                          |

## 判定: 部分実装

abort/skip/retry/timeout フォールバックフローは**未実装**だが、基盤となるコンポーネントは部分的に実装済み。Phase 4-5 で**新規実装**が必要。

## 調査対象ファイル

| ファイル                | パス                                                         | 行数     |
| ----------------------- | ------------------------------------------------------------ | -------- |
| SkillExecutor           | `apps/desktop/src/main/services/skill/SkillExecutor.ts`      | 1494     |
| PermissionResolver      | `apps/desktop/src/main/services/skill/PermissionResolver.ts` | 186      |
| PermissionStore         | `apps/desktop/src/main/services/skill/PermissionStore.ts`    | 241      |
| IPC Channels            | `packages/shared/src/ipc/channels.ts`                        | ~140     |
| SkillPermissionResponse | `packages/shared/src/types/skill.ts`                         | L518-530 |

## 詳細調査結果

### 1. SkillExecutor.ts

#### 既存の関連実装

| 機能                       | 行番号     | 状態     | 内容                                                              |
| -------------------------- | ---------- | -------- | ----------------------------------------------------------------- |
| ExecutionState 型          | 定義済み   | 実装済   | `"pending" \| "running" \| "completed" \| "aborted" \| "error"`   |
| abort() メソッド           | L582-606   | 基盤のみ | AbortController.abort() + 状態変更のみ。4ステップフロー未実装     |
| handlePermissionResponse() | L1424-1443 | 別用途   | IPC応答をPermissionResolverに転送するのみ。fallbackロジック未実装 |
| sendPermissionRequest()    | L1456-1492 | 実装済   | Rendererへのリクエスト送信 + PermissionResolver.waitForResponse   |
| executeWithRetry()         | L658-737   | 別用途   | SDK query リトライ（指数バックオフ）。Permission retry ではない   |
| DEFAULT_TIMEOUT_MS         | L235       | 30000    | SDK実行タイムアウト。Permission timeout (300000) とは別           |

#### 未実装項目

| 機能                        | 状態   | 備考                                                        |
| --------------------------- | ------ | ----------------------------------------------------------- |
| abort 4ステップフロー       | 未実装 | cancelAll→revokeSession→log→IPC の連鎖が存在しない          |
| skip フロー                 | 未実装 | `skip: true` の応答ハンドリングが存在しない                 |
| Permission retry フロー     | 未実装 | retryCounters Map が存在しない                              |
| timeout → abort 遷移        | 未実装 | PermissionResolver の timeout を abort に接続する処理がない |
| retryCounters Map           | 未実装 | リクエストIDごとのリトライカウンタが存在しない              |
| executeAbortFlow() メソッド | 未実装 | 4ステップの共通メソッドが存在しない                         |

### 2. PermissionResolver.ts

| 機能                | 行番号   | 状態   | 内容                                |
| ------------------- | -------- | ------ | ----------------------------------- |
| DEFAULT_TIMEOUT_MS  | 定義済み | 300000 | 5分タイムアウト（仕様と一致）       |
| waitForResponse()   | 実装済み | 基盤   | timeout + abort signal サポート済み |
| cancelAll()         | 実装済み | 基盤   | 全pending rejecttion + Map クリア   |
| cancelRequest()     | 実装済み | 基盤   | 単一リクエストキャンセル            |
| pendingCount getter | 実装済み | 基盤   | 保留リクエスト数取得                |

### 3. PermissionStore.ts

| 機能                   | 状態       | 内容                                         |
| ---------------------- | ---------- | -------------------------------------------- |
| isToolAllowed()        | 実装済     | ツール許可チェック                           |
| allowTool()            | 実装済     | ツール許可の記録                             |
| revokeTool()           | 実装済     | 個別ツール許可の取消                         |
| clearAll()             | 実装済     | 全許可クリア                                 |
| getAllowedTools()      | 実装済     | 許可済みツール一覧取得                       |
| revokeSessionEntries() | **未実装** | セッションIDベースの一時許可取消が存在しない |

### 4. IPC Channels (packages/shared/src/ipc/channels.ts)

| チャンネル                | 定数名                    | 値                          | 状態   |
| ------------------------- | ------------------------- | --------------------------- | ------ |
| SKILL_PERMISSION_REQUEST  | SKILL_PERMISSION_REQUEST  | `skill:permission:request`  | 実装済 |
| SKILL_PERMISSION_RESPONSE | SKILL_PERMISSION_RESPONSE | `skill:permission:response` | 実装済 |
| SKILL_ABORT               | SKILL_ABORT               | `skill:abort`               | 実装済 |

abort 通知用の IPC チャンネルは既存。追加チャンネルは不要と判断。

### 5. SkillPermissionResponse 型 (packages/shared/src/types/skill.ts L518-530)

```typescript
export interface SkillPermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
  rejectReason?: string;
}
```

**`skip?: boolean` フィールドが未定義**。Phase 5 で追加が必要。

## 結論と Phase 4-5 への影響

### 実装モード: 新規実装

| フロー  | 基盤     | 必要な実装                                           |
| ------- | -------- | ---------------------------------------------------- |
| abort   | 基盤あり | 4ステップフローの実装、既存abort()の拡張             |
| skip    | 基盤なし | SkillPermissionResponse への `skip` 追加、フロー実装 |
| retry   | 基盤なし | retryCounters Map、リトライロジック全体              |
| timeout | 基盤あり | PermissionResolver timeout → abort 遷移の接続        |

### 型変更が必要なファイル

1. `packages/shared/src/types/skill.ts` - `skip?: boolean` 追加
2. `apps/desktop/src/main/services/skill/PermissionStore.ts` - `revokeSessionEntries()` 追加
3. `apps/desktop/src/main/services/skill/SkillExecutor.ts` - fallback フロー全体の実装
