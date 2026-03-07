# TASK-UI-03-AGENT-VIEW-ENHANCEMENT: AIアシスタント画面リデザイン

## メタ情報

| 項目         | 値                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------ |
| タスクID     | TASK-UI-03-AGENT-VIEW-ENHANCEMENT                                                          |
| タスク名     | AIアシスタント画面リデザイン（Tap & Discover + Apple HIG準拠）                             |
| 機能名       | agent-view-enhancement                                                                     |
| 優先度       | 高（難易度低 x Impact高）                                                                  |
| 複雑度       | medium                                                                                     |
| 依存タスク   | TASK-UI-00（デザイン基盤）, TASK-UI-01（アーキテクチャ基盤）, TASK-UI-02（GlobalNavStrip） |
| ブロック対象 | なし（独立して完了可能）                                                                   |
| 作成日       | 2026-03-07                                                                                 |

## 概要

既存の AgentView を「Tap & Discover」体験に全面リデザインする。Level 1 は大きなツールチップ + 実行ボタン + 最近の実行の3要素のみで構成し、モデル選択・権限設定は Level 2（詳細設定パネル）に隠蔽する。認知負荷を最小化し、Apple HIG 準拠のデザインを実現する。

## Phase 一覧

| Phase | 名称                 | ファイル                                                       | ステータス |
| ----- | -------------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](./phase-1-requirements.md)           | spec_ready |
| 2     | 設計                 | [phase-2-design.md](./phase-2-design.md)                       | spec_ready |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](./phase-3-design-review.md)         | spec_ready |
| 4     | テスト作成           | [phase-4-test-creation.md](./phase-4-test-creation.md)         | spec_ready |
| 5     | 実装                 | [phase-5-implementation.md](./phase-5-implementation.md)       | spec_ready |
| 6     | テスト拡充           | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | spec_ready |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | spec_ready |
| 8     | リファクタリング     | [phase-8-refactoring.md](./phase-8-refactoring.md)             | spec_ready |
| 9     | 品質保証             | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | spec_ready |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](./phase-10-final-review.md)         | spec_ready |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | spec_ready |
| 12    | ドキュメント更新     | [phase-12-documentation.md](./phase-12-documentation.md)       | spec_ready |
| 13    | PR作成               | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | spec_ready |

## Phase 依存関係

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
                                                                  ↓
Phase 8 ← Phase 7
Phase 8 → Phase 9 → Phase 10 → Phase 11 → Phase 12 → Phase 13
```

## 主要コンポーネント（7サブタスク）

| Task | コンポーネント        | 種別 | 配置先                                                      |
| ---- | --------------------- | ---- | ----------------------------------------------------------- |
| 1    | SkillChip             | 新規 | `apps/desktop/src/renderer/components/organisms/AgentView/` |
| 2    | ExecuteButton         | 新規 | `apps/desktop/src/renderer/components/organisms/AgentView/` |
| 3    | FloatingExecutionBar  | 新規 | `apps/desktop/src/renderer/components/organisms/AgentView/` |
| 4    | AdvancedSettingsPanel | 新規 | `apps/desktop/src/renderer/components/organisms/AgentView/` |
| 5    | RecentExecutionList   | 新規 | `apps/desktop/src/renderer/components/organisms/AgentView/` |
| 6    | AgentView レイアウト  | 修正 | `apps/desktop/src/renderer/views/AgentView/index.tsx`       |
| 7    | agentSlice 拡張       | 修正 | `apps/desktop/src/renderer/store/slices/agentSlice.ts`      |

## 既知の落とし穴対策

| Pitfall                           | 対策                                                                                      |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| P31（Zustand無限ループ）          | 全状態アクセスは個別セレクタ経由。合成Store Hookの戻り値関数をuseEffect依存配列に含めない |
| P39（happy-dom userEvent非互換）  | テストでは `fireEvent` を使用。`userEvent` 使用禁止                                       |
| P40（テスト実行ディレクトリ依存） | `cd apps/desktop && pnpm vitest run src/...` で実行                                       |
| P24（Store型定義不統一）          | `useImportedSkills()` の返す型をそのまま使用。型アサーション回避                          |
| P47（CSS変数テストアサーション）  | variantStyles を Record 定数で外部抽出し、テスト側もimport                                |
| P46（HTMLAttributes Props型衝突） | `Omit<React.HTMLAttributes, "conflictingProp">` で衝突回避                                |

## 参照資料

| 資料                    | パス                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 元タスク仕様書          | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-058a-ui-03-agent-view-enhancement.md` |
| デザイン基盤            | TASK-UI-00                                                                                                                            |
| アーキテクチャ基盤      | TASK-UI-01                                                                                                                            |
| GlobalNavStrip          | TASK-UI-02                                                                                                                            |
| UI/UXコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                               |
| 機能コンポーネント仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                       |
| デザイン原則            | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                                        |
| UIアーキテクチャ        | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                             |
| 状態管理                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                          |
| ナビゲーション          | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                                               |

## 要件トレーサビリティ

- 一元管理: `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/requirements-traceability-matrix.md`
- `task-specification-creator` 品質基準と `aiworkflow-requirements` 抽出根拠を統合管理

## 検証コマンド

```bash
# 全体整合性検証
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement

# Phase出力検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement

# artifacts.json 確認
cat docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/artifacts.json
```
