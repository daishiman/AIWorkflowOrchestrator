# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 8                                   |
| 機能名    | UT-06-005-abort-skip-retry-fallback |
| 作成日    | 2026-03-16                          |
| 前提Phase | Phase 7（カバレッジ確認）完了       |

## 目的

Phase 5-7 で実装・テスト検証が完了した abort/skip/retry/timeout フォールバックフローのコードを、**動作を変えずに**品質改善する。重複の排除、命名の統一、責務の明確化を通じて保守性と可読性を向上させる。

## 参照資料

| 資料                       | パス / 参照先                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| Phase 7 成果物             | `outputs/phase-7/coverage-report.md`, `outputs/phase-7/coverage-decision.md`                |
| Phase 5 実装成果物         | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                     |
| Phase 5 実装成果物         | `apps/desktop/src/main/services/skill/PermissionStore.ts`                                   |
| テストファイル             | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts`             |
| 設計仕様                   | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/phase-2-design.md`                   |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                                                          |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`（P55: パスの正規表現エスケープ）                       |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 仕様書                     | パス                                                                                         | 確認観点                                                           |
| -------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| エラーハンドリング仕様     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        | エラーカテゴリ・Result パターン準拠                                |
| エラーハンドリング（コア） | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`                   | エラーコード範囲（1000-5999）、ERR_2002 PERMISSION_DENIED          |
| エラーハンドリング（詳細） | `.claude/skills/aiworkflow-requirements/references/error-handling-details.md`                | SkillExecutor実行エラーコード（PERMISSION_DENIED, TIMEOUT, ABORT） |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`  | Strategy/State パターン、DI パターン                               |
| セキュリティ（スキル実行） | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | fail-closed 原則、セッション管理                                   |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                  | カバレッジ基準、コード品質基準                                     |
| Agent SDK Executor（コア） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-core.md`    | ExecutionState列挙型、RetryConfig、SkillExecutionErrorCode         |
| Agent SDK Executor（詳細） | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | PermissionResolver完全仕様、DEFAULT_TIMEOUT_MS=300000              |

## 実行タスク

### Task 1: handlePermissionResponse のフロー分岐ロジック整理

- **対象**: `SkillExecutor.ts` の `handlePermissionResponse` メソッド
- **方針**: Permission 応答（abort/skip/retry/timeout）ごとの処理分岐を Strategy または State パターンで整理
- **手順**:
  1. 現在の分岐ロジック（if-else / switch）を分析し、各ブランチの責務を特定
  2. 共通インターフェース `PermissionResponseHandler` を定義（`handle(context): Promise<FlowResult>`）
  3. 各応答タイプに対応するハンドラを実装（AbortHandler, SkipHandler, RetryHandler, TimeoutHandler）
  4. `handlePermissionResponse` 内でハンドラをディスパッチするように変更
  5. テスト全 PASS を確認
- **判断基準**: 分岐が3つ以上で各ブランチが5行以上の場合にパターン抽出を実施。2行以下の簡潔な分岐はそのまま維持

### Task 2: retryCounters のクリーンアップロジック整理

- **対象**: `SkillExecutor.ts` のリトライカウンタ管理部分
- **方針**: カウンタのインクリメント・リセット・上限チェックを一箇所に集約
- **手順**:
  1. リトライカウンタの読み書き箇所を `grep -n "retryCount"` で全列挙
  2. カウンタ操作を `RetryCounter` クラスまたはヘルパーメソッド群に集約
  3. `incrementAndCheck(): { shouldRetry: boolean; currentCount: number }` のようなインターフェースで呼び出し側を簡素化
  4. テスト全 PASS を確認
- **判断基準**: カウンタ操作が3箇所以上に散在している場合に集約を実施

### Task 3: abort 4ステップの共通化検討

- **対象**: abort フローの4ステップ（cancelAll -> revokeSessionEntries -> log -> IPC）
- **方針**: `AbortFlowExecutor` クラスまたはプライベートメソッドとして抽出を検討
- **手順**:
  1. abort 4ステップが呼び出される全箇所を特定
  2. 各箇所で4ステップの実行順序・引数が同一かを確認
  3. 同一パターンが2箇所以上であれば `executeAbortFlow(context)` プライベートメソッドに抽出
  4. 1箇所のみの場合は抽出せず、コメントで4ステップの意図を明記
  5. テスト全 PASS を確認
- **注意**: 過度な抽象化を避ける。1箇所のみの呼び出しに対してクラス抽出は行わない

### Task 4: ログメッセージの統一

- **対象**: フォールバックフロー全体のログ出力
- **方針**: ログレベル・フォーマット・安全性の統一
- **手順**:
  1. フォールバック関連のログ出力を全列挙
  2. ログレベルの適切性を確認（abort=warn, skip=info, retry=info, timeout=warn）
  3. ログメッセージのフォーマットを統一（`[SkillExecutor] <action>: <detail>` 形式）
  4. **P55 準拠**: ログメッセージにファイルパスを含む場合、`os.homedir()` 等のパスを正規表現エスケープしてからマスク処理
  5. PII / API キーがログに含まれていないことを確認
  6. テスト全 PASS を確認

### Task 5: 命名改善

- **対象**: Phase 5 で追加した変数名・メソッド名・型名
- **方針**: プロジェクト命名規約（boolean は `is`/`has`/`can`/`should` プレフィックス等）に準拠
- **手順**:
  1. 新規追加された識別子をリストアップ
  2. 命名規約違反がないかチェック
  3. 意味が曖昧な命名を改善（例: `result` -> `permissionResult`, `count` -> `retryAttemptCount`）
  4. テスト全 PASS を確認

## 実行手順

```bash
# Step 1: 現在のテスト状態を確認（リファクタリング前のベースライン）
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260316-175650-wt-2
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/

# Step 2: Task 1-5 を順次実施（各 Task 後にテスト実行）
# 各 Task 完了後:
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/

# Step 3: 全体テスト（既存 permission/retry テスト含む）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/

# Step 4: TypeScript 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit

# Step 5: Lint チェック
pnpm --filter @repo/desktop lint
```

## 統合テスト連携【必須】

| チェック項目                                   | コマンド / 確認方法                                                                                     | 期待結果 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------- |
| fallback テスト全 PASS                         | `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts`   | 全 PASS  |
| 既存 permission テスト全 PASS                  | `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.permission.test.ts` | 全 PASS  |
| 既存 retry テスト全 PASS                       | `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`      | 全 PASS  |
| skill サービス全テスト PASS                    | `cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/`                                 | 全 PASS  |
| リファクタリング前後でテスト数が減少していない | テスト数の比較                                                                                          | 同数以上 |

## 多角的チェック観点

| 観点             | チェック内容                                                         |
| ---------------- | -------------------------------------------------------------------- |
| 動作保全         | リファクタリング前後で全テスト結果が同一であること                   |
| 重複排除         | 同一ロジックが2箇所以上に存在しないこと                              |
| 命名一貫性       | boolean は `is`/`has`/`can`/`should` プレフィックス                  |
| 型安全           | `any` 型・`as` キャスト・`!` non-null assertion が増加していないこと |
| ログ安全性       | P55 準拠のパスエスケープ、PII/APIキー非含有                          |
| 過度な抽象化回避 | 1箇所のみの使用に対してクラス抽出を行っていないこと                  |
| SOLID 原則       | 各クラス・メソッドが単一責務を持つこと                               |

### Electronデスクトップアプリ観点

| 観点                  | チェック内容                                                              |
| --------------------- | ------------------------------------------------------------------------- |
| Main Process 安全性   | リファクタリング後も Main Process 内でのみスキル実行が完結すること        |
| IPC 契約維持          | リファクタリングにより IPC チャンネルの引数・戻り値型が変化していないこと |
| Preload Bridge 非破壊 | Preload 経由の API が変更されていないこと                                 |
| Renderer 影響なし     | Renderer 側のコード変更が不要であること                                   |
| contextIsolation 維持 | リファクタリングが contextIsolation を迂回していないこと                  |

## 成果物

| 成果物                     | パス                                                      | 説明                 |
| -------------------------- | --------------------------------------------------------- | -------------------- |
| リファクタリング済みコード | `apps/desktop/src/main/services/skill/SkillExecutor.ts`   | 品質改善後の実装     |
| リファクタリング済みコード | `apps/desktop/src/main/services/skill/PermissionStore.ts` | 品質改善後の実装     |
| テスト結果ログ             | Phase 8 実行時のテスト出力                                | リファクタリング検証 |

## 完了条件

- [ ] Task 1: handlePermissionResponse のフロー分岐ロジックが整理されている
- [ ] Task 2: retryCounters のクリーンアップロジックが集約されている
- [ ] Task 3: abort 4ステップの共通化が検討・適用されている（または見送り理由が記録されている）
- [ ] Task 4: ログメッセージが統一され、P55 準拠のパスエスケープが適用されている
- [ ] Task 5: 命名がプロジェクト規約に準拠している
- [ ] 全テスト（fallback/permission/retry/既存）が PASS
- [ ] TypeScript 型チェック PASS（`pnpm --filter @repo/desktop exec tsc --noEmit`）
- [ ] ESLint PASS（`pnpm --filter @repo/desktop lint`）
- [ ] リファクタリング前後でテスト数が減少していない
- [ ] `any` 型・`@ts-ignore` が増加していない
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク | 内容                          | 状態   | 備考                             |
| ---------- | ----------------------------- | ------ | -------------------------------- |
| Task 1     | handlePermissionResponse 整理 | 未着手 | Strategy/State パターン適用検討  |
| Task 2     | retryCounters クリーンアップ  | 未着手 | 3箇所以上散在時に集約            |
| Task 3     | abort 4ステップ共通化         | 未着手 | 2箇所以上で抽出、1箇所なら見送り |
| Task 4     | ログメッセージ統一            | 未着手 | P55 準拠必須                     |
| Task 5     | 命名改善                      | 未着手 | 規約チェック                     |

## タスク100%実行確認【必須】

```bash
# Phase 8 成果物検証
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260316-175650-wt-2

# 1. 全テスト PASS 確認
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/

# 2. TypeScript 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit

# 3. ESLint
pnpm --filter @repo/desktop lint

# 4. validate-phase-output.js（利用可能な場合）
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-abort-skip-retry-fallback --phase 8
```

## 次のPhase

Phase 8 完了後 -> **Phase 9: 品質保証**（`phase-9-quality-assurance.md`）
