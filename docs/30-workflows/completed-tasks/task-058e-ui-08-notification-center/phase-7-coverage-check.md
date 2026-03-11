# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 7                                   |
| 機能名 | task-058e-ui-08-notification-center |
| 作成日 | 2026-03-11                          |
| 前提   | Phase 5, Phase 6                    |

## 目的

058e 差分の coverage gate を固定し、store / UI / IPC の不足を数値で判定する。056c 既存テストに依存しすぎず、058e 固有差分が coverage で見える状態を作る。

## 実行タスク

- 対象範囲固定: NotificationCenter 系 file と notification handler 差分の対象を固定する。
- 数値判定: line / branch / function の下限を固定する。
- ギャップ抽出: swipe delete、Portal、a11y の未達箇所を抽出する。

## 参照資料

| 参照資料               | パス                                                                        | 説明           |
| ---------------------- | --------------------------------------------------------------------------- | -------------- |
| Phase 5 実装           | `outputs/phase-5/implementation-summary.md`                                 | 実装結果       |
| Phase 6 回帰           | `outputs/phase-6/regression-matrix.md`                                      | 対象ケース     |
| Phase 6 integration    | `outputs/phase-6/integration-test.md`                                       | 接続結果       |
| quality 正本           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 下限基準       |
| アクセシビリティケース | `outputs/phase-6/accessibility-cases.md`                                    | Phase 6 成果物 |

## 実行手順

### ステップ1: coverage gate 固定

| 指標     | 下限 |
| -------- | ---- |
| Line     | 80   |
| Branch   | 60   |
| Function | 80   |

### ステップ2: 058e 固有ギャップ抽出

| 領域         | 確認対象                      |
| ------------ | ----------------------------- |
| swipe delete | gesture と delete mutation    |
| Portal       | popover open / close と focus |
| a11y         | keyboard と `aria-*`          |
| P50 cleanup  | clear all 非表示、title 統一  |

## 統合テスト連携

| 観点     | 内容                                               |
| -------- | -------------------------------------------------- |
| Renderer | component 群の branch を確認する                   |
| IPC      | delete handler と preload API の branch を確認する |
| Store    | dedupe / delete / mark all の function を確認する  |

## 成果物

| 成果物             | パス                                   | 説明     |
| ------------------ | -------------------------------------- | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`   | 数値結果 |
| カバレッジ不足一覧 | `outputs/phase-7/coverage-gap-list.md` | 未達箇所 |

## 完了条件

- [ ] coverage gate の数値を固定している
- [ ] 058e 固有ギャップを抽出している
- [ ] store / UI / IPC の 3 層を coverage 対象に入れている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 対象範囲固定
2. gate 数値固定
3. gap 抽出
4. 成果物整理
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-7/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 7 と整合している

## 次のPhase

[Phase 8: リファクタリング](./phase-8-refactoring.md)
