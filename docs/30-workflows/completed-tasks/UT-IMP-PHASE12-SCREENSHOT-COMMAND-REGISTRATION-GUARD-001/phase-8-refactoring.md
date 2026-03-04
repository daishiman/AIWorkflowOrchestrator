# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 8                                                        |
| 名称       | リファクタリング                                         |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 |
| 作成日     | 2026-03-04                                               |
| 依存       | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7              |
| ステータス | Draft                                                    |

## 目的

運用手順の重複と命名ドリフトを減らし、Phase 12 更新作業の再利用性を高める。

## 実行タスク

- 命名整理: screenshot scripts 名称規約の逸脱を修正する。
- 文書構造整理: Phase 11/12 のコマンド記述位置を統一する。
- 監査手順整理: current/baseline 分離記録のテンプレートを整備する。

## 参照資料

| 資料                   | パス                                                                                        | 用途           |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 1                | `phase-1-requirements.md`                                                                   | 目的の再確認   |
| Phase 2                | `phase-2-design.md`                                                                         | 設計方針再確認 |
| Phase 5                | `phase-5-implementation.md`                                                                 | 実装結果参照   |
| Phase 6                | `phase-6-test-expansion.md`                                                                 | 回帰ケース参照 |
| Phase 7                | `phase-7-coverage-check.md`                                                                 | 欠落分析参照   |
| aiworkflow実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 改善パターン   |
| aiworkflow教訓         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 教訓反映先     |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`                                                 | Phase 5 成果物 |
| 変更差分一覧           | `outputs/phase-5/changed-files.md`                                                          | Phase 5 成果物 |
| 実行ログ               | `outputs/phase-5/command-run-log.md`                                                        | Phase 5 成果物 |
| カバレッジレポート     | `outputs/phase-7/coverage-report.md`                                                        | Phase 7 成果物 |
| 欠落分析               | `outputs/phase-7/gap-analysis.md`                                                           | Phase 7 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                                                            | 内容             |
| ------------- | ------------------------------------------------------------------------------- | ---------------- |
| task台帳      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 更新項目整理     |
| ui/ux機能仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | UI証跡運用ルール |

## 実行手順

### Step 1: 命名規約の統一

- `screenshot:<feature>` 以外の命名を検出する。
- 違反名がある場合は置換案を作成する。

### Step 2: 文書テンプレート化

- Phase 11 と Phase 12 のコマンド記述セクションを同じ順序へ統一する。
- コマンド、目的、期待結果の 3 列テーブルを採用する。

### Step 3: 監査テンプレート化

- `currentViolations.total` と `baselineViolations.total` を同時記録するテンプレートを作る。
- `spec-update-summary.md` へ貼り付け可能な定型文を定義する。

## 統合テスト連携

| 連携対象 | 連携内容                                           |
| -------- | -------------------------------------------------- |
| Phase 9  | 命名統一結果とテンプレート採用結果を品質項目へ反映 |
| Phase 12 | 監査テンプレートを spec-update-summary へ転記      |

## 成果物

| 成果物           | パス                                   | 説明                      |
| ---------------- | -------------------------------------- | ------------------------- |
| リファクタログ   | `outputs/phase-8/refactoring-log.md`   | 改善履歴                  |
| 命名規約表       | `outputs/phase-8/naming-convention.md` | scripts 命名一覧          |
| 監査テンプレート | `outputs/phase-8/audit-template.md`    | current/baseline 記録形式 |

## 完了条件

- [ ] 命名規約違反の有無が判定されている
- [ ] 文書テンプレートが定義されている
- [ ] 監査テンプレートが定義されている
- [ ] Phase 9 と Phase 12 への引き継ぎ項目が整理されている
- [ ] 改善前後の差分が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 9 で品質保証の最終確認を行う。

## 多角的チェック観点

| 観点           | 適用内容                                                | 参照仕様                                                                                    |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| セキュリティ   | 実行コマンドの公開範囲が限定されているか                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                |
| UI/UX証跡      | Phase 11 の証跡取得コマンドが一意か                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             |
| アーキテクチャ | スクリプト実体と公開コマンドの責務が分離されているか    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` |
| 品質           | verify/validate/coverage/audit の検証順序が維持されるか | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |

## サブタスク管理

| サブタスク         | 状態    |
| ------------------ | ------- |
| 参照資料確認       | pending |
| 実行タスク実施     | pending |
| 統合テスト連携確認 | pending |
| 成果物定義確認     | pending |
| 完了条件確認       | pending |

## タスク100%実行確認【必須】

- [ ] 本Phaseの実行タスクをすべて実行した
- [ ] 本Phaseの成果物定義と参照資料を照合した
- [ ] 本Phaseの完了条件を全て満たした
- [ ] 次Phaseへ渡す入力を明記した
