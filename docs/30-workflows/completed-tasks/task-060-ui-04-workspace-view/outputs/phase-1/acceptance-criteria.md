# Phase 1 Acceptance Criteria

## 受入基準一覧

| AC   | 内容                                                                 | 検証方法                                                | 状態 |
| ---- | -------------------------------------------------------------------- | ------------------------------------------------------- | ---- |
| AC-1 | 親タスクの責務が pointer / orchestration / sync policy に限定される  | `index.md` と Phase 1/2 成果物を確認                    | 充足 |
| AC-2 | 04A / 04B / 04C の canonical path が parent spec に固定される        | `index.md` と `child-workflow-linkage-matrix.md` を確認 | 充足 |
| AC-3 | 04A が 04B / 04C を block し、04B / 04C が並列実行可能と明記される   | Phase 1/2 と master index を確認                        | 充足 |
| AC-4 | `aiworkflow-requirements` の抽出セットと Phase 12 同期先が明記される | `index.md` と Phase 12 spec を確認                      | 充足 |
| AC-5 | Phase 11 で新規 UI 撮影を行わず、child evidence 継承を検証する       | Phase 11 spec と child workflow evidence を確認         | 充足 |
| AC-6 | commit / PR 禁止、Phase 1-3 先行、Atent Team lane 分離が埋め込まれる | `index.md` と Phase 1-3 spec を確認                     | 充足 |

## user policy

- 実装前に要件定義と設計を完了する。
- テストは設計を前提に作成する。
- 並列化は lane 単位でのみ許可する。
- commit / PR は本 task では実施しない。

## 補足

本 task の「実装」は docs と台帳の更新を意味し、アプリケーションコード実装は含まない。
