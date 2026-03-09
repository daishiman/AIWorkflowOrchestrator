# TASK-10A-G LifecycleTestHardening - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| タスクID   | TASK-10A-G                                                         |
| 機能名     | LifecycleTestHardening                                             |
| 作成日     | 2026-03-09                                                         |
| ステータス | Phase 1-13 完了                                                    |
| 総Phase数  | 13                                                                 |
| 依存タスク | TASK-10A-E（IPC契約定義）, TASK-10A-F（Store駆動ライフサイクルUI） |
| 優先度     | high                                                               |
| 複雑度     | medium                                                             |
| タグ       | frontend, backend, integration, test, ipc                          |

---

## 目的

TASK-10A-E と TASK-10A-F で定義された契約・状態遷移を、Main IPCテストとChatPanel起点統合テストで保護する。結線不良と契約ドリフトを実装前に検知できる品質ゲートを構築する。

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 完了       |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 完了       |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | PASS       |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了       |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 完了       |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了       |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | PASS       |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了       |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | PASS       |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | PASS       |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了       |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了       |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 完了       |

---

## SubAgent分担

| SubAgent | 担当領域                                | 実行順              |
| -------- | --------------------------------------- | ------------------- |
| G1       | Main IPC `skill:create` 契約テスト仕様  | 並列（G2と同時）    |
| G2       | Renderer統合（ChatPanel起点）テスト仕様 | 並列（G1と同時）    |
| G3       | 既存テスト群との整合/ゲート統合         | 直列（G1/G2完了後） |

---

## 実行フロー

```
Phase 1 -> Phase 2 -> Phase 3 (Gate) -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7
                         |                                      |
                    (MAJOR->戻り)                           (未達->戻り)
                         |                                      |
Phase 8 -> Phase 9 -> Phase 10 (Gate) -> Phase 11 -> Phase 12 -> Phase 13 -> 完了
                         |
                    (MAJOR->戻り)
```

### 並列実行可能なPhase群

| グループ   | Phase群 | 備考                 |
| ---------- | ------- | -------------------- |
| 設計系     | 1-3     | 直列（依存関係あり） |
| テスト系   | 4-7     | G1/G2は並列実行可能  |
| 品質検証系 | 8-10    | 直列                 |
| 完了系     | 11-13   | 直列                 |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物一覧

| Phase | 主要成果物                                                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義書（FR/NFR/受入基準）                                                                                                                           |
| 2     | テストアーキテクチャ設計書（3層構成/モック戦略/テストデータ設計）                                                                                       |
| 3     | 設計レビュー結果（PASS/MINOR/MAJOR判定）                                                                                                                |
| 4     | テストコード（skillHandlers.create.test.ts, SkillLifecycle.integration.test.tsx）                                                                       |
| 5     | テストコード実装完了（全テストPASS）                                                                                                                    |
| 6     | ChatPanel.skill-management.test.tsx 修正完了                                                                                                            |
| 7     | カバレッジレポート（Line 80%+, Branch 60%+）                                                                                                            |
| 8     | リファクタリング済みテストコード                                                                                                                        |
| 9     | 品質検証結果（Lint/TypeCheck/全テストPASS）                                                                                                             |
| 10    | 最終レビュー結果                                                                                                                                        |
| 11    | 手動テスト検証結果                                                                                                                                      |
| 12    | ドキュメント更新（implementation-guide.md, spec-update-summary.md, documentation-changelog.md, unassigned-task-detection.md, skill-feedback-report.md） |
| 13    | PR作成完了                                                                                                                                              |

### コード成果物

| 成果物                                  | パス                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------ |
| skillHandlers.create.test.ts            | `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`                         |
| SkillLifecycle.integration.test.tsx     | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` |
| ChatPanel.skill-management.test.tsx修正 | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  |

---

## 参照資料

| 参照資料                | パス                                                                                                                    | 使用目的                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| resource-map            | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                        | テスト実装/コンポーネントテスト導線抽出          |
| quick-reference         | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                     | IPCパターン/Resultパターン確認                   |
| IPC API仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                    | `skill:create` 契約確認                          |
| Skillインターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                       | UI側期待契約確認                                 |
| ChatPanel UI仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                                          | ChatPanel 起点導線の公開契約確認                 |
| 状態管理                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                            | Store駆動ライフサイクル/`useShallow`             |
| 実装パターン            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                             | ChatPanel/派生selectorパターン                   |
| UI機能仕様              | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                         | SkillCreateWizard / SkillAnalysisView の責務境界 |
| IPCセキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                            | sender/P42検証観点                               |
| IPC契約チェック         | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                           | request/response/エラー整合確認                  |
| セキュリティ原則        | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                                              | 最小権限と境界防御の観点固定                     |
| テストパターン          | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                                       | 統合テスト構成                                   |
| 品質要件                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                             | カバレッジ/品質ゲート                            |
| エラー仕様              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                   | 異常系期待値                                     |
| 教訓                    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                  | P9/P31/P39/P40/P42/P48の再発防止                 |
| タスク運用ルール        | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                                              | テストゲートの合否判定基準固定                   |
| TASK-10A-F 引き渡し設計 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`                                         | RT-01〜RT-07 の回帰観点を固定                    |
| TASK-10A-E 引き渡し条件 | `docs/30-workflows/completed-tasks/task-043a-ipc-contract-and-security-alignment/outputs/phase-10/handover-criteria.md` | sender/P42/エラー基準の固定                      |
| Phase 11/12 ガイド      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                             | Phase 11/12 完了条件確認                         |
| 仕様更新ワークフロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                          | Step 1-A〜Step 2 の実行順序確認                  |

---

## Phase 12 特記

Phase 12 は `task-specification-creator` の必須5成果物に合わせて、最低でも以下を `outputs/phase-12/` に揃える。

- `implementation-guide.md`
- `spec-update-summary.md`
- `documentation-changelog.md`
- `unassigned-task-detection.md`
- `skill-feedback-report.md`

`test-documentation.md` は本タスク固有の追加成果物として保持し、上記必須5成果物の代替にはしない。

## Phase 13 実行ガード

Phase 13 のコミット・PR作成は、ユーザーの明示許可が出た場合のみ実行する。

_このファイルは TASK-10A-G 仕様書として作成されました。_
_最終更新: 2026-03-09_
