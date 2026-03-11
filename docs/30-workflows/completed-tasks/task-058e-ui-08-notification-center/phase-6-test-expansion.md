# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 6                                   |
| 機能名 | task-058e-ui-08-notification-center |
| 作成日 | 2026-03-11                          |
| 前提   | Phase 5                             |

## 目的

Phase 5 の差分実装に対して、回帰・a11y・integration の観点を拡充する。056c 由来の通知ドメイン回帰を 058e 補完で壊さない証跡を集める。

## 実行タスク

- regression追加: dedupe、100件保持、mark all、delete、push 競合を拡充する。
- accessibility追加: Escape、focus trap、live region、icon-only label を拡充する。
- integration追加: preload / main / renderer の delete フローを拡充する。
- responsive追加: desktop / tablet / mobile の表示条件を拡充する。

## 参照資料

| 参照資料           | パス                                                                               | 説明           |
| ------------------ | ---------------------------------------------------------------------------------- | -------------- |
| Phase 5 実装       | `outputs/phase-5/implementation-summary.md`                                        | 実装対象       |
| Phase 4 ケース     | `outputs/phase-4/integration-test-matrix.md`                                       | 接続観点       |
| 056c 既存 workflow | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/index.md` | 既存回帰       |
| P50差分収束計画    | `outputs/phase-5/p50-gap-closure-plan.md`                                          | Phase 5 成果物 |
| IPC差分対応        | `outputs/phase-5/ipc-channel-migration.md`                                         | Phase 5 成果物 |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                            | Phase 4 成果物 |
| テストケース       | `outputs/phase-4/test-cases.md`                                                    | Phase 4 成果物 |

## 実行手順

### ステップ1: 回帰ケース拡張

| 領域  | ケース                                           |
| ----- | ------------------------------------------------ |
| store | push 後の dedupe、100件超過、expanded reset      |
| UI    | title 統一、clear all 非表示、relative time 表示 |
| IPC   | delete validation、sender 検証、sanitized error  |

### ステップ2: a11y / responsive 拡張

| 領域    | ケース                                           |
| ------- | ------------------------------------------------ |
| a11y    | Escape、Tab wrap、`aria-labelledby`、`aria-live` |
| desktop | right aligned popover                            |
| tablet  | Bell 下 360px popover                            |
| mobile  | center overlay、safe area、close 導線            |

## 統合テスト連携

| 観点            | 内容                                      |
| --------------- | ----------------------------------------- |
| push 連携       | initial sync と push の競合で重複しない   |
| delete 連携     | item swipe から main deletion まで通る    |
| a11y 連携       | keyboard 操作だけで既読化と close が可能  |
| responsive 連携 | 3 幅で overlay と anchor 挙動が破綻しない |

## 成果物

| 成果物                 | パス                                     | 説明             |
| ---------------------- | ---------------------------------------- | ---------------- |
| 回帰マトリクス         | `outputs/phase-6/regression-matrix.md`   | 回帰一覧         |
| アクセシビリティケース | `outputs/phase-6/accessibility-cases.md` | a11y ケース      |
| 統合テスト結果         | `outputs/phase-6/integration-test.md`    | integration 結果 |

## 完了条件

- [ ] store / UI / IPC の回帰ケースを拡充している
- [ ] a11y と responsive のケースを拡充している
- [ ] delete フローの integration 観点を定義している
- [ ] 056c 回帰を保持する観点を含めている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 回帰ケース拡張
2. a11y ケース拡張
3. responsive ケース拡張
4. integration 結果整理
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-6/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 6 と整合している

## 次のPhase

[Phase 7: テストカバレッジ確認](./phase-7-coverage-check.md)
