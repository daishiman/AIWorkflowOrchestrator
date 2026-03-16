# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 3                                   |
| 機能名 | UT-06-005-abort-skip-retry-fallback |
| 作成日 | 2026-03-16                          |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的に検証し、Phase 4（テスト作成）に進行可能かを判定する。

## 実行タスク

- 要件妥当性検証: FR/NFR/ACの整合性と網羅性を確認
- 設計妥当性検証: 状態遷移・IF設計・連携設計の妥当性を確認
- セキュリティレビュー: fail-closed原則の設計反映を確認
- simpler alternative検討: より単純な代替設計がないかを検討

## 参照資料

| 資料名      | パス                                  | 説明           |
| ----------- | ------------------------------------- | -------------- |
| 要件定義書  | `outputs/phase-1/requirements.md`     | Phase 1成果物  |
| P50チェック | `outputs/phase-1/p50-check-result.md` | 既実装調査結果 |
| 設計書      | `outputs/phase-2/design.md`           | Phase 2成果物  |
| 状態遷移図  | `outputs/phase-2/state-diagram.md`    | 状態遷移詳細   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                        | パス                                                                                         | 内容                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ（スキル実行）      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | セキュリティ要件の適合性                                           |
| セキュリティ（スキルIPC）       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                    | スキルIPC通信セキュリティ                                          |
| Agent SDK Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`            | Permission関連型定義                                               |
| 実装パターン                    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`  | DI/状態遷移パターン                                                |
| エラーハンドリング              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        | エラー分類との整合性                                               |
| エラーハンドリング（コア）      | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`                   | エラーコード範囲（1000-5999）、ERR_2002 PERMISSION_DENIED          |
| エラーハンドリング（詳細）      | `.claude/skills/aiworkflow-requirements/references/error-handling-details.md`                | SkillExecutor実行エラーコード（PERMISSION_DENIED, TIMEOUT, ABORT） |
| Agent SDK Executor（コア）      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-core.md`    | ExecutionState列挙型、RetryConfig、SkillExecutionErrorCode、DI構成 |
| Agent SDK Executor（詳細）      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | PermissionResolver完全仕様、DEFAULT_TIMEOUT_MS=300000              |

## 実行手順

### ステップ1: 要件妥当性検証

| 検証項目             | 確認内容                                                 | 判定 |
| -------------------- | -------------------------------------------------------- | ---- |
| FR網羅性             | abort/skip/retry/timeout 全フローの要件が定義済み        | -    |
| NFR網羅性            | セキュリティ・パフォーマンス・信頼性・可観測性が定義済み | -    |
| AC検証可能性         | 全ACが自動テストで検証可能                               | -    |
| 既存テストとの整合性 | AC-12が既存テスト PASS を含む                            | -    |
| 依存タスクの確認     | TASK-SKILL-LIFECYCLE-08 の完了状態を確認                 | -    |

### ステップ2: 設計妥当性検証

| 検証項目                | 確認内容                                        | 判定 |
| ----------------------- | ----------------------------------------------- | ---- |
| 状態遷移の網羅性        | 全入力パターンに対する遷移先が定義済み          | -    |
| デッドロック/無限ループ | retry → abort の有限性が保証されている          | -    |
| IF整合性                | 新規メソッドの型がSkillPermissionResponseと整合 | -    |
| DI設計                  | 全依存がコンストラクタ/Setter Injection可能     | -    |
| 冪等性設計              | 二重abort/skipの安全性が設計に反映              | -    |
| IPC契約                 | チャンネル名がSKILL_CHANNELS定数で管理          | -    |

### ステップ3: セキュリティレビュー

| 検証項目           | 確認内容                                             | 判定 |
| ------------------ | ---------------------------------------------------- | ---- |
| fail-closed原則    | 不明なエラー時の abort 遷移が設計に含まれる          | -    |
| timeout安全性      | timeout後にretryに行かず直接abortする設計            | -    |
| セッション権限管理 | revokeSessionEntriesでセッション内権限がクリアされる | -    |
| ログセキュリティ   | ログにPII/APIキーが含まれない設計                    | -    |

### ステップ4: simpler alternative 検討

| 代替案                                       | 評価                                         | 採否   |
| -------------------------------------------- | -------------------------------------------- | ------ |
| retry なしで即 abort                         | シンプルだが UX 低下（一時的な拒否でも停止） | 不採用 |
| retry を PermissionResolver 内部に閉じ込める | 関心分離は良いが SkillExecutor のログが不足  | 不採用 |
| 全フローを SkillExecutor に集約（現設計）    | 可観測性が高く、テスト容易                   | 採用   |

### ステップ5: 判定

#### 判定基準

| 判定              | 条件                 | 対応                                      |
| ----------------- | -------------------- | ----------------------------------------- |
| PASS              | 全検証項目で問題なし | Phase 4へ進行                             |
| MINOR             | 軽微な指摘あり       | 指摘対応後 Phase 4 へ（追跡テーブル記録） |
| MAJOR（要件問題） | 要件に重大な問題     | Phase 1 へ戻る                            |
| MAJOR（設計問題） | 設計に重大な問題     | Phase 2 へ戻る                            |

#### MINOR 追跡テーブル

| MINOR ID                           | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ---------------------------------- | -------- | ------------- | ------------- | ---- |
| （該当なしの場合は「なし」と記載） | -        | -             | -             | -    |

## 統合テスト連携【必須】

abort/skip/retry/timeout 全フローの設計レビューを実施し、統合テスト観点での漏れを確認する。

| レビュー項目       | 確認内容                                           |
| ------------------ | -------------------------------------------------- |
| 統合ポイント網羅性 | SE→PR, SE→PS, SE→IPC 全ポイントが設計に含まれる    |
| 契約明確性         | 各統合ポイントの入出力型が定義されている           |
| エラー伝搬         | 各統合ポイントのエラー時の振る舞いが定義されている |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                               | 仕様参照先                                                         |
| ------------------ | -------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ       | fail-closed/セッション管理の検証が必要 | `aiworkflow-requirements: security-skill-execution.md`             |
| エラーハンドリング | AbortReason 分類の検証が必要           | `aiworkflow-requirements: error-handling.md`                       |
| アーキテクチャ     | DI/状態遷移パターンの設計整合性        | `aiworkflow-requirements: architecture-implementation-patterns.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                    | 仕様参照先                                               |
| -------------------- | ------------------------------------------- | -------------------------------------------------------- |
| バックエンド（Main） | abort/skip/retry フローの状態遷移設計の検証 | `aiworkflow-requirements: security-skill-execution.md`   |
| IPC通信              | abort/skip/retry 通知チャンネルの契約検証   | `aiworkflow-requirements: security-skill-ipc.md`         |
| Preload Bridge       | IPC チャンネル定数管理・型安全性の確認      | `aiworkflow-requirements: interfaces-agent-sdk-skill.md` |

## 成果物

| 成果物       | パス                                      | 説明                 |
| ------------ | ----------------------------------------- | -------------------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果             |
| ゲート判定   | `outputs/phase-3/gate-decision.md`        | PASS/MINOR/MAJOR判定 |

## 完了条件

- [ ] 要件妥当性検証が完了している
- [ ] 設計妥当性検証が完了している
- [ ] セキュリティレビューが完了している
- [ ] simpler alternative の検討結果が記録されている
- [ ] 判定結果（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR指摘がある場合は追跡テーブルに記録されている
- [ ] 統合テスト観点のレビューが完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 要件妥当性検証
3. 設計妥当性検証
4. セキュリティレビュー
5. simpler alternative 検討
6. 判定・成果物作成
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-abort-skip-retry-fallback --phase 3
```

## Phase 4 開始条件

- Phase 3 判定が **PASS** であること
- Phase 3 判定が **MINOR** の場合、全 MINOR 指摘が追跡テーブルに記録され、解決予定Phase が決定していること
- Phase 1-3 が全て完了していること（Phase 4 へのスキップ禁止）

## Phase 13 blocked 条件

- Phase 3 判定が **MAJOR**（要件問題）の場合: Phase 1 へ戻る。Phase 13 は blocked
- Phase 3 判定が **MAJOR**（設計問題）の場合: Phase 2 へ戻る。Phase 13 は blocked
- Phase 1-3 のいずれかが未完了の場合: Phase 13 は blocked

## 次のPhase

Phase 4: テスト作成（Phase 3 判定が PASS または MINOR 対応後の場合）
