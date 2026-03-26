# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 3                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

Phase 2 の設計が downstream 契約を壊さず、実装に十分な粒度まで閉じているかをレビューで判定する。

## 実行タスク

- transition 設計の抜け漏れを確認する
- append 戦略と既存テストの両立性を確認する
- review prompt / shared contract の consumer 影響を確認する

## 参照資料

| 資料名             | パス                                    | 説明     |
| ------------------ | --------------------------------------- | -------- |
| Phase 2            | `phase-2-design.md`                     | 設計本文 |
| design review gate | `outputs/phase-3/design-review-gate.md` | 判定記録 |

## 成果物

| 成果物             | パス                                    | 説明                   |
| ------------------ | --------------------------------------- | ---------------------- |
| design review gate | `outputs/phase-3/design-review-gate.md` | Go / Hold 判定と残課題 |

## 統合テスト連携

- Phase 1 の `outputs/phase-1/spec-extraction-map.md` と Phase 2 の `outputs/phase-2/failure-transition-matrix.md` / `outputs/phase-2/artifact-history-decision.md` を読み合わせ、テストへ落とせない曖昧点が残っていないかを確認する。
- downstream 契約の確認結果は `outputs/phase-3/design-review-gate.md` に残し、Phase 4 がそのまま参照できる状態にする。

## 完了条件

- [ ] MAJOR blocker の有無が判定されている
- [ ] downstream 契約への影響が整理されている
- [ ] 実装着手に必要な前提が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**
