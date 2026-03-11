# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                          |
| ------ | ------------------------------------------- |
| Phase  | 8                                           |
| 機能名 | task-058e-ui-08-notification-center         |
| 作成日 | 2026-03-11                                  |
| 前提   | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7 |

## 目的

Phase 5 までで差分収束した実装から、責務混在と重複ロジックを外し、056c ドメインと 058e UI の境界を明確に保つ。

## 実行タスク

- component境界整理: Bell shell と Popover 本体を分離する。
- helper整理: relative time、gesture、focus を helper / hook に分離する。
- IPC境界整理: delete 追加で増えた main / preload / renderer 責務を再点検する。
- P50痕跡整理: clear all 依存コード、旧 title、旧 timestamp 表示を除去する。

## 参照資料

| 参照資料           | パス                                        | 説明           |
| ------------------ | ------------------------------------------- | -------------- |
| Phase 1 要件       | `outputs/phase-1/scope-definition.md`       | 境界条件       |
| Phase 2 設計       | `outputs/phase-2/component-design.md`       | 目標構造       |
| Phase 5 実装       | `outputs/phase-5/p50-gap-closure-plan.md`   | 解消差分       |
| Phase 6 拡充       | `outputs/phase-6/regression-matrix.md`      | 回帰観点       |
| Phase 7 coverage   | `outputs/phase-7/coverage-gap-list.md`      | 未達箇所       |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| IPC差分対応        | `outputs/phase-5/ipc-channel-migration.md`  | Phase 5 成果物 |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`        | Phase 7 成果物 |

## 実行手順

### ステップ1: 責務境界の再点検

| 領域     | 点検内容                                                   |
| -------- | ---------------------------------------------------------- |
| renderer | UI shell と domain state access が混ざっていないか確認する |
| preload  | notification API 公開面が最小公開か確認する                |
| main     | handler と service の責務が分離しているか確認する          |

### ステップ2: 旧実装痕跡の除去

| 痕跡              | 対応                       |
| ----------------- | -------------------------- |
| clear all UI      | 参照とテストを削除する     |
| title「通知履歴」 | 文言を削除する             |
| 固定日時 helper   | 相対時刻 helper へ統一する |

## 統合テスト連携

| 観点       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Renderer   | component 分割後も Bell から close までつながる     |
| IPC        | delete flow の責務が handler / service に分離される |
| Regression | 056c の dedupe / 100件保持が維持される              |

## 成果物

| 成果物           | パス                                    | 説明     |
| ---------------- | --------------------------------------- | -------- |
| リファクタ記録   | `outputs/phase-8/refactoring-log.md`    | 変更理由 |
| 責務境界チェック | `outputs/phase-8/boundary-checklist.md` | 境界確認 |

## 完了条件

- [ ] UI / preload / main の責務境界を再点検している
- [ ] 旧実装痕跡の除去対象を記録している
- [ ] 056c ドメイン境界を壊さない条件を記録している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. renderer 境界点検
2. preload / main 境界点検
3. 旧実装痕跡整理
4. 成果物整理
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-8/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 8 と整合している

## 次のPhase

[Phase 9: 品質保証](./phase-9-quality-assurance.md)
