# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 4                                                        |
| 名称       | テスト作成                                               |
| タスクID   | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 |
| 作成日     | 2026-03-04                                               |
| 依存       | Phase 1, Phase 2, Phase 3                                |
| ステータス | Draft                                                    |

## 目的

scripts 登録、文書同期、検証コマンドの三領域をテスト仕様として分離し、実装前に成功条件を固定する。

## 実行タスク

- テスト観点定義: 機能・品質・回帰の観点を定義する。
- テストケース作成: コマンド発見・実行・文書同期・監査をケース化する。
- 失敗ケース定義: 想定失敗と期待エラーを定義する。

## 参照資料

| 資料               | パス                                                                        | 用途           |
| ------------------ | --------------------------------------------------------------------------- | -------------- |
| Phase 1            | `phase-1-requirements.md`                                                   | 受入基準参照   |
| Phase 2            | `phase-2-design.md`                                                         | 設計参照       |
| Phase 3            | `phase-3-design-review.md`                                                  | ゲート判定参照 |
| Phase 1成果物      | `outputs/phase-1/acceptance-criteria.md`                                    | テスト期待値   |
| Phase 2成果物      | `outputs/phase-2/verification-commands.md`                                  | 実行順序       |
| aiworkflow品質     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト品質基準 |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`                                | Phase 1 成果物 |
| スコープ定義       | `outputs/phase-1/scope-definition.md`                                       | Phase 1 成果物 |
| 設計書             | `outputs/phase-2/architecture-design.md`                                    | Phase 2 成果物 |
| 文書同期マトリクス | `outputs/phase-2/document-sync-matrix.md`                                   | Phase 2 成果物 |
| 仕様抽出マトリクス | `outputs/phase-2/aiworkflow-spec-extraction.md`                             | Phase 2 成果物 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`                                   | Phase 3 成果物 |
| レビューコメント   | `outputs/phase-3/review-comments.md`                                        | Phase 3 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                   | 内容              |
| -------- | ---------------------------------------------------------------------- | ----------------- |
| task台帳 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | Phase 12 記録要件 |
| 教訓     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 苦戦記録要件      |

## 実行手順

### Step 1: テストスイート定義

| Suite | 対象            | 成功条件                     |
| ----- | --------------- | ---------------------------- | --------------------- |
| TS-01 | scripts 登録    | `run                         | rg screenshot` で表示 |
| TS-02 | screenshot 実行 | 対象ファイルが生成または更新 |
| TS-03 | 文書同期        | 旧コマンド文字列が 0 件      |
| TS-04 | 監査            | coverage validator が PASS   |

### Step 2: テストケース作成

- TC-01: package.json に screenshot scripts キーが存在する。
- TC-02: screenshot scripts 値が対象 script と一致する。
- TC-03: Phase 11 文書に新コマンド表記が存在する。
- TC-04: Phase 12 文書に新コマンド表記が存在する。
- TC-05: screenshot コマンド実行で証跡を再取得できる。
- TC-06: `validate-phase11-screenshot-coverage` が PASS する。

### Step 3: 失敗ケース定義

- FC-01: scripts 未登録のとき `run | rg screenshot` に対象が出ない。
- FC-02: scripts の値が誤っていると screenshot 実行が失敗する。
- FC-03: 文書に旧コマンド残存があると再利用運用が崩れる。

## 統合テスト連携

| 連携対象           | 連携内容                              |
| ------------------ | ------------------------------------- |
| Phase 5 実装       | TC-01〜TC-06 を実装チェックに使用     |
| Phase 6 テスト拡充 | FC-01〜FC-03 の追加ケースを回帰へ編入 |

## 成果物

| 成果物         | パス                                         | 説明       |
| -------------- | -------------------------------------------- | ---------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`      | テスト方針 |
| テストケース   | `outputs/phase-4/test-cases.md`              | TC/FC 一覧 |
| 統合テスト設計 | `outputs/phase-4/integration-test-design.md` | 連携要件   |

## 完了条件

- [ ] TS-01〜TS-04 が定義されている
- [ ] TC-01〜TC-06 が定義されている
- [ ] FC-01〜FC-03 が定義されている
- [ ] Phase 5 と Phase 6 への連携が記載されている
- [ ] 判定基準がコマンド単位で記載されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 5 で設計に沿って実装計画を具体化する。

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
