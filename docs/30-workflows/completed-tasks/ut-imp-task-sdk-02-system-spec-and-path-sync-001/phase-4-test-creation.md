# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 4                                     |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

docs-only remediation の完了判定に必要な grep、validator、index 生成、parity 確認コマンドを test matrix として固定する。

## 実行タスク

- old path 残存検知コマンドを定義する
- 未完了表現の残存検知コマンドを定義する
- workflow 構造 validator を定義する
- Phase 12 implementation guide validator を定義する
- index 再生成と mirror/parity 確認コマンドを定義する

## 参照資料

| 資料名              | パス                                              | 説明              |
| ------------------- | ------------------------------------------------- | ----------------- |
| Phase 3 レビュー    | `phase-3-design-review.md`                        | test focus        |
| review gate summary | `outputs/phase-3/design-review-gate.md`           | blocker / minor   |
| Phase 2 成果物      | `outputs/phase-2/canonical-sync-target-matrix.md` | lane ごとの更新順 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                                              | 内容                     |
| -------- | ------------------------------------------------------------------------------------------------- | ------------------------ |
| lessons  | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | validator 実測値の残し方 |

## 実行手順

### ステップ1: grep 観点を作る

- `future state owner`
- `../root-workflow-pack`
- `../step-03-par-task-03`
- `../step-03-par-task-04`
- `更新予定|後でやる|後続判断待ち`

### ステップ2: validator 観点を作る

- `verify-all-specs`
- `validate-phase12-implementation-guide`

### ステップ3: 整合観点を作る

- `generate-index`
- `diff -qr` または mirror parity 確認

## 統合テスト連携

- docs-only remediation の統合ゲートは `rg`、`verify-all-specs`、Phase 12 guide validator、index 再生成の4本で構成する。
- Phase 4 ではコマンドと期待結果を固定し、後続PhaseのレビューとQAが同一手順を再利用できる状態にする。

## 成果物

| 成果物      | パス                             | 説明               |
| ----------- | -------------------------------- | ------------------ |
| テスト作成  | `phase-4-test-creation.md`       | 検証戦略           |
| test matrix | `outputs/phase-4/test-matrix.md` | コマンドと期待結果 |

## 完了条件

- [ ] grep 観点が old path / 未完了表現 / parentWorkflow drift を覆っている
- [ ] validator 観点が workflow 構造と Phase 12 guide を覆っている
- [ ] index / mirror parity の確認手順がある
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. grep / validator / parity コマンドの定義
3. 統合テスト連携の固定
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] 後続Phaseが同一コマンドを再利用できる
