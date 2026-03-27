# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 9                                          |
| 機能名 | execution-governance-and-handoff-alignment |
| 作成日 | 2026-03-26                                 |

## 目的

API primary / handoff secondary / approval-disclosure separation / consumer auth guard / visible handoff の品質条件が崩れていないことを確認する。

## 実行タスク

- route priority と early return を再点検する
- approval / disclosure / manual boundary を確認する
- shared contract 再利用と public surface 到達性を確認する

## 品質観点

- `integrated_api` が正規レーンとして扱われている
- `terminal_handoff` は user-operated fallback としてのみ使われる
- consumer auth token が API key として流用されない
- approval は token enforcement、disclosure は説明責務として分離されている
- Skill Creator UI で handoff が visible になり、console-only で終わらない

## 参照資料

| 資料名              | パス                             | 説明           |
| ------------------- | -------------------------------- | -------------- |
| Phase 5 実装        | `phase-5-implementation.md`      | 実装対象       |
| Phase 6 拡充        | `phase-6-test-expansion.md`      | edge case      |
| Phase 7 coverage    | `phase-7-coverage-check.md`      | coverage 観点  |
| Phase 8 refactoring | `phase-8-refactoring.md`         | 命名と責務整理 |
| test matrix         | `outputs/phase-4/test-matrix.md` | 検証一覧       |

## 実行手順

### ステップ1: route / handoff / guard を確認する

- route priority と early return を確認する
- consumer auth guard と sanitize が authority 側にあることを確認する

### ステップ2: approval / disclosure / visible handoff を確認する

- approval / disclosure separation を確認する
- Skill Creator UI が console-only handoff を許容していないことを確認する

## 公式照合観点

- `workflow-ai-runtime-execution-responsibility-realignment.md` と矛盾しない
- `api-ipc-system-core.md` の approval / disclosure contract と矛盾しない
- `ui-ux-agent-execution-core.md` の Manual Boundary MB-1〜MB-4 を破っていない
- `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001` の drift 解消方針と整合している

## 成果物

| 成果物                 | パス                           | 説明               |
| ---------------------- | ------------------------------ | ------------------ |
| quality assurance note | `phase-9-quality-assurance.md` | 品質観点と照合結果 |

## 統合テスト連携

- Runtime policy / approval / disclosure / visible handoff の 4 群を回帰観点へ残す
- Task08 着手前の gate として consumer auth guard 維持を確認する

## 完了条件

- [ ] route priority が明確
- [ ] approval / disclosure / manual boundary が読み取れる
- [ ] shared contract と public surface の drift がない
- [ ] visible handoff が品質条件に含まれている
- [ ] **本Phase内の全タスクを100%実行完了**
