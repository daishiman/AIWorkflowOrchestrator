# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 10                                                          |
| Phase名    | 最終レビュー                                                |
| タスクID   | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001                  |
| 前提Phase  | Phase 4（テスト作成）、Phase 5（実装）、Phase 9（品質検証） |
| 後続Phase  | Phase 11（手動テスト）                                      |
| ステータス | not_started                                                 |
| 作成日     | 2026-03-14                                                  |
| 機能名     | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001                |

## 目的

`chatEditHandlers` の workspacePath セキュリティ検証テスト（TC-WS-01〜06）の release 可否を多角的観点でレビューする。テスト網羅性・セキュリティ要件充足・カバレッジ基準・既存テストへの影響を総合的に判断し、PASS/MINOR/MAJOR/CRITICAL の判定を行う。

## 実行タスク

- **全テストケース PASS 確認**: TC-WS-01〜06 が全て PASS であることを最終確認する
- **Branch Coverage 確認**: `chatEditHandlers.ts` の workspacePath 制約ガードにおいて Branch Coverage 70% 以上を達成していることを確認する
- **既存テストへの影響確認**: 新規テストファイルが既存のテストスイートに干渉していないことを確認する
- **セキュリティ要件充足確認**: TC-WS-04（パストラバーサル）が OWASP Path Traversal 要件を満たしていることを確認する
- **レビュー判定**: PASS/MINOR/MAJOR/CRITICAL を判定し、判定根拠を記録する

## レビュー観点

### テスト網羅性

| チェック項目                                                  | 期待状態 |
| ------------------------------------------------------------- | -------- |
| TC-WS-01: workspace 内ファイルが success: true を返す         | PASS     |
| TC-WS-02: workspace 外ファイルが PERMISSION_DENIED を返す     | PASS     |
| TC-WS-03: workspacePath 未指定で `isAllowedPath` が未呼び出し | PASS     |
| TC-WS-04: パストラバーサル攻撃が PERMISSION_DENIED を返す     | PASS     |
| TC-WS-05: 複数コンテキストのうち1つが外部で PERMISSION_DENIED | PASS     |
| TC-WS-06: 空コンテキスト配列で `isAllowedPath` が未呼び出し   | PASS     |

### セキュリティ要件

- `isAllowedPath` が workspace 外アクセスを確実にブロックしているか
- パストラバーサル攻撃（`../../../etc/passwd`）に対する防御が機能しているか
- PERMISSION_DENIED エラーコードが正確に返されているか（error envelope 契約）
- workspacePath 未設定時に `isAllowedPath` を呼び出さない安全な分岐になっているか

### カバレッジ基準

| 指標              | 最低基準    | 推奨基準 |
| ----------------- | ----------- | -------- |
| Line Coverage     | 80%         | 90%      |
| Branch Coverage   | 70%（必達） | 80%      |
| Function Coverage | 80%         | 90%      |

### 既存テストへの影響

- `chatEditHandlers` の既存テスト（存在する場合）に干渉していないか
- `vi.mock` のスコープが適切で他のテストスイートに漏れていないか
- テスト実行順序に依存した設計になっていないか（P9 対策）

## レビューゲート

最終レビューの判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定     | 条件                                                                | 次のアクション                                       |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| PASS     | TC-WS-01〜06 全 PASS、Branch Coverage 70% 以上、リグレッション 0 件 | Phase 11 に進む                                      |
| MINOR    | 軽微な指摘あり（テスト可読性・コメント不足）                        | 指摘を未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | テストケースの抜け漏れ、Coverage 未達、セキュリティ要件不足         | 下表の戻り先へ戻す                                   |
| CRITICAL | workspacePath 制約ガード自体の設計問題が発覚                        | Phase 1 へ戻して要件再確認                           |

| 問題の種類                         | 戻り先                                                |
| ---------------------------------- | ----------------------------------------------------- |
| テスト設計の問題（TC 抜け漏れ）    | Phase 4（テスト作成）                                 |
| 実装の問題（ガードロジックの欠陥） | Phase 5（実装）                                       |
| カバレッジ未達                     | Phase 6（テスト拡充）                                 |
| 品質の問題（Lint・型エラー残存）   | Phase 8（リファクタリング）または Phase 9（品質検証） |

> **MINOR 判定時の必須対応**: MINOR 指摘は「機能影響なし」でも全て未タスク仕様書に変換する（省略不可）。省略すると P4 パターン再発のリスクがある。

## 参照資料

依存Phase: Phase 1 / Phase 2 / Phase 5

| 参照資料              | パス                                                                                          | 内容                                     |
| --------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 4（テスト作成） | `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-4-test-creation.md`     | テスト設計の前提を確認する               |
| Phase 5（実装）       | `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-5-implementation.md`    | workspacePath 制約ガードの実装を確認する |
| Phase 9（品質検証）   | `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/phase-9-quality-assurance.md` | 品質チェックリストの結果を参照する       |
| テストファイル        | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts`           | 最終確認対象のテストコード               |
| 実装ファイル          | `apps/desktop/src/main/ipc/chatEditHandlers.ts`                                               | workspacePath 制約ガードの実装           |

### システム仕様（aiworkflow-requirements）

> 最終レビュー前に以下の正本仕様を確認し、実装・テストとの整合性を確保する。

| 参照資料                   | パス                                                                              | 内容                                              |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| security-electron-ipc-core | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | パストラバーサル防止・sender 検証・workspace 境界 |
| api-ipc-agent-core         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`         | `chat-edit:*` 契約・`PERMISSION_DENIED` 定義      |
| llm-workspace-chat-edit    | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    | workspacePath 検証仕様                            |

## 実行手順

### ステップ1: 参照資料を確認する

Phase 4〜9 の成果物と実装ファイルを確認し、最終レビューの対象範囲を固定する。

### ステップ2: テストケース全 PASS を最終確認する

```bash
cd apps/desktop && pnpm exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts
```

TC-WS-01〜06 の全テストが PASS であることを確認し、結果をレビュー報告に記録する。

### ステップ3: Branch Coverage を確認する

```bash
cd apps/desktop && pnpm exec vitest run --coverage src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts
```

`chatEditHandlers.ts` の workspacePath 制約ガードの Branch Coverage が 70% 以上であることを確認する。

### ステップ4: 既存テストへの影響を確認する

```bash
pnpm --filter @repo/desktop test
```

全テストスイートを実行し、リグレッションが 0 件であることを最終確認する。

### ステップ5: セキュリティ要件充足を確認する

TC-WS-04 のパストラバーサルテストが OWASP Path Traversal 要件を満たしていることを確認する。具体的には `../../../etc/passwd` のようなパスが workspace 外として正しく判定されていることを確認する。

### ステップ6: レビュー判定を行い成果物を記録する

PASS/MINOR/MAJOR/CRITICAL を判定し、判定根拠と MINOR 指摘（ある場合）を `final-review-report.md` に記録する。MINOR の場合は未タスク仕様書を作成する（省略不可）。

## 統合テスト連携【必須】

最終レビューでは以下の統合観点を確認する。

- workspacePath 制約ガードが IPC セキュリティ原則（sender 検証・パストラバーサル防止）と整合しているか
- PERMISSION_DENIED エラーの error envelope フォーマットが `api-ipc-agent-core.md` の契約に準拠しているか
- `isAllowedPath` の未呼び出しアサーション（TC-WS-03、TC-WS-06）が正確に検証されているか

## 多角的チェック観点（AIが判断）

- TC-WS-05（複数コンテキストのうち1つが外部）が「最初の違反で即 PERMISSION_DENIED」という設計になっているか
- `isAllowedPath` が `workspacePath` と相対パス解決を正しく組み合わせているか（`path.resolve` 使用）
- テストの mock が実装の `isAllowedPath` 呼び出し契約と一致しているか（P44: IPC引数命名の契約ドリフト防止）
- Phase 9 で検出した品質 blocker が全て解消されているか

## 成果物

| 成果物           | パス                                                                                                     | 内容                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 最終レビュー報告 | `docs/30-workflows/TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001/outputs/phase-10/final-review-report.md` | 判定結果・根拠・MINOR 指摘（ある場合）を記録する |

## 完了条件

- [ ] TC-WS-01〜06 の全テストが PASS であることを最終確認した
- [ ] Branch Coverage 70% 以上を達成していることを確認した
- [ ] 既存テストへのリグレッションが 0 件であることを確認した
- [ ] MINOR 判定の場合、全指摘を未タスク仕様書に変換した（省略不可）
- [ ] MAJOR/CRITICAL の場合、戻り先 Phase を明確に記録した
- [ ] `final-review-report.md` に判定結果と根拠が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

| サブタスク                                | 担当  | ステータス            |
| ----------------------------------------- | ----- | --------------------- |
| TC-WS-01〜06 全 PASS 最終確認             | agent | not_started           |
| Branch Coverage 70% 以上確認              | agent | not_started           |
| 全テストスイート実行・リグレッション確認  | agent | not_started           |
| セキュリティ要件充足確認                  | agent | not_started           |
| レビュー判定・final-review-report.md 作成 | agent | not_started           |
| MINOR 判定時の未タスク仕様書作成          | agent | not_started（該当時） |

## タスク100%実行確認【必須】

Phase 10 完了前に以下を確認する。

- [ ] TC-WS-01〜06 全テストの PASS を確認するコマンドを実行した
- [ ] Branch Coverage が 70% 以上であることをコマンドで確認した
- [ ] レビュー判定（PASS/MINOR/MAJOR/CRITICAL）を明確に記録した
- [ ] MINOR 判定の場合、未タスク仕様書を作成した（省略した場合は P4 パターン再発）
- [ ] `final-review-report.md` が作成されている

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md) に進む
