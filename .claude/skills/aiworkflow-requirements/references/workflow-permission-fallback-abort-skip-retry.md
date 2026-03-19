# Permission Fallback: abort / skip / retry / timeout

> 正本: `.claude/skills/aiworkflow-requirements/references/workflow-permission-fallback-abort-skip-retry.md`
> 実装ワークフロー: `docs/30-workflows/completed-tasks/UT-06-005-abort-skip-retry-fallback/`

---

## メタ情報

| 項目 | 値 |
| --- | --- |
| タスクID | UT-06-005 |
| ステータス | 完了（2026-03-16） |
| 対象レイヤー | Main Process（SkillExecutor） |
| GitHub Issue | #1250 |

---

## current canonical set

| ファイル | 責務 |
| --- | --- |
| `interfaces-agent-sdk-executor-core.md` | AbortReason / PermissionFlowContext / PermissionFlowResult 型定義 |
| `interfaces-agent-sdk-executor-details.md` | Permission fallback フロー詳細（processPermissionFallback 分岐 / executeAbortFlow 4ステップ / executeSkipFlow / timeout→abort） |
| `security-skill-execution.md` | fail-closed 原則 / revokeSessionEntries cleanup / retry limit セキュリティ根拠 |
| `interfaces-agent-sdk-skill-details.md` | SkillPermissionResponse.skip フィールド |
| `interfaces-agent-sdk-integration.md` | SkillPermissionResponse.skip フィールド |

---

## artifact inventory

| パス | 種別 | 内容 |
| --- | --- | --- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | プロダクションコード | processPermissionFallback / executeAbortFlow / executeSkipFlow + `handlePermissionCheck` + `sendPermissionRequestWithTimeout` + `PermissionTimeoutError` |
| `apps/desktop/src/main/services/skill/PermissionStore.ts` | プロダクションコード | revokeSessionEntries スタブ実装（全エントリクリア） |
| `packages/shared/src/types/permission-store.ts` | 共有型定義 | IPermissionStore.revokeSessionEntries? optional メソッド |
| `packages/shared/src/types/skill.ts` | 共有型定義 | SkillPermissionResponse.skip?: boolean |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts` | テスト | 23テスト（abort 8 / skip 4 / retry 5 / timeout 4 / fail-closed 2） |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.hook-fallback.test.ts` | テスト | PreToolUse Hook 統合テスト（Permission拒否 / timeout / retry / skip / fail-closed） |
| `docs/30-workflows/completed-tasks/UT-06-005-abort-skip-retry-fallback/` | ワークフロー成果物 | Phase 1-12 全成果物 |
| `docs/30-workflows/UT-06-005-A-hook-fallback-integration/` | ワークフロー成果物 | PreToolUse Hook 統合 + timeout→abort 遷移の Phase 1-12 成果物 |

---

## 実装内容（要点）

### 1. abort 4ステップフロー

```
cancelAll() → revokeSessionEntries(sessionId) → log → IPC通知(SKILL_STREAM)
```

- `AbortReason`: `"denied"` | `"timeout"` | `"max_retries"` | `"unknown"`
- 冪等性: `abortedExecutions: Set<string>` で二重 abort 防止（NFR-3）
- fail-closed: 不明エラーは abort にフォールバック（NFR-1）

### 2. skip フロー

- `{ approved: false, skip: true }` → 現在のツール使用をスキップし、実行を継続
- IPC 通知: `SKILL_STREAM` チャンネルで `type:"tool_use"` として送信

### 3. retry フロー

- `PERMISSION_MAX_RETRIES = 3`（デフォルト値、`context.maxRetries ?? PERMISSION_MAX_RETRIES` で接続）
- 3回失敗で `executeAbortFlow("max_retries")` に遷移
- `retryCounters: Map<string, number>` で実行ごとのリトライ回数管理

### 4. timeout → abort

- `DEFAULT_TIMEOUT_MS = 30000`（30秒、SkillExecutor 側 timeout guard を利用）
- timeout 時は retry なしで直接 `executeAbortFlow("timeout")`

### 5. IPC 設計

- 既存 `SKILL_STREAM` チャンネル（Main→Renderer）を再利用
- 新規チャンネル追加なし → Preload Bridge への影響ゼロ

### 6. UT-06-005-A 実行時統合（2026-03-17）

- `createHooks().PreToolUse` が `handlePermissionCheck()` を呼び出す実装へ移行
- Permission 拒否時に `processPermissionFallback()` が実行時フローで有効化
- timeout は `PermissionTimeoutError` として検知し `executeAbortFlow("timeout")` に遷移

---

## 苦戦箇所（再利用形式）

### S-PF-1: cancelAll() 引数不整合

| 項目 | 内容 |
| --- | --- |
| 症状 | 設計では `cancelAll(reason)` だが実装は引数なし |
| 原因 | 設計時の API シグネチャ未確認 |
| 解決 | `cancelAll()` を引数なしで呼び出し。設計時に `grep -n` で現行シグネチャ確認を必須化 |

### S-PF-2: IPermissionStore 型定義二箇所同時更新（P32）

| 項目 | 内容 |
| --- | --- |
| 症状 | `revokeSessionEntries` が shared 側インターフェースに未定義で型エラー |
| 原因 | 実装クラスのみ更新し、shared パッケージの型定義を忘れた |
| 解決 | `IPermissionStore` に optional メソッドとして追加。P32 準拠で二箇所同時更新 |

### S-PF-3: PERMISSION_MAX_RETRIES デッドコード

| 項目 | 内容 |
| --- | --- |
| 症状 | 定数定義済みだが processPermissionFallback 内で未使用 |
| 原因 | `context.maxRetries` のみ使用し、デフォルト代入（`??`）を忘れた |
| 解決 | `const maxRetries = context.maxRetries ?? PERMISSION_MAX_RETRIES;` で接続 |

---

## 同種課題の5分解決カード

| ステップ | 内容 |
| --- | --- |
| 1 | `grep -n "methodName" target.ts` で現行 API シグネチャを確認 |
| 2 | 実装クラス + shared インターフェースを同時更新（P32 準拠） |
| 3 | 定数定義後は `grep -n "CONSTANT_NAME" .` でデッドコード確認 |
| 4 | `pnpm --filter @repo/desktop exec vitest run` でテスト実行 |
| 5 | `pnpm typecheck` で型整合性を検証 |

---

## 検出した未タスク（更新: 2026-03-17）

| タスクID | 内容 | 優先度 | 指示書パス |
| --- | --- | --- | --- |
| ~~UT-06-005-A~~ | ~~PreToolUse Hook フォールバック統合（GAP-02/03）~~ **完了: 2026-03-17** | ~~高~~ | `docs/30-workflows/UT-06-005-A-hook-fallback-integration/` |
| UT-06-005-B | revokeSessionEntries セッション別本格実装（GAP-04） | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-06-005-b-session-revoke-impl.md` |
| UT-06-005-C | SkillStreamMessageType abort/skip 型追加（GAP-06） | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-06-005-c-stream-type-abort-skip.md` |

---

## 関連ドキュメント

| ドキュメント | 用途 |
| --- | --- |
| [interfaces-agent-sdk-executor-core.md](./interfaces-agent-sdk-executor-core.md) | AbortReason / PermissionFlow 型契約 |
| [interfaces-agent-sdk-executor-details.md](./interfaces-agent-sdk-executor-details.md) | fallback フロー詳細仕様 |
| [security-skill-execution.md](./security-skill-execution.md) | fail-closed / retry limit セキュリティ根拠 |
| [interfaces-agent-sdk-skill-details.md](./interfaces-agent-sdk-skill-details.md) | SkillPermissionResponse.skip 定義 |

---

## 変更履歴

| 日付 | バージョン | 内容 |
| --- | --- | --- |
| 2026-03-17 | 1.1.0 | UT-06-005-A 完了同期。PreToolUse Hook 統合 (`handlePermissionCheck` / `sendPermissionRequestWithTimeout` / `PermissionTimeoutError`) と timeout 30秒契約、未タスク台帳更新を反映 |
| 2026-03-16 | 1.0.0 | 初版作成。UT-06-005 完了時の実装内容・苦戦箇所・未タスク3件を統合 |
