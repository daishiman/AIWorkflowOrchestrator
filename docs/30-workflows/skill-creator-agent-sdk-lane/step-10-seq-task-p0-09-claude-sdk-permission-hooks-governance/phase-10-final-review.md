# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 10                                     |
| 機能名 | claude-sdk-permission-hooks-governance |
| 作成日 | 2026-03-29                             |

## 目的

AC-1〜AC-6 と dynamic skill-creator 主線維持の最終判定を行う。

## 実行タスク

- AC 判定
- dynamic 読込維持確認
- denial / audit 表示確認
- 30思考法総括の確認
- canonical path / dependency drift の最終確認

## 実行手順

### ステップ1: AC を照合する

- AC-1〜AC-6 が phase 全体で満たされているか確認する

### ステップ2: 30思考法を総括する

- 30 観点のうち未使用のものがないか確認する

### ステップ3: gate を判定する

- PASS / MINOR / MAJOR / CRITICAL を決める
- 戻り先を曖昧にしない

## 判定基準

| 判定     | 条件                              | 戻り先                        |
| -------- | --------------------------------- | ----------------------------- |
| PASS     | AC-1〜AC-6、4条件、30思考法が揃う | Phase 11                      |
| MINOR    | 軽微な差分のみ                    | Phase 9 / 12 で補完後に再判定 |
| MAJOR    | 設計や実装の前提がずれる          | Phase 8 へ戻す                |
| CRITICAL | 安全境界や動的読込主線が壊れる    | Phase 1 へ戻す                |

## 参照資料

| 資料名              | パス                                                                               | 説明              |
| ------------------- | ---------------------------------------------------------------------------------- | ----------------- |
| index               | `index.md`                                                                         | 受入基準          |
| Phase 9             | `phase-9-quality-assurance.md`                                                     | 品質ゲート        |
| Phase 8-10 template | `.claude/skills/task-specification-creator/references/phase-template-phase8-10.md` | final review 正本 |

## 成果物

| 成果物              | パス                                      | 説明     |
| ------------------- | ----------------------------------------- | -------- |
| final review result | `outputs/phase-10/final-review-result.md` | 最終判定 |
| gate decision log   | `outputs/phase-10/gate-decision-log.md`   | 判定理由 |

## 完了条件

- [x] AC 判定が完了している
- [x] 30思考法の総括がある
- [x] 4条件の再判定がある
- [x] canonical path drift が 0 件である
- [x] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

- Phase 7 / 9 の結果を最終判定へ持ち込む
- Phase 11 で観測する論点を gate 判定に残す

## 多角的チェック観点（AIが判断）

- 変更分が skill 原文に対して漏れなく反映されているか
- 30思考法の分析結果が単なるメモで終わっていないか
- 既存実装の破棄判断が必要なのに patch 前提で閉じていないか

## サブタスク管理

| SubAgent   | 責務                       |
| ---------- | -------------------------- |
| SubAgent-A | AC 判定                    |
| SubAgent-B | 30思考法総括               |
| SubAgent-C | canonical path / 4条件確認 |

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

Phase 11: 手動テスト
