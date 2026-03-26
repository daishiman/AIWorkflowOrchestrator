# Requirements Definition

## 概要

TASK-SDK-01 の Phase 12 close-out を current facts へ揃え直しつつ、ユーザー指示で不足していた `packages/shared` / `apps/desktop` の manifest hardening も同一ターンで実装する follow-up workflow である。

## 要件

| 区分  | 内容                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------- |
| FR-1  | 4点同期対象を固定する                                                                                     |
| FR-2  | implementation guide の Part 1 / Part 2 検証を含める                                                      |
| FR-3  | Step 1-A〜1-C / Step 2 の証跡出力先を固定する                                                             |
| FR-4  | backlog / completed ledger / lessons の整合を取る                                                         |
| FR-5  | `ManifestLoader` の参照整合 hardening と cache hardening を `packages/shared` / `apps/desktop` に反映する |
| NFR-1 | commit、PR、push を行わない                                                                               |
| NFR-2 | no-op は理由付きで記録する                                                                                |

## 受入基準

- AC-1: 対象ファイル一覧がある
- AC-2: Step 1 / Step 2 の順序がある
- AC-3: backlog と canonical path が接続されている
- AC-4: unassigned-task 監査基準がある
- AC-5: Phase 13 blocked がある
