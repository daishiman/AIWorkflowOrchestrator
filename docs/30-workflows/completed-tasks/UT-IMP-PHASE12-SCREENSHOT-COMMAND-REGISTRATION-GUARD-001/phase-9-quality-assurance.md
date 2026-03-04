# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 9                                                        |
| 名称       | 品質保証                                                 |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 |
| 作成日     | 2026-03-04                                               |
| 依存       | Phase 5                                                  |
| ステータス | Draft                                                    |

## 目的

実装・テスト・監査の証跡を横断確認し、Phase 10 ゲートに渡す品質状態を確定する。

## 実行タスク

- 品質チェック: scripts、文書、検証ログの整合を確認する。
- リスクチェック: 命名衝突、旧コマンド残存、監査値誤読の再発を確認する。
- 受入判定: Phase 10 へ進む条件を文書化する。

## 参照資料

| 資料             | パス                                                                        | 用途           |
| ---------------- | --------------------------------------------------------------------------- | -------------- |
| Phase 5          | `phase-5-implementation.md`                                                 | 実装確認       |
| Phase 6          | `phase-6-test-expansion.md`                                                 | 回帰確認       |
| Phase 7          | `phase-7-coverage-check.md`                                                 | カバレッジ確認 |
| Phase 8          | `phase-8-refactoring.md`                                                    | 改善確認       |
| Phase 5成果物    | `outputs/phase-5/implementation-summary.md`                                 | 変更確認       |
| Phase 6成果物    | `outputs/phase-6/regression-matrix.md`                                      | 回帰確認       |
| Phase 7成果物    | `outputs/phase-7/coverage-report.md`                                        | 指標確認       |
| Phase 8成果物    | `outputs/phase-8/refactoring-log.md`                                        | 改善確認       |
| aiworkflow品質   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準       |
| 変更差分一覧     | `outputs/phase-5/changed-files.md`                                          | Phase 5 成果物 |
| 実行ログ         | `outputs/phase-5/command-run-log.md`                                        | Phase 5 成果物 |
| 命名規約表       | `outputs/phase-8/naming-convention.md`                                      | Phase 8 成果物 |
| 監査テンプレート | `outputs/phase-8/audit-template.md`                                         | Phase 8 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                   | 内容             |
| -------- | ---------------------------------------------------------------------- | ---------------- |
| task台帳 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 完了記録規約     |
| 教訓     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 再発防止記録規約 |

## 実行手順

### Step 1: 品質チェックリスト実行

| チェック項目 | 判定基準                      |
| ------------ | ----------------------------- | --------------------- |
| scripts 登録 | 対象キーが存在し値が一致      |
| run 発見性   | `run                          | rg screenshot` で検出 |
| 文書同期     | 旧コマンド残存 0 件           |
| coverage     | validator PASS                |
| 監査分離     | current/baseline の両方が記録 |

### Step 2: リスク再評価

- R-1: scripts 命名の逸脱
- R-2: 旧コマンドの残存
- R-3: current/baseline 判定値の混同

### Step 3: 受入判定

- すべてのチェック項目が PASS のとき Phase 10 へ進む。
- FAIL 項目があるときは Phase 5 か Phase 6 へ戻す。

## 統合テスト連携

| 連携対象 | 連携内容                             |
| -------- | ------------------------------------ |
| Phase 10 | 品質チェックリストをゲート入力へ渡す |
| Phase 11 | 手動テスト対象ケースを確定する       |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質判定結果 |
| リスク評価表 | `outputs/phase-9/risk-review.md`    | リスク判定   |

## 完了条件

- [ ] 品質チェック 5 項目の判定が記録されている
- [ ] リスク 3 項目の評価が記録されている
- [ ] 受入判定と戻り先が明記されている
- [ ] Phase 10 へ渡す入力が整理されている
- [ ] 判定根拠のコマンドが記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 10 で最終レビューゲートを実施する。

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
