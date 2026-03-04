# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 6                                                        |
| 名称       | テスト拡充                                               |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 |
| 作成日     | 2026-03-04                                               |
| 依存       | Phase 5                                                  |
| ステータス | Draft                                                    |

## 目的

コマンド公開運用の失敗パターンを回帰テストへ取り込み、再発率を下げる。

## 実行タスク

- 失敗系テスト追加: scripts 未登録、文書未同期、残存文字列を検出するケースを追加する。
- 回帰ケース拡張: screenshot 実行コマンドの命名規約逸脱を検出するケースを追加する。
- 監査連携拡張: unassigned 監査と coverage 監査の同時実行手順を追加する。

## 参照資料

| 資料           | パス                                                                                        | 用途                  |
| -------------- | ------------------------------------------------------------------------------------------- | --------------------- |
| Phase 5        | `phase-5-implementation.md`                                                                 | 実装結果参照          |
| Phase 5成果物  | `outputs/phase-5/command-run-log.md`                                                        | 実行証跡参照          |
| Phase 4成果物  | `outputs/phase-4/test-cases.md`                                                             | ベースケース          |
| 監査スクリプト | `.claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js` | coverage 判定         |
| 監査スクリプト | `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`               | current/baseline 判定 |
| aiworkflow教訓 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発パターン参照      |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                                     | Phase 4 成果物        |
| 統合テスト設計 | `outputs/phase-4/integration-test-design.md`                                                | Phase 4 成果物        |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md`                                                 | Phase 5 成果物        |
| 変更差分一覧   | `outputs/phase-5/changed-files.md`                                                          | Phase 5 成果物        |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                                        | 内容     |
| ------------ | ------------------------------------------------------------------------------------------- | -------- |
| quality要件  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 回帰基準 |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 監査順序 |

## 実行手順

### Step 1: 失敗系ケース追加

- TC-07: `package.json` から scripts を除外した仮想差分で run 一覧が空になることを検証する。
- TC-08: 文書から新コマンド記法を除外した仮想差分で `rg` 検出が非ゼロになることを検証する。
- TC-09: 旧コマンド文字列残存時にレビューエラーを出力することを検証する。

### Step 2: 回帰ケース追加

- TC-10: `screenshot:skill-import-idempotency-guard` 命名の完全一致を検証する。
- TC-11: 近似名 `screenshot:skill-import-idempotency` を誤検知しないことを検証する。
- TC-12: 実行ログに `run screenshot:skill-import-idempotency-guard` が記録されることを検証する。

### Step 3: 監査連携追加

1. `validate-phase11-screenshot-coverage` を実行する。
2. `audit-unassigned-tasks --json --diff-from HEAD` を実行する。
3. `currentViolations.total` と `baselineViolations.total` を分離記録する。

## 統合テスト連携

| 連携対象 | 連携内容                            |
| -------- | ----------------------------------- |
| Phase 7  | TC-01〜TC-12 をカバレッジ判定へ投入 |
| Phase 9  | 失敗ケースの再発防止確認へ投入      |

## 成果物

| 成果物             | パス                                       | 説明                  |
| ------------------ | ------------------------------------------ | --------------------- |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md` | 追加ケース概要        |
| 回帰テスト一覧     | `outputs/phase-6/regression-matrix.md`     | TC-07〜TC-12          |
| 監査ログ           | `outputs/phase-6/audit-split-log.md`       | current/baseline 記録 |

## 完了条件

- [ ] TC-07〜TC-12 が定義されている
- [ ] 監査連携の 3 手順が定義されている
- [ ] current/baseline 分離記録形式が定義されている
- [ ] Phase 7 へ渡す回帰マトリクスが作成されている
- [ ] 失敗系ケースの期待値が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 7 でテストカバレッジ判定を実施する。

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
