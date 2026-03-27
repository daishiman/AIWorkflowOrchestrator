# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                                                |
| ------ | ----------------------------------------------------------------- |
| Phase  | 9                                                                 |
| 機能名 | task-imp-runtime-policy-centralization-implementation-closure-001 |
| 作成日 | 2026-03-27                                                        |

## 目的

コード、shared 契約、テスト、cleanup 条件の 4 観点で品質ゲートを通す。

## 実行タスク

- command suite の完了条件を確認する
- shared / preload / IPC drift がないか確認する
- cleanup 条件の premature judgement がないか確認する
- same-wave sync に必要な文書更新対象を洗い出す

## 参照資料

| 資料名  | パス                        | 説明                |
| ------- | --------------------------- | ------------------- |
| Phase 6 | `phase-6-test-expansion.md` | 回帰観点            |
| Phase 7 | `phase-7-coverage-check.md` | coverage / evidence |
| Phase 8 | `phase-8-refactoring.md`    | cleanup 境界        |

## 成果物

| 成果物              | パス                                     | 説明             |
| ------------------- | ---------------------------------------- | ---------------- |
| quality gate report | `outputs/phase-9/quality-gate-report.md` | 判定結果と残課題 |

### 前Phase成果物の再利用

- Phase 5: `outputs/phase-5/implementation-order.md` を expected touched area の照合表に使う。
- Phase 7: `outputs/phase-7/coverage-and-evidence-plan.md` を quality gate の証跡一覧に使う。
- Phase 8: `outputs/phase-8/cleanup-sequencing.md` を premature cleanup 判定の根拠に使う。

## 統合テスト連携

- command suite は typecheck / targeted vitest / desktop test の役割を分けて記録する。
- drift 確認は import path と IPC channel 名の両方を含める。
- same-wave sync 対象は Phase 12 へそのまま渡せる粒度で残す。

## 完了条件

- [ ] command suite と判定基準が整理されている
- [ ] shared / preload / IPC drift 有無が確認されている
- [ ] cleanup 条件の premature judgement が除外されている
- [ ] Phase 12 へ渡す文書更新対象が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**
