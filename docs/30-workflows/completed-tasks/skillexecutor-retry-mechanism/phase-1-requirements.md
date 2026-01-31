# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目      | 内容                          |
| --------- | ----------------------------- |
| Phase     | 1                             |
| Phase名   | 要件定義                      |
| カテゴリ  | 要件                          |
| 機能名    | skillexecutor-retry-mechanism |
| 作成日    | 2026-01-30                    |
| 前提Phase | なし                          |
| 後続Phase | Phase 2（設計）               |

## 目的

SkillExecutorリトライ機構の詳細要件を明確化し、既存実装との整合性を確認する。

---

## 実行タスク

### Task 1: 既存SkillExecutor実装の分析

**目的**: 現在のSkillExecutor実装を分析し、リトライ機構の追加ポイントを特定する。

**手順**:

1. `apps/desktop/src/main/services/skill/SkillExecutor.ts`を読み込み、execute()メソッドのフローを把握する
2. 既存の`categorizeError()`と`isRetryable()`メソッドの実装を確認する
3. AbortControllerによるキャンセル機構の実装を確認する
4. ストリーミングメッセージの送信パターン（`sendStreamMessage()`）を確認する
5. 同時実行制御（MAX_CONCURRENT_EXECUTIONS=5）との関係を整理する

**期待される成果物**:

- 既存実装分析レポート（`outputs/phase-1/existing-implementation-analysis.md`）

### Task 2: リトライ対象エラーの定義

**目的**: リトライすべきエラーとリトライ不要なエラーを明確に分類する。

**手順**:

1. `error-handling.md`仕様のエラーカテゴリ（5分類）を確認する
2. Claude Agent SDK query() APIが返すエラー型を確認する
3. 以下のリトライ対象エラーを定義する:
   - ネットワークエラー: ECONNRESET, ETIMEDOUT, ECONNREFUSED, ENOTFOUND, EAI_AGAIN
   - HTTP 429 (Too Many Requests): Retry-Afterヘッダー対応
   - HTTP 5xx (500, 502, 503, 504): サーバーエラー
   - TIMEOUT: リクエストタイムアウト
4. 以下のリトライ不要エラーを定義する:
   - HTTP 400 (Bad Request): リクエスト不正
   - HTTP 401 (Unauthorized): 認証エラー
   - HTTP 403 (Forbidden): 権限エラー
   - HTTP 404 (Not Found): リソース不在
   - ユーザーによるabort(): 意図的キャンセル
   - MAX_CONCURRENT_EXCEEDED: 同時実行上限
5. 既存の`isRetryable()`メソッドとの関係を整理する

**期待される成果物**:

- リトライ対象エラー一覧（`outputs/phase-1/retryable-errors-definition.md`）

### Task 3: エラーハンドリング仕様との整合性確認

**目的**: `error-handling.md`で定義済みのリトライ戦略との整合性を確認する。

**手順**:

1. `.claude/skills/aiworkflow-requirements/references/error-handling.md`を参照する
2. 既存リトライ戦略を確認する:
   - 最大リトライ回数: 3回
   - 基本待機時間: 1000ms
   - バックオフ倍率: 2x
   - 最大待機時間: 30000ms
   - Jitter: +/-20%
3. SkillExecutor固有の調整が必要かを判断する
4. Retry-Afterヘッダー優先の要件を確認する

**期待される成果物**:

- 整合性確認レポート（`outputs/phase-1/error-handling-alignment.md`）

### Task 4: ストリーミングイベント要件の定義

**目的**: リトライ状態をUIに通知するためのストリーミングイベント要件を定義する。

**手順**:

1. 既存のSkillStreamMessageType（assistant, tool_use, tool_result, status, error）を確認する
2. 新規イベント`retry`を追加する要件を定義する:
   - attempt: 現在のリトライ試行回数
   - maxRetries: 最大リトライ回数
   - delayMs: 次回リトライまでの待機時間
   - error: リトライ理由となったエラー情報
   - retryableErrorType: エラー分類（network, rate_limit, server_error, timeout）
3. UIでの表示要件を定義する（表示のみ、UI実装はスコープ外）

**期待される成果物**:

- ストリーミングイベント要件書（`outputs/phase-1/streaming-event-requirements.md`）

### Task 5: 要件定義書の作成

**目的**: 上記Task 1-4の結果を統合した要件定義書を作成する。

**手順**:

1. Task 1-4の成果物を統合する
2. 機能要件を一覧化する
3. 非機能要件（パフォーマンス、信頼性）を定義する
4. スコープ（含む/含まない）を明確化する
5. 受け入れ基準を定義する

**期待される成果物**:

- 要件定義書（`outputs/phase-1/requirements-definition.md`）

---

## 参照資料

| 参照資料                         | パス                                                                                    | 用途             |
| -------------------------------- | --------------------------------------------------------------------------------------- | ---------------- |
| SkillExecutor実装                | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                 | 既存実装分析     |
| skill型定義                      | `packages/shared/src/types/skill.ts`                                                    | 型構成確認       |
| SkillExecutor/PermissionResolver | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`    | 仕様確認         |
| エラーハンドリング仕様           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                   | リトライ戦略参照 |
| Agent SDK統合仕様                | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` | 型定義参照       |
| 元タスク指示書                   | `docs/30-workflows/unassigned-task/task-skillexecutor-retry-mechanism.md`               | 元タスク定義     |

---

## 多角的観点チェック

### 必須確認観点

| 観点               | 確認内容                                       |
| ------------------ | ---------------------------------------------- |
| エラーハンドリング | リトライ対象/非対象エラーの分類が網羅的か      |
| テスタビリティ     | リトライロジックを単体テスト可能な設計か       |
| セキュリティ       | リトライによる認証情報の過剰送信リスクはないか |

### Electron固有観点

| 層           | 確認内容                                                          |
| ------------ | ----------------------------------------------------------------- |
| Main Process | リトライロジックがMain Processで完結するか                        |
| IPC通信      | リトライ状態のストリーミングイベントがIPC経由で正しく通知されるか |
| Renderer     | リトライイベントの受信型が既存のSkillStreamMessage型と整合するか  |

---

## 統合テスト連携

リトライ対象エラーパターンの統合テスト観点を要件に含める:

- ネットワークエラーシミュレーション → リトライ → 成功のEnd-to-Endフロー
- Rate limit → Retry-After遵守 → リトライ → 成功のフロー
- リトライ上限到達 → エラー終了のフロー

---

## 成果物

| 成果物                     | パス                                                  | 種別     |
| -------------------------- | ----------------------------------------------------- | -------- |
| 既存実装分析レポート       | `outputs/phase-1/existing-implementation-analysis.md` | document |
| リトライ対象エラー一覧     | `outputs/phase-1/retryable-errors-definition.md`      | document |
| 整合性確認レポート         | `outputs/phase-1/error-handling-alignment.md`         | document |
| ストリーミングイベント要件 | `outputs/phase-1/streaming-event-requirements.md`     | document |
| 要件定義書                 | `outputs/phase-1/requirements-definition.md`          | document |

---

## 完了条件

- [ ] 既存SkillExecutor実装のexecute()フローが文書化されている
- [ ] リトライ対象エラーと非対象エラーが明確に分類されている
- [ ] error-handling.md仕様との整合性が確認されている
- [ ] `skill:retry`ストリーミングイベントの要件が定義されている
- [ ] 要件定義書に機能要件・非機能要件・スコープ・受け入れ基準が含まれている
- [ ] 本Phase内の全タスク（Task 1-5）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 1 \
  --artifacts "outputs/phase-1/requirements-definition.md:要件定義書"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 1
```

---

## Phase実行記録

| 項目              | 内容 |
| ----------------- | ---- |
| 実行タスク        |      |
| 発見事項          |      |
| 次Phaseへの引継ぎ |      |

---

## 次のPhase

→ [Phase 2: 設計](./phase-2-design.md)
