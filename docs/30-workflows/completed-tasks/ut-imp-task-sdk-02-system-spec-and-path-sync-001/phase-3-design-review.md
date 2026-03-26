# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 3                                     |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

Phase 1-2 の設計が partial update を防ぎ、Phase 4 以降の docs-only remediation を安全に実行できるかを判定する。

## 実行タスク

- current fact の基準が 1 つに定まっているかをレビューする
- same-wave 更新対象の漏れがないかをレビューする
- old path / 未完了表現 / parity drift の検知観点をレビューする
- Phase 4 の test matrix へ渡す観点を固定する

## 参照資料

| 資料名             | パス                                              | 説明                     |
| ------------------ | ------------------------------------------------- | ------------------------ |
| Phase 1 要件       | `phase-1-requirements.md`                         | acceptance と drift 分類 |
| Phase 2 設計       | `phase-2-design.md`                               | レーンと順番             |
| sync target matrix | `outputs/phase-2/canonical-sync-target-matrix.md` | レビュー対象表           |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                              | 内容                        |
| ---------------- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | current fact の検証         |
| lessons          | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | 未完了表現 / parity の gate |

## 実行手順

### ステップ1: blocker 判定

- current fact の基準が複数ある場合は blocker。
- same-wave 更新対象が system spec か workflow local のどちらかに偏る場合は blocker。

### ステップ2: minor 判定

- validation 観点があるがコマンドが不足している場合は minor。
- follow-up no-op 根拠の書き先が曖昧な場合は minor。

### ステップ3: Phase 4 引き渡し

- `rg` 観点、validator 観点、index 再生成観点を test matrix に引き渡す。

## 統合テスト連携

- Phase 3 は `outputs/phase-4/test-matrix.md` へ渡す review gate を固定し、grep / validator / index 再生成の3系統が揃っているかを確認する。
- Blocker が 0 件でなければ Phase 4 へ進めず、統合ゲート未成立として扱う。

## 成果物

| 成果物              | パス                                    | 説明                   |
| ------------------- | --------------------------------------- | ---------------------- |
| 設計レビュー        | `phase-3-design-review.md`              | gate 判定              |
| review gate summary | `outputs/phase-3/design-review-gate.md` | PASS / MINOR / BLOCKER |

## 完了条件

- [ ] blocker が 0 件である
- [ ] same-wave 対象漏れがない
- [ ] Phase 4 の test focus が固定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. blocker / minor / pass の判定
3. 統合テスト連携の確認
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 4 へ引き継ぐ gate 条件が固定されている
