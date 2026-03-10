---
id: TASK-10A-G
tier: 2
title: スキルライフサイクル統合テスト強化
phase: 12
depends_on: [TASK-10A-E, TASK-10A-F]
parallel_with: []
blocks: []
status: in_progress
priority: high
estimated_complexity: medium
tags: [frontend, backend, integration, test, ipc]

execution:
  mode: sequential
  timeout_minutes: 75
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts
    - apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
  modifies:
    - apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
---

# スキルライフサイクル統合テスト強化

## メタ情報

| 項目       | 値                                                    |
| ---------- | ----------------------------------------------------- |
| 担当       | SubAgent-G（品質ゲート統合）                          |
| 実行モード | 実装・検証完了（コミット・PRなし）                    |
| 関心ごと   | `create/analyze/improve` の回帰防止テストを統合で固定 |

## 目的

`TASK-10A-E` と `TASK-10A-F` で定義された契約・状態遷移を、Main IPCテストとChatPanel起点統合テストで保護する仕様を定義する。結線不良と契約ドリフトを実装前に検知できる品質ゲートを構築する。

## Atent Team 分担（関心ごと分離）

| SubAgent | 担当領域                                | 実行順          |
| -------- | --------------------------------------- | --------------- |
| G1       | Main IPC `skill:create` 契約テスト仕様  | 並列            |
| G2       | Renderer統合（ChatPanel起点）テスト仕様 | 並列            |
| G3       | 既存テスト群との整合/ゲート統合         | 直列（G1/G2後） |

## 実行タスク

- Main IPCの入力検証・委譲・エラー系テスト仕様を定義する
- ChatPanel起点の create→list→analyze→improve 遷移テスト仕様を定義する
- 既存テストとの整合条件と失敗時切り分け手順を定義する
- 最終品質ゲート（typecheck + 対象テスト）を定義する

## 参照資料（aiworkflow-requirements）

| 参照資料              | パス                                                                              | 使用目的                                |
| --------------------- | --------------------------------------------------------------------------------- | --------------------------------------- |
| resource-map          | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | テスト実装/コンポーネントテスト導線抽出 |
| quick-reference       | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`               | IPCパターン・Resultパターン確認         |
| IPC API仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | `skill:create` 契約確認                 |
| Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | UI側期待契約確認                        |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender/P42検証観点                      |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | 最小権限と境界防御の観点を固定          |
| テストパターン        | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 統合テスト構成                          |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ・品質ゲート                  |
| エラー仕様            | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 異常系期待値                            |
| タスク運用ルール      | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`        | テストゲートの合否判定基準を固定        |

## aiworkflow抽出トレーサビリティ

| 抽出ステップ | 根拠                    | 結果                                             |
| ------------ | ----------------------- | ------------------------------------------------ |
| タスク分類   | `resource-map.md`       | API設計 + テスト実装 + コンポーネントテスト      |
| パターン固定 | `quick-reference.md`    | IPC/Resultパターンで期待値表現を統一             |
| 正本抽出     | `api-ipc-agent.md` ほか | Main契約・UI契約・セキュリティ・品質の観点を確定 |

## 実行手順

1. `skill:create` の入力バリデーション・委譲・エラー返却をテストケース化する。
2. ChatPanel起点のライフサイクル遷移を統合テストケース化する。
3. 既存テストとの競合点を洗い出し、モック整合ルールを定義する。
4. 失敗時の切り分け順序（Main→Renderer→統合）を定義する。
5. 最終ゲート条件（typecheck・対象テスト・回帰ゼロ）を明記する。

## 成果物

| 成果物               | パス                                              | 説明                              |
| -------------------- | ------------------------------------------------- | --------------------------------- |
| 統合テスト強化仕様書 | `task-045-task-10a-g-lifecycle-test-hardening.md` | Main/UI統合テスト設計と品質ゲート |

## 完了条件

- [ ] Main IPC `skill:create` テスト仕様が定義されている
- [ ] ChatPanel起点の統合遷移テスト仕様が定義されている
- [ ] 既存テストとの整合条件と切り分け手順が定義されている
- [ ] 最終品質ゲートが定義されている
- [ ] 本タスクでは実装・コミット・PRを行わないことが明記されている
