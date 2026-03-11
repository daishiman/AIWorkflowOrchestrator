# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                                             |
| ---------- | -------------------------------------------------------------- |
| Phase      | 8                                                              |
| Phase名    | リファクタリング                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-01                                        |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤                     |
| 前提Phase  | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       |
| 後続Phase  | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |
| ステータス | completed                                                      |
| 作成日     | 2026-03-11                                                     |

## 目的

導線変更後に残る重複ロジック、命名揺れ、責務の混線を整理し、後続タスクが再利用しやすい構造へ整える。

## 実行タスク

- route map 重複除去: shell / nav / view で重複する導線定義を削減する
- label 統一: 画面名、CTA、advanced 文言の表記を統一する
- ownership 整理: parent / shell / view / local state の責務を再確認し整理する
- テスト整合: リファクタ後も TC-ID と AC の追跡を維持する

## 参照資料

| 参照資料              | パス                                               | 内容           |
| --------------------- | -------------------------------------------------- | -------------- |
| requirements          | `outputs/phase-1/requirements-definition.md`       | 要件再確認     |
| responsibility matrix | `outputs/phase-2/surface-responsibility-matrix.md` | 責務正本       |
| coverage report       | `outputs/phase-7/coverage-report.md`               | 抜けと重複確認 |
| uncovered journeys    | `outputs/phase-7/uncovered-journeys.md`            | 改善対象       |
| test expansion result | `outputs/phase-6/test-expansion-result.md`         | テスト追加状況 |
| change file matrix    | `outputs/phase-5/change-file-matrix.md`            | リファクタ対象 |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                                        | 内容             |
| ---------------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| architecture patterns  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 責務分離パターン |
| state management       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | ownership        |
| development guidelines | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | 命名と実装一貫性 |
| UI navigation          | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | nav 用語統一     |

## 実行手順

1. 重複する route / label / view switch ロジックを洗い出す。
2. 正本を 1 箇所に寄せ、他は参照に切り替える。
3. 用語と責務境界を修正し、テストが保たれていることを確認する。
4. リファクタ差分と技術負債を記録する。

## 統合テスト連携

| 観点           | 連携内容                                              |
| -------------- | ----------------------------------------------------- |
| contract drift | 正本が 1 箇所に寄ったかを確認する                     |
| naming         | TC-ID と成果物の用語が一致しているかを確認する        |
| ownership      | shell / view / state の責務が戻っていないかを確認する |

## 成果物

| 成果物         | パス                                       | 説明             |
| -------------- | ------------------------------------------ | ---------------- |
| リファクタログ | `outputs/phase-8/refactoring-log.md`       | 変更理由         |
| 命名統一表     | `outputs/phase-8/naming-alignment.md`      | label / route 名 |
| 技術負債更新   | `outputs/phase-8/technical-debt-update.md` | 残課題整理       |

## 完了条件

- [x] route / label / ownership の重複が整理されている
- [x] 命名と表示名が統一されている
- [x] リファクタ後もテスト追跡が維持されている
- [x] 残る技術負債が明記されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- 後続: [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)

## サブタスク管理

- [x] 参照資料確認
- [x] 重複洗い出し
- [x] 正本寄せ
- [x] 命名統一
- [x] 成果物作成

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] 正本が一意になっている
- [x] 技術負債が記録されている

## 次のPhase

Phase 9: [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
