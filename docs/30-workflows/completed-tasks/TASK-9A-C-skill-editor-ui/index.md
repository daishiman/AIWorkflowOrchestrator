# TASK-9A-C: SkillEditor コンポーネント実装 - ワークフロー

## 概要

スキルファイルを編集するための UI コンポーネント群を実装する。
ファイルツリーサイドバー、コードエディター、保存/閉じるツールバーを備えた SkillEditor Organism コンポーネントと、テキストエリアベースの SkillCodeEditor Molecule コンポーネントを新規作成する。

TASK-9A-B（ファイル編集 IPC ハンドラ）で実装される `readFile` / `writeFile` IPC メソッドを Renderer 層から呼び出し、スキルのサブリソースファイルを閲覧・編集・保存する機能を提供する。

## Phase 一覧

| Phase | 名称             | ステータス     | 仕様書                                                                 |
| ----- | ---------------- | -------------- | ---------------------------------------------------------------------- |
| 1     | 要件定義         | 完了           | [phase-1-requirements.md](./phase-1-requirements.md)                   |
| 2     | 設計             | 仕様書作成済み | [phase-2-design.md](./phase-2-design.md)                               |
| 3     | 設計レビュー     | 仕様書作成済み | [phase-3-design-review.md](./phase-3-design-review.md)                 |
| 4     | テスト作成       | 仕様書作成済み | [phase-4-test-creation.md](./phase-4-test-creation.md)                 |
| 5     | 実装             | 仕様書作成済み | [phase-5-implementation.md](./phase-5-implementation.md)               |
| 6     | テスト拡充       | 仕様書作成済み | [phase-6-test-expansion.md](./phase-6-test-expansion.md)               |
| 7     | カバレッジ確認   | 仕様書作成済み | [phase-7-coverage-verification.md](./phase-7-coverage-verification.md) |
| 8     | リファクタリング | 仕様書作成済み | [phase-8-refactoring.md](./phase-8-refactoring.md)                     |
| 9     | 品質検証         | 監査完了       | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)         |
| 10    | 最終レビュー     | 監査完了       | [phase-10-final-review.md](./phase-10-final-review.md)                 |
| 11    | 手動テスト       | 監査完了       | [phase-11-manual-testing.md](./phase-11-manual-testing.md)             |
| 12    | ドキュメント     | 監査完了       | [phase-12-documentation.md](./phase-12-documentation.md)               |
| 13    | PR作成           | 仕様書作成済み | [phase-13-pr-creation.md](./phase-13-pr-creation.md)                   |

## タスク情報

| 項目         | 値                                                               |
| ------------ | ---------------------------------------------------------------- |
| タスク ID    | TASK-9A-C                                                        |
| タイトル     | SkillEditor コンポーネント実装                                   |
| タグ         | frontend, renderer, ui, editor                                   |
| 推定複雑度   | medium                                                           |
| 依存タスク   | TASK-9A-B（ファイル編集 IPC ハンドラ）                           |
| ブロック     | TASK-10A（スキルライフサイクル）                                 |
| 出力ファイル | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`     |
|              | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` |

## 依存関係図

```
TASK-9A-A (SkillFileManager)
  ↓
TASK-9A-B (IPC ファイルハンドラ: readFile / writeFile)
  ↓
TASK-9A-C (SkillEditor UI コンポーネント)  ← 本タスク
  ↓
TASK-10A (スキルライフサイクル)
```

## 参照仕様書

| ドキュメント                     | パス                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| UI コンポーネント仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     |
| UI 設計原則                      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              |
| デザインシステム                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  |
| 機能コンポーネント仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             |
| アーキテクチャ概要               | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                |
| 実装パターン                     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| Agent SDK Skill インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           |
| Electron IPC セキュリティ        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| セキュア API                     | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                |
| エラーハンドリング               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       |
| 状態管理                         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                |
